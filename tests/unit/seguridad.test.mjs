import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Comprobaciones de seguridad sobre el código que maneja dinero.
 *
 * No ejecutan las funciones (corren en Deno), pero verifican que las
 * protecciones estén presentes y no se pierdan en un cambio futuro.
 */

const sumup = readFileSync('supabase/functions/crear-donacion-sumup/index.ts', 'utf8');
const wompi = readFileSync('supabase/functions/crear-donacion-wompi-colombia/index.ts', 'utf8');

test('la URL de retorno se valida contra los orígenes permitidos (no redirección abierta)', () => {
  for (const [nombre, src] of [['sumup', sumup], ['wompi', wompi]]) {
    assert.match(
      src,
      /ALLOWED\.includes\(u\.origin\)/,
      `${nombre}: la URL de retorno debe comprobarse contra ALLOWED, no solo que empiece por https`,
    );
    assert.doesNotMatch(
      src,
      /if \(\/\^https:\\\/\\\/\/i\.test\(raw\)\) return raw;/,
      `${nombre}: quedó la validación antigua que aceptaba cualquier URL https`,
    );
  }
});

test('no hay correos ni secretos escritos en el código de las funciones', () => {
  for (const [nombre, src] of [['sumup', sumup], ['wompi', wompi]]) {
    assert.doesNotMatch(src, /@gmail\.com|@hotmail\.com|@outlook\.com/, `${nombre}: hay un correo personal en el código`);
    assert.doesNotMatch(src, /sup_sk_[A-Za-z0-9]/, `${nombre}: hay una clave secreta de SumUp en el código`);
    assert.doesNotMatch(src, /prv_prod_|prv_test_/, `${nombre}: hay una clave privada de Wompi en el código`);
    assert.doesNotMatch(src, /eyJhbGciOi/, `${nombre}: hay un token JWT en el código`);
  }
});

test('el importe se valida antes de crear el cobro', () => {
  assert.match(sumup, /amount >= 1|amount < 1/, 'sumup: falta el mínimo del importe');
  assert.match(sumup, /amount > 10000/, 'sumup: falta el máximo del importe');
});

test('el aviso de Wompi se comprueba con su firma', () => {
  assert.match(wompi, /eventChecksumIsValid/, 'wompi: el webhook debe validar la firma del evento');
});

test('el nombre del donante se limpia antes de guardarlo', () => {
  for (const [nombre, src] of [['sumup', sumup], ['wompi', wompi]]) {
    assert.match(src, /function limpiarNombre/, `${nombre}: falta la limpieza del nombre`);
    assert.match(
      src,
      /const nombre = limpiarNombre\(body\.name\)/,
      `${nombre}: el nombre debe guardarse ya limpio`,
    );
    assert.doesNotMatch(
      src,
      /const nombre = String\(body\.name \|\| ""\)\.slice/,
      `${nombre}: quedó la versión antigua sin limpiar`,
    );
  }
});

test('la limpieza del nombre quita etiquetas HTML de verdad', () => {
  // Se extrae la función del código y se ejecuta, para probar el comportamiento real.
  const cuerpo = sumup.slice(sumup.indexOf('function limpiarNombre'));
  const fin = cuerpo.indexOf('\n}\n') + 2;
  const fuente = cuerpo.slice(0, fin).replace(/: unknown|: string/g, '');
  // eslint-disable-next-line no-new-func
  const limpiar = new Function(`${fuente}; return limpiarNombre;`)();

  assert.equal(limpiar('<img src=x onerror=alert(1)>Juan'), 'img src=x onerror=alert(1)Juan');
  assert.ok(!limpiar('<script>alert(1)</script>').includes('<'), 'no deben quedar signos de etiqueta');
  assert.equal(limpiar('  Ana   María  '), 'Ana María');
  assert.equal(limpiar(null), '');
  assert.ok(limpiar('x'.repeat(200)).length <= 80, 'el nombre debe recortarse a 80 caracteres');
});
