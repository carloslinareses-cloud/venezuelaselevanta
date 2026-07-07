/* ============================================================================
   config.js — TODO lo editable de la campaña vive aquí.
   Cambia estos valores y la página entera se actualiza sola. No necesitas
   tocar el HTML para ajustar marca, meta, montos o datos del evento.
   ============================================================================ */
window.CampaignConfig = {

  /* ---- Marca ---- */
  marca: {
    nombre: 'Súmate VZLA Colombia',
    lema: 'Ayuda humanitaria desde Colombia para que Venezuela se levante',
    // Correo y redes se muestran en el pie de página.
    email: 'contacto@sumatevzla.org',
    telefono: '',              // opcional, ej. '+58 412 000 0000'
    web: 'sumatevzla.org',
    redes: {
      instagram: '',           // ej. 'https://instagram.com/...'
      facebook: '',
      x: '',
      tiktok: 'https://www.tiktok.com/@sumatevzla',
      whatsapp: '',            // ej. 'https://wa.me/58412...'
    },
  },

  /* ---- Meta de recaudación (barra de progreso del hero) ---- */
  meta: {
    objetivo: 200000000,       // meta total referencial en pesos colombianos
    recaudado: 1912000,        // equivalente aproximado del avance actual
    moneda: 'COP',             // moneda en la que se expresa la meta
    donantes: 11,              // nº de personas que han aportado
    // Si conectas un backend, puedes actualizar recaudado/donantes por API.
  },

  /* ---- Monedas y montos sugeridos ----
     COP cobra con Wompi y EUR con SumUp. */
  monedas: ['COP', 'EUR'],
  simbolos: { COP: 'COP $', EUR: '€' },
  montos: {
    COP: [20000, 50000, 100000, 200000, 500000],
    EUR: [10, 20, 50, 100, 250],
  },
  montoMinimo: { COP: 5000, EUR: 5 },
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
    // Cifras preliminares con corte al 6 de julio de 2026. 0 se oculta.
    corte: '6 de julio de 2026, 21:00 VET',
    fallecidos: 3535,
    heridos: 16740,
    damnificados: 17854,
    resumen:
      'El 24 de junio de 2026, dos fuertes sismos de magnitud 7,2 y 7,5 ' +
      'golpearon en apenas 39 segundos la costa norte de Venezuela — el evento ' +
      'más fuerte en más de un siglo. La Guaira, Caracas y el centro-norte del ' +
      'país concentran daños severos, personas sin hogar y necesidades urgentes ' +
      'de alimentos, agua, ropa, productos de higiene y sábanas. ' +
      'Las cifras son preliminares y pueden cambiar mientras continúan las evaluaciones.',
  },

  /* ---- En qué se usa cada aporte (debe sumar 100) ---- */
  usoFondos: [
    { etiqueta: 'Alimentos y agua potable', pct: 45, icono: 'agua' },
    { etiqueta: 'Ropa y sábanas', pct: 25, icono: 'ropa' },
    { etiqueta: 'Productos de higiene', pct: 20, icono: 'salud' },
    { etiqueta: 'Logística y entrega', pct: 10, icono: 'caja' },
  ],

  /* ---- Qué logra cada monto (niveles de impacto) ---- */
  niveles: [
    { monto: 20000,  titulo: 'Alimentos',         texto: 'Comida para una familia por varios días.' },
    { monto: 50000,  titulo: 'Kit de higiene',    texto: 'Jabón, cepillos y artículos de aseo para una familia.' },
    { monto: 100000, titulo: 'Ropa',              texto: 'Mudas de ropa para una familia que lo perdió todo.' },
    { monto: 200000, titulo: 'Sábanas y cobijas', texto: 'Descanso digno: sábanas y cobijas para una familia.' },
    { monto: 500000, titulo: 'Mercado familiar',  texto: 'Comida, higiene, ropa y sábanas para una familia.' },
  ],

  /* ---- Transparencia ---- */
  transparencia: {
    pctACausa: 100,            // % que llega directo a la ayuda
    // Enlace a un documento/hoja pública de rendición de cuentas (opcional).
    rendicionUrl: '',
    actualizaciones: [
      { fecha: '6 jul 2026', texto: 'Se actualiza el balance preliminar: 3.535 fallecidos, 16.740 heridos y 17.854 personas sin hogar tras el doble terremoto.' },
      { fecha: '1 jul 2026', texto: 'Se actualizan las cifras públicas de la emergencia y se priorizan kits de agua, higiene y atención primaria para familias venezolanas, incluyendo aportes recaudados desde Colombia.' },
      { fecha: '30 jun 2026', texto: 'La respuesta humanitaria reporta miles de personas rescatadas y daños críticos en viviendas del centro-norte del país.' },
    ],
  },

  /* ---- Controles de confianza visibles para donantes ---- */
  principios: [
    'Registro de cada donación con monto, moneda, fecha y método de pago.',
    'Separación entre ayuda directa y comisiones de pasarela para reportar el neto recibido.',
    'Priorización de compras con comprobante: alimentos, agua, ropa, productos de higiene y sábanas para familias afectadas.',
    'Publicación de actualizaciones con fecha de corte y fuentes externas consultadas.',
  ],

  fuentes: [
    {
      etiqueta: 'Cadena SER · balance del 6 jul 2026',
      url: 'https://cadenaser.com/nacional/2026/07/06/largas-fila-de-comida-y-la-busqueda-de-cuerpos-con-excavadoras-asi-se-encuentra-la-guaira-12-dias-despues-del-seismo-cadena-ser/',
    },
    {
      etiqueta: 'AP · recuperación tras los terremotos (7 jul 2026)',
      url: 'https://apnews.com/article/411e5608c47eda5385a6e13547cae7c9',
    },
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
  historias: [],   // vacío = sección oculta. Agrega testimonios reales cuando los tengas.

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
