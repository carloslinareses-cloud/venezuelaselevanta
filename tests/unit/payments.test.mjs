import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadPayments(overrides = {}) {
  const calls = [];
  const location = { href: overrides.href || 'https://sumatevzla.org/index.html' };
  const context = {
    window: { location },
    location,
    URL,
    document: overrides.document || {},
    setTimeout: () => 0,
    fetch: async (url, options) => {
      calls.push({ url, options });
      return overrides.fetchResponse || {
        ok: true,
        json: async () => ({ hostedUrl: 'https://checkout.example/pay/123', checkoutId: 'chk_123' }),
      };
    },
  };
  vm.runInNewContext(readFileSync('assets/payments.js', 'utf8'), context);
  context.window.fetch = context.fetch;
  return { payments: context.window.Payments, config: context.window.PaymentConfig, calls, location };
}

test('routes currencies to configured providers', async () => {
  const { payments } = loadPayments();

  assert.equal(payments.proveedorDe('EUR'), 'sumup');
  assert.equal(payments.proveedorDe('USD'), 'ninguno');
  assert.equal(payments.configurado('EUR'), true);
  assert.equal(payments.configurado('USD'), false);
  const fallback = await payments.iniciarDonacion({ moneda: 'USD' });
  assert.equal(fallback.estado, 'sin_configurar');
});

test('SumUp request is sent to Supabase Edge Function and redirects to hosted checkout', async () => {
  const { payments, config, calls, location } = loadPayments();
  const result = await payments.iniciarDonacion({
    monto: 25,
    moneda: 'EUR',
    donante: { nombre: 'Ana', email: 'ana@example.com', mensaje: 'Fuerza', anonimo: false },
  });

  assert.equal(result.estado, 'redirigiendo');
  assert.equal(location.href, 'https://checkout.example/pay/123');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${config.supabase.url}/functions/v1/${config.supabase.funcionDonacion}`);
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, `Bearer ${config.supabase.anonKey}`);

  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.amount, 25);
  assert.equal(body.currency, 'EUR');
  assert.equal(body.email, 'ana@example.com');
  assert.equal(body.returnUrl, 'https://sumatevzla.org/gracias.html');
});

test('SumUp surfaces backend errors safely', async () => {
  const { payments } = loadPayments({
    fetchResponse: {
      ok: false,
      json: async () => ({ error: 'Pagos no configurados.' }),
    },
  });

  await assert.rejects(
    () => payments.iniciarDonacion({ monto: 25, moneda: 'EUR', donante: {} }),
    /Pagos no configurados/,
  );
});
