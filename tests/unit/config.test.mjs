import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadConfig() {
  const context = { window: {} };
  vm.runInNewContext(readFileSync('assets/config.js', 'utf8'), context);
  return context.window.CampaignConfig;
}

test('campaign config has coherent donation setup', () => {
  const cfg = loadConfig();

  assert.ok(cfg.marca.nombre);
  assert.deepEqual(Array.from(cfg.monedas), ['EUR', 'USD']);
  assert.equal(cfg.simbolos.EUR, '€');
  assert.equal(cfg.simbolos.USD, '$');

  for (const moneda of cfg.monedas) {
    assert.ok(Array.isArray(cfg.montos[moneda]), `${moneda} amounts missing`);
    assert.ok(cfg.montos[moneda].every((monto) => monto >= cfg.montoMinimo[moneda]));
  }
});

test('fund allocation sums 100 percent', () => {
  const cfg = loadConfig();
  const total = cfg.usoFondos.reduce((sum, item) => sum + item.pct, 0);
  assert.equal(total, 100);
});

test('public sources are https links with labels', () => {
  const cfg = loadConfig();
  assert.ok(cfg.evento.corte);
  assert.ok(cfg.fuentes.length >= 3);

  for (const fuente of cfg.fuentes) {
    assert.match(fuente.url, /^https:\/\//);
    assert.ok(fuente.etiqueta.length > 10);
  }
});
