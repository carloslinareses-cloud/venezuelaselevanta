// ============================================================================
// Edge Function: crear-donacion-sumup
// ----------------------------------------------------------------------------
// Crea un checkout de SumUp para una donación de MONTO LIBRE en EUR y devuelve
// { checkoutId }. El frontend monta el widget de SumUp con ese id.
//
// Mismo comercio SumUp que AeroSocio. La llave SECRETA de SumUp vive como
// secret de Supabase (nunca en el frontend).
//
// Secrets (Supabase → Project Settings → Edge Functions → Secrets):
//   SUMUP_API_KEY        (obligatorio)  — llave secreta de SumUp (la misma de AeroSocio)
//   SUMUP_PAY_TO_EMAIL   (opcional)     — email del comercio SumUp que recibe el cobro
//                                         (default: carlos.linares.es@gmail.com, igual que AeroSocio)
//   ALLOWED_ORIGINS      (opcional)     — orígenes permitidos, separados por coma
//
// Deploy:  supabase functions deploy crear-donacion-sumup --no-verify-jwt --project-ref koxrtxplpybdfymgdhhd
// ============================================================================

const SUMUP_CHECKOUTS = "https://api.sumup.com/v0.1/checkouts";

const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ||
  "http://localhost:8080,http://localhost:3000,http://localhost:5173,http://127.0.0.1:8080")
  .split(",").map((s) => s.trim()).filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && (ALLOWED.includes("*") || ALLOWED.includes(origin))
    ? origin
    : (ALLOWED[0] || "*");
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405, origin);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400, origin); }

  const amount = Number(body.amount);
  const currency = String(body.currency || "EUR").toUpperCase();

  if (currency !== "EUR") {
    return json({ error: "SumUp solo procesa EUR en esta campaña." }, 400, origin);
  }
  if (!(amount >= 1) || amount > 10000) {
    return json({ error: "Monto inválido. Debe estar entre 1 y 10.000 €." }, 400, origin);
  }

  const API_KEY = Deno.env.get("SUMUP_API_KEY") || Deno.env.get("SUMUP_SECRET_KEY");
  // Comercio SumUp que recibe el cobro (igual que AeroSocio: pay_to_email).
  const PAY_TO = Deno.env.get("SUMUP_PAY_TO_EMAIL") || "carlos.linares.es@gmail.com";
  if (!API_KEY) {
    return json({ error: "Pagos no configurados (falta SUMUP_API_KEY)." }, 500, origin);
  }

  const nombre = String(body.name || "").slice(0, 80);
  const email = String(body.email || "").slice(0, 120);
  const returnUrl = String(body.returnUrl || "");
  const reference = "DONA-VSL-" + Date.now();

  const checkoutBody: Record<string, unknown> = {
    amount: Math.round(amount * 100) / 100, // SumUp usa unidades mayores (25.00), no céntimos
    currency: "EUR",
    checkout_reference: reference,
    pay_to_email: PAY_TO,
    description: "Donación Venezuela se Levanta" +
      (nombre ? " — " + nombre : email ? " — " + email : ""),
    // Hosted Checkout: SumUp aloja la página de pago y devuelve hosted_checkout_url.
    // Redirigimos ahí (más robusto que el widget embebido, que extensiones/antivirus bloquean).
    hosted_checkout: { enabled: true },
  };
  // redirect_url: a dónde vuelve el donante tras pagar (solo https; en localhost SumUp lo rechaza).
  if (/^https:\/\//i.test(returnUrl)) checkoutBody.redirect_url = returnUrl;

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

  return json({
    hostedUrl: data.hosted_checkout_url || null,
    checkoutId: data.id,
    checkout_reference: reference,
  }, 200, origin);
});
