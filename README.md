# Venezuela se Levanta

Página web estática de recaudación de ayuda humanitaria para las familias afectadas por
los terremotos en Venezuela. Incluye landing, widget de donación, retorno de pago,
fuentes públicas, controles de transparencia y pruebas automatizadas.

## Estructura

```text
venezuela-se-levanta/
├── index.html
├── gracias.html
├── assets/
│   ├── styles.css
│   ├── config.js
│   ├── payments.js
│   ├── app.js
│   ├── hero-relief.webp
│   └── favicon.svg
├── supabase/functions/crear-donacion-sumup/index.ts
├── tests/
├── package.json
└── playwright.config.mjs
```

## Desarrollo local

```bash
npm install
npm run serve
```

Abre `http://127.0.0.1:53173/`.

## Pruebas

```bash
npm test
```

La suite ejecuta:

- Unit/static: configuración, ruteo de pagos, assets locales, codificación UTF-8 y CORS de producción.
- E2E: landing, formulario de donación, fallback USD, errores SumUp, navegación móvil y responsive.
- Accesibilidad: axe/WCAG en desktop y móvil, sin violaciones serias.

Comandos separados:

```bash
npm run test:unit
npm run test:e2e
npm run test:a11y
```

## Personalizar campaña

Todo el contenido editable vive en `assets/config.js`:

- `marca`: nombre, lema, correo, web y redes.
- `meta`: objetivo, recaudado y número de donantes.
- `evento`: zona, fecha, magnitud, cifras y fecha de corte.
- `usoFondos`: distribución porcentual de la ayuda; debe sumar 100.
- `niveles`: impacto estimado de cada monto.
- `transparencia`, `principios` y `fuentes`: rendición, controles y enlaces públicos.
- `metodosAlternativos`: PayPal, Zelle, pago móvil u otros métodos manuales.

## Pagos

`assets/payments.js` enruta por moneda:

- EUR usa SumUp mediante la Edge Function `crear-donacion-sumup`.
- USD está como `ninguno` hasta conectar Stripe u otro proveedor.

La llave pública/anon de Supabase puede vivir en el frontend. La llave secreta de
SumUp debe estar solo como secret de Supabase (`SUMUP_API_KEY` o `SUMUP_SECRET_KEY`).

### Edge Function

Archivo: `supabase/functions/crear-donacion-sumup/index.ts`.

Secrets necesarios:

```bash
supabase secrets set SUMUP_API_KEY="<llave-secreta-sumup>" --project-ref koxrtxplpybdfymgdhhd
supabase secrets set SUMUP_PAY_TO_EMAIL="<email-comercio>" --project-ref koxrtxplpybdfymgdhhd
supabase secrets set ALLOWED_ORIGINS="https://carloslinareses-cloud.github.io,https://venezuelaselevanta.org,http://127.0.0.1:53173" --project-ref koxrtxplpybdfymgdhhd
```

Deploy:

```bash
supabase functions deploy crear-donacion-sumup --no-verify-jwt --project-ref koxrtxplpybdfymgdhhd
```

## Producción

El sitio no requiere build. Para GitHub Pages, publica la rama `main` desde la raíz
del repositorio. URL esperada:

```text
https://carloslinareses-cloud.github.io/venezuelaselevanta/
```

Antes de aceptar donaciones reales:

- Confirma que `ALLOWED_ORIGINS` incluye el dominio final.
- Revisa que `SUMUP_PAY_TO_EMAIL` sea el comercio correcto.
- Sustituye correo, redes, meta recaudada y métodos alternativos por datos reales.
- Mantén las cifras de `evento` actualizadas con fecha de corte y fuente pública.
