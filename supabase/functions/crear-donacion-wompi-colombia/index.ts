// ============================================================================
// Edge Function: crear-donacion-wompi-colombia
// ----------------------------------------------------------------------------
// POST       -> creates signed Wompi checkout params for COP donations.
// POST event -> receives Wompi webhook events and marks approved payments.
// GET ?id=   -> verifies a Wompi transaction and marks the donation as paid.
// GET ?feed= -> latest paid donations for the live feed.
//
// Secrets: WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_INTEGRITY_SECRET,
//          WOMPI_EVENTS_SECRET, ALLOWED_ORIGINS (optional).
//          SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.
// Deploy: supabase functions deploy crear-donacion-wompi-colombia --no-verify-jwt --project-ref koxrtxplpybdfymgdhhd
// ============================================================================

const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ||
  "http://localhost:8080,http://localhost:3000,http://localhost:5173,http://127.0.0.1:8080,http://127.0.0.1:53173,https://carloslinareses-cloud.github.io,https://sumatevzla.org,https://www.sumatevzla.org")
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

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

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
  } catch (e) {
    console.error("sbInsert:", e);
  }
}

async function sbMarcarPagada(ref: string) {
  if (!SB_URL || !SB_KEY) return;
  try {
    await fetch(SB_URL + "/rest/v1/donaciones?ref=eq." + encodeURIComponent(ref) + "&estado=eq.pendiente", {
      method: "PATCH",
      headers: sbHeaders({ "Prefer": "return=minimal" }),
      body: JSON.stringify({ estado: "pagado", pagado_en: new Date().toISOString() }),
    });
  } catch (e) {
    console.error("sbMarcar:", e);
  }
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
      moneda: d.moneda || "COP",
      cuando: d.pagado_en || d.creado,
    }));
  } catch (e) {
    console.error("sbFeed:", e);
    return [];
  }
}

function wompiPublicKey(): string {
  return Deno.env.get("WOMPI_PUBLIC_KEY") || "";
}

function wompiAuthKey(): string {
  return Deno.env.get("WOMPI_PRIVATE_KEY") || Deno.env.get("WOMPI_PUBLIC_KEY") || "";
}

function wompiApiBase(publicKey: string): string {
  const configured = Deno.env.get("WOMPI_API_BASE");
  if (configured) return configured.replace(/\/$/, "");
  return publicKey.startsWith("pub_test_") ? "https://sandbox.wompi.co/v1" : "https://production.wompi.co/v1";
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function pathValue(root: unknown, path: string): unknown {
  return path.split(".").reduce((value: unknown, key) => {
    if (value && typeof value === "object" && key in value) return (value as Record<string, unknown>)[key];
    return undefined;
  }, root);
}

async function eventChecksumIsValid(eventBody: Record<string, unknown>): Promise<boolean> {
  const eventsSecret = Deno.env.get("WOMPI_EVENTS_SECRET") || "";
  const signature = eventBody.signature as Record<string, unknown> | undefined;
  const properties = signature && Array.isArray(signature.properties) ? signature.properties.map(String) : [];
  const checksum = String((signature && signature.checksum) || "");
  const timestamp = eventBody.timestamp;
  if (!eventsSecret || !properties.length || !checksum || timestamp === undefined || timestamp === null) return false;

  const data = eventBody.data || {};
  const values = properties.map((property) => {
    const value = pathValue(data, property);
    return value === undefined || value === null ? "" : String(value);
  }).join("");
  const expected = await sha256Hex(values + String(timestamp) + eventsSecret);
  return expected.toLowerCase() === checksum.toLowerCase();
}

async function handleWompiEvent(eventBody: Record<string, unknown>, origin: string | null): Promise<Response> {
  if (!(await eventChecksumIsValid(eventBody))) return json({ error: "Evento Wompi no autorizado" }, 401, origin);
  if (eventBody.environment && String(eventBody.environment) !== "prod") return json({ received: true, ignored: "environment" }, 200, origin);
  if (eventBody.event !== "transaction.updated") return json({ received: true, ignored: "event" }, 200, origin);

  const data = eventBody.data as Record<string, unknown> | undefined;
  const tx = data && data.transaction as Record<string, unknown> | undefined;
  const status = tx && tx.status ? String(tx.status) : "";
  const reference = tx && tx.reference ? String(tx.reference) : "";
  if (status === "APPROVED" && reference.startsWith("DONA-SVZLA-CO-")) await sbMarcarPagada(reference);

  return json({ received: true, paid: status === "APPROVED", reference }, 200, origin);
}

function safeReturnUrl(value: unknown): string {
  const raw = String(value || "");
  if (/^https:\/\//i.test(raw)) return raw;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(raw)) return raw;
  return "";
}

async function verificarTransaccion(id: string, origin: string | null): Promise<Response> {
  const publicKey = wompiPublicKey();
  const authKey = wompiAuthKey();
  if (!publicKey || !authKey) return json({ paid: false, status: "NO_CONFIG" }, 500, origin);

  try {
    const r = await fetch(wompiApiBase(publicKey) + "/transactions/" + encodeURIComponent(id), {
      headers: { "Authorization": "Bearer " + authKey },
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return json({ paid: false, status: "ERROR" }, 502, origin);

    const tx = data && data.data ? data.data : {};
    const status = tx.status ? String(tx.status) : "NOT_FOUND";
    const reference = tx.reference ? String(tx.reference) : "";
    if (status === "APPROVED" && reference.startsWith("DONA-SVZLA-CO-")) await sbMarcarPagada(reference);
    return json({ paid: status === "APPROVED", status, reference }, 200, origin);
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
    const id = u.searchParams.get("id");
    if (id) return verificarTransaccion(id, origin);
    return json({ error: "Falta parametro id o feed" }, 400, origin);
  }

  if (req.method !== "POST") return json({ error: "Metodo no permitido" }, 405, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON invalido" }, 400, origin);
  }

  if (body.event && body.signature && body.data) return handleWompiEvent(body, origin);

  const publicKey = wompiPublicKey();
  const integritySecret = Deno.env.get("WOMPI_INTEGRITY_SECRET") || "";
  if (!publicKey || !integritySecret) {
    return json({ error: "Pagos Wompi no configurados. Faltan WOMPI_PUBLIC_KEY y WOMPI_INTEGRITY_SECRET en Supabase." }, 500, origin);
  }

  const amount = Math.round(Number(body.amount));
  const currency = String(body.currency || "COP").toUpperCase();
  if (currency !== "COP") return json({ error: "Wompi Colombia solo procesa COP en esta pagina." }, 400, origin);
  if (!(amount >= 5000) || amount > 100000000) {
    return json({ error: "Monto invalido. Debe estar entre COP $5.000 y COP $100.000.000." }, 400, origin);
  }

  const returnUrl = safeReturnUrl(body.returnUrl);
  if (!returnUrl) return json({ error: "URL de retorno invalida." }, 400, origin);

  const reference = "DONA-SVZLA-CO-" + Date.now() + "-" + crypto.randomUUID().slice(0, 8);
  const amountInCents = amount * 100;
  const signature = await sha256Hex(reference + amountInCents + "COP" + integritySecret);
  const nombre = String(body.name || "").slice(0, 80).trim();
  const anonimo = !!body.anonimo;

  await sbInsertDonacion({
    ref: reference,
    monto: amount,
    moneda: "COP",
    nombre: nombre || null,
    anonimo,
    estado: "pendiente",
  });

  return json({
    provider: "wompi",
    publicKey,
    currency: "COP",
    amountInCents,
    reference,
    signature,
    redirectUrl: returnUrl,
  }, 200, origin);
});
