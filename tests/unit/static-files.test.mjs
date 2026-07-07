import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const textFiles = [
  'index.html',
  'gracias.html',
  'colombia/index.html',
  'colombia/gracias.html',
  'README.md',
  'assets/app.js',
  'assets/config.js',
  'assets/config-colombia.js',
  'assets/payments.js',
  'assets/payment-config-colombia.js',
  'assets/styles.css',
  'supabase/functions/crear-donacion-sumup/index.ts',
  'supabase/functions/crear-donacion-wompi-colombia/index.ts',
];

test('text files do not contain mojibake or replacement characters', () => {
  const bad = /Ã.|Â.|â€|â€™|â€œ|â€�|ðŸ|�/;
  for (const file of textFiles) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), bad, `${file} contains encoding artifacts`);
  }
});

test('local assets referenced by html exist', () => {
  for (const file of ['index.html', 'gracias.html', 'colombia/index.html', 'colombia/gracias.html']) {
    const dom = new JSDOM(readFileSync(file, 'utf8'));
    const document = dom.window.document;
    const refs = [
      ...Array.from(document.querySelectorAll('[href]')).map((el) => el.getAttribute('href')),
      ...Array.from(document.querySelectorAll('[src]')).map((el) => el.getAttribute('src')),
      ...Array.from(document.querySelectorAll('[content^="assets/"]')).map((el) => el.getAttribute('content')),
    ].filter(Boolean);

    for (const ref of refs) {
      if (/^(https?:|mailto:|#)/.test(ref)) continue;
      const clean = ref.split('#')[0].split('?')[0];
      if (!clean || clean.endsWith('.html')) continue;
      assert.ok(existsSync(join(dirname(file), clean)), `${file} references missing asset ${clean}`);
    }
  }
});

test('production CORS defaults include the expected GitHub Pages origin', () => {
  const edgeFunction = readFileSync('supabase/functions/crear-donacion-sumup/index.ts', 'utf8');
  assert.match(edgeFunction, /https:\/\/carloslinareses-cloud\.github\.io/);
});
