# Venezuela se Levanta 🇻🇪

Página web de recaudación de ayuda humanitaria para las familias afectadas por el
terremoto en Venezuela. Sitio **estático** (HTML/CSS/JS), sin build, listo para
desplegar en GitHub Pages, Cloudflare Pages/Workers o cualquier hosting.

## Estructura

```
venezuela-se-levanta/
├── index.html          ← landing principal (secciones + widget de donación)
├── gracias.html        ← página de agradecimiento (retorno tras pago exitoso)
├── assets/
│   ├── styles.css       ← todo el diseño
│   ├── config.js        ← ⭐ TODO lo editable: marca, meta, montos, datos del evento
│   ├── payments.js      ← ⭐ integración de cobros (aquí van los APIs)
│   ├── app.js           ← lógica (no suele hacer falta tocarlo)
│   └── favicon.svg
└── README.md
```

## 1. Personalizar la campaña — `assets/config.js`

Todo el contenido editable vive en un solo archivo. Ajusta:

- **marca**: nombre, lema, correo, teléfono, web y redes sociales.
- **meta**: objetivo, recaudado, nº de donantes (barra de progreso del hero).
- **montos**: montos sugeridos por moneda (USD / EUR) y monto mínimo.
- **evento**: ⚠️ **rellena con datos reales y verificados** (zona, fecha, magnitud,
  familias afectadas, etc.). Lo que dejes vacío se oculta solo.
- **usoFondos / niveles**: en qué se usa la ayuda y qué logra cada monto.
- **transparencia**: % a la causa y actualizaciones del avance.
- **historias**: testimonios (deja el array vacío para ocultar la sección).
- **metodosAlternativos**: PayPal.me, Zelle, Pago Móvil, etc. (opcional).

## 2. Cobros — `assets/payments.js` (ruteo por moneda)

Los cobros se rutean **por moneda** en `PaymentConfig.proveedorPorMoneda`:

- **EUR → SumUp** (ya cableado; usa el mismo comercio SumUp que AeroSocio).
- **USD → Stripe** (pendiente; muestra un aviso amable hasta configurarlo).

> **Seguridad:** la llave PÚBLICA/anon de Supabase es segura en el front. La
> llave SECRETA de SumUp vive SOLO en la Edge Function (secret de Supabase).

### 2.1 SumUp (EUR) — cómo funciona

Igual que en AeroSocio:

1. El botón de donar llama a `Payments.iniciarDonacion({monto, moneda:'EUR', ...})`.
2. Eso hace `POST` a la Edge Function **`crear-donacion-sumup`** (Supabase), que
   crea un checkout de SumUp por ese monto y devuelve `{ checkoutId }`.
3. La página carga el SDK de SumUp y monta el **widget de tarjeta in-page** en un
   modal. Al pagar con éxito → redirige a `gracias.html`.

### 2.2 Desplegar la Edge Function

La función está en `supabase/functions/crear-donacion-sumup/index.ts`.

```bash
supabase login   # una vez (navegador, o pega un access token sbp_...)

# Desplegar al proyecto (el mismo de AeroSocio)
supabase functions deploy crear-donacion-sumup --project-ref koxrtxplpybdfymgdhhd

# Secrets (reutiliza los de AeroSocio; confirma los nombres exactos)
supabase secrets set SUMUP_API_KEY="<llave-secreta-sumup>" --project-ref koxrtxplpybdfymgdhhd
supabase secrets set SUMUP_MERCHANT_CODE="<merchant_code>"  --project-ref koxrtxplpybdfymgdhhd  # opcional
supabase secrets set ALLOWED_ORIGINS="https://tudominio.com,http://localhost:8080" --project-ref koxrtxplpybdfymgdhhd
```

> Si la función `crear-pago-sumup` de AeroSocio usa OTRO nombre de secret o un
> formato distinto, dímelo (o dame acceso) y ajusto `crear-donacion-sumup` para
> que use exactamente lo mismo.

### 2.3 USD (Stripe, más adelante)

Cambia `proveedorPorMoneda.USD` a `'stripe'` y completa `stripe.publishableKey`
y `stripe.crearSesionUrl` (endpoint que crea la Checkout Session con tu llave
secreta). Retornos: éxito → `gracias.html`, cancelado → `index.html?donacion=cancelada`.

## 3. Probar localmente

Cualquier servidor estático sirve. Por ejemplo:

```bash
npx serve .        # o:  python -m http.server 8080
```

Abre `http://localhost:8080`.

## 4. Desplegar

- **GitHub Pages:** sube el repo y activa Pages sobre la rama principal (raíz `/`).
- **Cloudflare Pages/Workers:** publica el directorio tal cual (no requiere build).

## Checklist antes de publicar

- [ ] Datos del evento **reales y verificados** en `config.js` (fecha, magnitud, cifras).
- [ ] Meta y recaudado reales.
- [ ] Correo, teléfono y redes de contacto correctos.
- [ ] APIs de cobro conectados en `payments.js` (o métodos alternativos cargados).
- [ ] Texto legal / de transparencia revisado por ti.
- [ ] (Opcional) Reemplazar cifras de ejemplo por las reales de la campaña.

---

Marca, textos y diseño creados desde cero para esta campaña. Ajusta lo que quieras.
