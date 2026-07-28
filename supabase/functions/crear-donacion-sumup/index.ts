// ============================================================================
// Edge Function: crear-donacion-sumup
// ----------------------------------------------------------------------------
//  POST                 → crea un checkout SumUp (Hosted Checkout) + registra la
//                         donación como 'pendiente' en Supabase. Devuelve
//                         { hostedUrl, checkoutId, checkout_reference }.
//  GET  ?ref=<ref>      → VERIFICA en SumUp si ese checkout está PAID. Si lo está,
//                         marca la donación como 'pagado'. Devuelve { paid, status }.
//                         (Esto evita que la página de gracias agradezca sin pago.)
//  GET  ?feed=1         → últimas donaciones PAGADAS para el feed en vivo.
//
// Secrets: SUMUP_API_KEY, SUMUP_PAY_TO_EMAIL (opc), ALLOWED_ORIGINS (opc).
//          SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (inyectados por Supabase).
// Deploy: supabase functions deploy crear-donacion-sumup --no-verify-jwt --project-ref koxrtxplpybdfymgdhhd
// ============================================================================

const SUMUP_CHECKOUTS = "https://api.sumup.com/v0.1/checkouts";

const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ||
  "http://localhost:8080,http://localhost:3000,http://localhost:5173,http://127.0.0.1:8080,https://carloslinareses-cloud.github.io,https://sumatevzla.org")
  .split(",").map((s) => s.trim()).filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && (ALLOWED.includes("*") || ALLOWED.includes(origin)) ? origin : (ALLOWED[0] || "*");
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}
/**
 * ¿Es una URL de retorno de un sitio NUESTRO?
 *
 * Antes se aceptaba cualquier URL https, así que un tercero podía crear un enlace
 * de donación que, tras pagar, enviaba al donante a una web suya (estafa usando
 * la marca de la campaña). Ahora solo se admiten los orígenes autorizados.
 */
function returnUrlPermitida(value: unknown): string {
  const raw = String(value || "");
  try {
    const u = new URL(raw);
    const esLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(u.origin);
    if (u.protocol !== "https:" && !esLocal) return "";
    return ALLOWED.includes(u.origin) || esLocal ? raw : "";
  } catch {
    return "";
  }
}

/**
 * Limpia el nombre que escribe el donante antes de guardarlo.
 *
 * La web lo pinta con textContent, así que hoy no se ejecutaría nada; pero un
 * nombre como `<img src=x onerror=...>` guardado tal cual se volvería peligroso
 * en cuanto alguien lo muestre con innerHTML, lo exporte a un PDF o a una hoja
 * de cálculo. Se guarda limpio desde el principio.
 */
function limpiarNombre(value: unknown): string {
  return String(value || "")
    .replace(/[<>]/g, "")                        // nada de etiquetas HTML
    .replace(/[\u0000-\u001F\u007F]/g, "")       // fuera caracteres de control
    .replace(/\s+/g, " ")                        // espacios normalizados
    .trim()
    .slice(0, 80);
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } });
}

// ---- Supabase (service role) para registrar/leer donaciones ----
const SB_URL = Deno.env.get("SUPABASE_URL") || "";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
function sbHeaders(extra: Record<string, string> = {}) {
  return { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json", ...extra };
}
async function sbInsertDonacion(row: Record<string, unknown>) {
  if (!SB_URL || !SB_KEY) return;
  try {
    await fetch(SB_URL + "/rest/v1/donaciones", {
      method: "POST",
      headers: sbHeaders({ "Prefer": "resolution=ignore-duplicates,return=minimal" }),
      body: JSON.stringify(row),
    });
  } catch (e) { console.error("sbInsert:", e); }
}
async function sbMarcarPagada(ref: string) {
  if (!SB_URL || !SB_KEY) return;
  try {
    await fetch(SB_URL + "/rest/v1/donaciones?ref=eq." + encodeURIComponent(ref) + "&estado=eq.pendiente", {
      method: "PATCH",
      headers: sbHeaders({ "Prefer": "return=minimal" }),
      body: JSON.stringify({ estado: "pagado", pagado_en: new Date().toISOString() }),
    });
  } catch (e) { console.error("sbMarcar:", e); }
}
async function sbFeed(): Promise<unknown[]> {
  if (!SB_URL || !SB_KEY) return [];
  try {
    const r = await fetch(
      SB_URL + "/rest/v1/donaciones?estado=eq.pagado&select=nombre,anonimo,monto,moneda,creado,pagado_en&order=pagado_en.desc&limit=25",
      { headers: sbHeaders() },
    );
    const list = await r.json().catch(() => []);
    if (!Array.isArray(list)) return [];
    return list.map((d: Record<string, unknown>) => ({
      nombre: (d.anonimo || !d.nombre) ? "Anónimo" : String(d.nombre).slice(0, 40),
      monto: Number(d.monto) || 0,
      moneda: d.moneda || "EUR",
      cuando: d.pagado_en || d.creado,
    }));
  } catch (e) { console.error("sbFeed:", e); return []; }
}

async function verificarYRegistrar(ref: string, origin: string | null): Promise<Response> {
  const API_KEY = Deno.env.get("SUMUP_DONACION_KEY") || Deno.env.get("SUMUP_API_KEY") || Deno.env.get("SUMUP_SECRET_KEY");
  if (!API_KEY) return json({ paid: false, status: "NO_CONFIG" }, 500, origin);
  try {
    const r = await fetch(SUMUP_CHECKOUTS + "?checkout_reference=" + encodeURIComponent(ref), {
      headers: { "Authorization": "Bearer " + API_KEY },
    });
    const list = await r.json().catch(() => []);
    const arr = Array.isArray(list) ? list : [];
    const co = arr.length ? arr[arr.length - 1] : null;
    const status = (co && co.status) ? String(co.status) : "NOT_FOUND";
    if (status === "PAID") await sbMarcarPagada(ref);
    return json({ paid: status === "PAID", status }, 200, origin);
  } catch (_e) {
    return json({ paid: false, status: "ERROR" }, 502, origin);
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });

  if (req.method === "GET") {
    const u = new URL(req.url);
    if (u.searchParams.get("feed") !== null) return json({ donaciones: await sbFeed() }, 200, origin);
    const ref = u.searchParams.get("ref");
    if (ref) return verificarYRegistrar(ref, origin);
    return json({ error: "Falta parámetro ref o feed" }, 400, origin);
  }

  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405, origin);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400, origin); }

  const amount = Number(body.amount);
  const currency = String(body.currency || "EUR").toUpperCase();
  if (currency !== "EUR") return json({ error: "SumUp solo procesa EUR en esta campaña." }, 400, origin);
  if (!(amount >= 1) || amount > 10000) return json({ error: "Monto inválido. Debe estar entre 1 y 10.000 €." }, 400, origin);

  const API_KEY = Deno.env.get("SUMUP_DONACION_KEY") || Deno.env.get("SUMUP_API_KEY") || Deno.env.get("SUMUP_SECRET_KEY");
  // Sin valor por defecto: el correo del comercio se configura como secreto.
  // (Estaba escrito en el código y este repositorio se publica entero en GitHub Pages,
  //  así que quedaba expuesto a cualquiera que leyera el archivo.)
  const PAY_TO = Deno.env.get("SUMUP_PAY_TO_EMAIL") || "";
  if (!API_KEY) return json({ error: "Pagos no configurados (falta SUMUP_API_KEY)." }, 500, origin);
  // Antes de desplegar de nuevo esta función hay que definir el secreto
  // SUMUP_PAY_TO_EMAIL en Supabase; así el correo no viaja en el código público.
  if (!PAY_TO) return json({ error: "Pagos no configurados (falta SUMUP_PAY_TO_EMAIL)." }, 500, origin);

  const nombre = limpiarNombre(body.name);
  const anonimo = !!body.anonimo;
  const returnUrl = String(body.returnUrl || "");
  const reference = "DONA-SVZLA-" + Date.now();
  const montoNum = Math.round(amount * 100) / 100;

  const checkoutBody: Record<string, unknown> = {
    amount: montoNum,
    currency: "EUR",
    checkout_reference: reference,
    pay_to_email: PAY_TO,
    description: "Donación · Súmate VZLA",
    hosted_checkout: { enabled: true },
  };
  // redirect_url con el ref para que la página de gracias VERIFIQUE el pago.
  // Solo se acepta una URL de nuestros propios sitios (evita redirigir a terceros).
  const retornoOk = returnUrlPermitida(returnUrl);
  if (retornoOk) {
    checkoutBody.redirect_url = retornoOk + (retornoOk.includes("?") ? "&" : "?") + "ref=" + encodeURIComponent(reference);
  }

  let resp: Response;
  try {
    resp = await fetch(SUMUP_CHECKOUTS, {
      method: "POST",
      headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(checkoutBody),
    });
  } catch (e) {
    console.error("SumUp fetch error:", e);
    return json({ error: "No se pudo contactar con SumUp." }, 502, origin);
  }

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.error("SumUp checkout error:", resp.status, data);
    const msg = (data && (data.message || data.error_message)) || "SumUp rechazó la creación del checkout.";
    return json({ error: msg }, 502, origin);
  }

  // Registrar la donación como PENDIENTE (se marca 'pagado' al verificar el pago).
  await sbInsertDonacion({ ref: reference, monto: montoNum, moneda: "EUR", nombre: nombre || null, anonimo, estado: "pendiente" });

  return json({
    hostedUrl: data.hosted_checkout_url || null,
    checkoutId: data.id,
    checkout_reference: reference,
  }, 200, origin);
});
