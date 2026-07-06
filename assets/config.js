/* ============================================================================
   config.js — TODO lo editable de la campaña vive aquí.
   Cambia estos valores y la página entera se actualiza sola. No necesitas
   tocar el HTML para ajustar marca, meta, montos o datos del evento.
   ============================================================================ */
window.CampaignConfig = {

  /* ---- Marca ---- */
  marca: {
    nombre: 'Venezuela se Levanta',
    lema: 'Ayuda humanitaria para las familias afectadas por los terremotos',
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
    moneda: 'EUR',             // moneda en la que se expresa la meta
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
    titulo: 'El doble terremoto que golpeó a Venezuela',
    zona: 'La Guaira, Caracas y el centro-norte del país',
    fecha: '24 de junio de 2026',
    magnitud: '7,2 y 7,5',
    // Cifras oficiales preliminares con corte al 1 de julio de 2026. 0 se oculta.
    corte: '1 de julio de 2026, 19:00 VET',
    fallecidos: 2295,
    heridos: 11267,
    damnificados: 26403,
    resumen:
      'El 24 de junio de 2026, dos fuertes sismos de magnitud 7,2 y 7,5 ' +
      'golpearon en apenas 39 segundos la costa norte de Venezuela — el evento ' +
      'más fuerte en más de un siglo. La Guaira, Caracas y el centro-norte del ' +
      'país concentran daños severos, personas desplazadas y necesidades urgentes ' +
      'de refugio, alimentos, agua potable, atención médica y apoyo psicológico. ' +
      'Las cifras son preliminares y pueden cambiar mientras continúan las evaluaciones.',
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
      { fecha: '1 jul 2026', texto: 'Se actualizan las cifras públicas de la emergencia y se priorizan kits de agua, higiene y atención primaria.' },
      { fecha: '30 jun 2026', texto: 'La respuesta humanitaria reporta miles de personas rescatadas y daños críticos en vivienda e infraestructura.' },
    ],
  },

  /* ---- Controles de confianza visibles para donantes ---- */
  principios: [
    'Registro de cada donación con monto, moneda, fecha y método de pago.',
    'Separación entre ayuda directa y comisiones de pasarela para reportar el neto recibido.',
    'Priorización de compras con comprobante: agua, alimentos, higiene, medicinas y refugio temporal.',
    'Publicación de actualizaciones con fecha de corte y fuentes externas consultadas.',
  ],

  fuentes: [
    {
      etiqueta: 'OCHA · Situation Report No. 8 (1 jul 2026)',
      url: 'https://www.unocha.org/publications/report/venezuela-bolivarian-republic/earthquakes-venezuela-situation-report-no-8-01-july-2026-time-0700-pm',
    },
    {
      etiqueta: 'USGS · evento M 7.5, 28 km SE de Yumare',
      url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000t7zp/executive',
    },
    {
      etiqueta: 'USGS · evento M 7.2, 23 km SE de Yumare',
      url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us6000t7zc/executive',
    },
    {
      etiqueta: 'ReliefWeb · disaster brief EQ-2026-000093-VEN',
      url: 'https://reliefweb.int/report/venezuela-bolivarian-republic/venezuela-earthquake-disaster-brief-eq-2026-000093-ven-americas-venezuela-july-1-2026',
    },
  ],

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
