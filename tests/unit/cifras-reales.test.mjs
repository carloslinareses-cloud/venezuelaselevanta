import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Las cifras de recaudación deben ser REALES.
 *
 * Un contador inflado destruye la credibilidad de una campaña en cuanto se
 * descubre, así que esta prueba vigila que no se publiquen números "de
 * arranque". Cuando entren donaciones de verdad, se actualizan estos valores
 * y se ajusta la prueba con el motivo del cambio.
 */
function cargarConfig(archivo) {
  const src = readFileSync(archivo, 'utf8');
  const window = {};
  // eslint-disable-next-line no-eval
  eval(src);
  return window.CampaignConfig;
}

for (const archivo of ['assets/config.js', 'assets/config-colombia.js']) {
  test(`${archivo}: lo recaudado y los donantes son cifras reales`, () => {
    const cfg = cargarConfig(archivo);
    assert.ok(cfg && cfg.meta, `${archivo} no expone meta`);

    assert.equal(
      cfg.meta.recaudado,
      0,
      `${archivo}: hay ${cfg.meta.recaudado} como recaudado. Si es una donación real, ` +
        'actualiza esta prueba; si no, debe quedar en 0.',
    );
    assert.equal(
      cfg.meta.donantes,
      0,
      `${archivo}: hay ${cfg.meta.donantes} donantes. Si son reales, actualiza esta prueba.`,
    );
    assert.ok(cfg.meta.objetivo > 0, `${archivo}: la meta debe ser mayor que 0`);
  });
}

test('la campaña de la Torre B no publica cifras a mano', () => {
  const src = readFileSync('assets/campanas.js', 'utf8');
  const window = {};
  // eslint-disable-next-line no-eval
  eval(src);
  const robles = (window.Campanas || []).find((c) => c.id === 'torre-b-robles');
  assert.ok(robles, 'no se encuentra la campaña de la Torre B');
  assert.equal(
    robles.progreso.tipo,
    'api',
    'lo recaudado en la Torre B debe venir de la pasarela de pago, no escrito a mano',
  );
});
