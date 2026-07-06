/* ============================================================================
   config.js — TODO lo editable de la campaña vive aquí.
   Cambia estos valores y la página entera se actualiza sola. No necesitas
   tocar el HTML para ajustar marca, meta, montos o datos del evento.
   ============================================================================ */
window.CampaignConfig = {

  /* ---- Marca ---- */
  marca: {
    nombre: 'Venezuela se Levanta',
    lema: 'Ayuda humanitaria para las familias afectadas por el terremoto',
    // Correo y redes se muestran en el pie de página.
    email: 'contacto@venezuelaselevanta.org',
    telefono: '',              // opcional, ej. '+58 412 000 0000'
    web: 'venezuelaselevanta.org',
    redes: {
      instagram: '',           // ej. 'https://instagram.com/...'
      facebook: '',
      x: '',
      whatsapp: '',            // ej. 'https://wa.me/58412...'
    },
  },

  /* ---- Meta de recaudación (barra de progreso del hero) ---- */
  meta: {
    objetivo: 50000,           // meta total
    recaudado: 12480,          // llevado hasta ahora  ← actualízalo
    moneda: 'USD',             // moneda en la que se expresa la meta
    donantes: 214,             // nº de personas que han aportado
    // Si conectas un backend, puedes actualizar recaudado/donantes por API.
  },

  /* ---- Monedas y montos sugeridos ----
     La primera es la moneda por defecto. EUR va primero porque es la que ya
     cobra en línea (SumUp); USD entrará cuando se configure Stripe. */
  monedas: ['EUR', 'USD'],
  simbolos: { USD: '$', EUR: '€' },
  montos: {
    USD: [10, 25, 50, 100, 250],
    EUR: [10, 20, 50, 100, 250],
  },
  montoMinimo: { USD: 5, EUR: 5 },
  // Tasa de referencia SOLO para mostrar el equivalente aproximado.
  // El cobro se hace en la moneda que elija el donante. (EUR por 1 USD)
  eurPorUsd: 0.92,

  /* ---- Datos del evento (RELLENAR con información verificada) ----
     Estos valores aparecen en la sección "La emergencia". Usa cifras reales.
     Déjalos vacíos si aún no las tienes: la página oculta lo que esté vacío. */
  evento: {
    titulo: 'El terremoto que golpeó a Venezuela',
    zona: 'Estado Miranda y zonas aledañas',   // ej. 'Cristóbal Rojas, Miranda'
    fecha: '',                 // ej. 'Junio de 2026'  (verifica antes de publicar)
    magnitud: '',              // ej. '6.2'            (verifica antes de publicar)
    // Cifras de impacto (usa datos reales; 0 se oculta)
    familiasAfectadas: 1200,
    personasAlbergadas: 480,
    viviendasDanadas: 350,
    resumen:
      'Un fuerte sismo dejó a cientos de familias sin hogar, con viviendas ' +
      'dañadas y necesidades urgentes de refugio, alimentos, agua potable, ' +
      'atención médica y apoyo psicológico. La emergencia continúa y cada ' +
      'aporte se convierte en ayuda directa para quienes lo perdieron todo.',
  },

  /* ---- En qué se usa cada aporte (debe sumar 100) ---- */
  usoFondos: [
    { etiqueta: 'Refugio y reconstrucción', pct: 40, icono: 'casa' },
    { etiqueta: 'Alimentos y agua potable', pct: 25, icono: 'agua' },
    { etiqueta: 'Salud y medicinas', pct: 20, icono: 'salud' },
    { etiqueta: 'Apoyo psicológico y logística', pct: 15, icono: 'corazon' },
  ],

  /* ---- Qué logra cada monto (niveles de impacto) ---- */
  niveles: [
    { monto: 10,  titulo: 'Agua y alimentos',   texto: 'Agua potable y comida por 3 días para una familia.' },
    { monto: 25,  titulo: 'Kit de emergencia',  texto: 'Higiene, cobijas y artículos básicos para una familia.' },
    { monto: 50,  titulo: 'Salud',              texto: 'Medicinas y atención primaria para varias personas.' },
    { monto: 100, titulo: 'Techo seguro',       texto: 'Materiales para reparar el techo de una vivienda.' },
    { monto: 250, titulo: 'Reconstrucción',     texto: 'Reconstrucción de un espacio seguro para una familia.' },
  ],

  /* ---- Transparencia ---- */
  transparencia: {
    pctACausa: 100,            // % que llega directo a la ayuda
    // Enlace a un documento/hoja pública de rendición de cuentas (opcional).
    rendicionUrl: '',
    actualizaciones: [
      // { fecha: 'Julio 2026', texto: 'Se entregaron 300 kits de higiene en Cúa.' },
    ],
  },

  /* ---- Historias (opcional; deja el array vacío para ocultar la sección) ---- */
  historias: [
    {
      nombre: 'María, Charallave',
      texto: 'Perdimos la mitad de la casa. Con la ayuda pudimos reparar el techo y volver a dormir tranquilos.',
    },
    {
      nombre: 'Familia Rodríguez, Cúa',
      texto: 'Los kits de comida y agua llegaron cuando más lo necesitábamos. Gracias a quienes donaron.',
    },
  ],

  /* ---- Métodos de donación ALTERNATIVOS (opcional) ----
     Se muestran como opción manual mientras/además del cobro en línea.
     Deja el array vacío para ocultarlos. */
  metodosAlternativos: [
    // { etiqueta: 'PayPal', valor: 'https://paypal.me/tuusuario', tipo: 'enlace' },
    // { etiqueta: 'Zelle',  valor: 'donaciones@correo.com',        tipo: 'texto'  },
    // { etiqueta: 'Pago Móvil', valor: '0412-0000000 · V-00000000 · Banco', tipo: 'texto' },
  ],

  /* ---- Aliados / respaldo (opcional, para dar confianza) ---- */
  aliados: [
    // { nombre: 'Aliado 1' }, { nombre: 'Aliado 2' },
  ],
};
