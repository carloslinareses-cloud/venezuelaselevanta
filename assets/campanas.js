/* ============================================================================
   campanas.js — Directorio de campañas de Súmate VZLA.

   Para AÑADIR una campaña nueva basta con agregar un objeto a esta lista.
   El hub (index.html) se dibuja solo a partir de aquí.

   Campos:
     id          identificador corto
     titulo      nombre visible de la campaña
     lugar       dónde ocurre (se muestra bajo el título)
     resumen     2-3 líneas explicando la causa
     url         a dónde lleva el botón (ruta interna o URL completa)
     imagen      ruta de la imagen de portada
     alt         texto alternativo de la imagen
     etiquetas   distintivos cortos (moneda, tipo de ayuda…)
     meta        { objetivo, moneda }  — para la barra de progreso
     progreso    de dónde se sacan las cifras:
                   { tipo: 'config'  }                  → usa window.CampaignConfig
                   { tipo: 'api', url: '…' }            → GET que devuelve {raised,count,goal}
                   { tipo: 'manual', recaudado, donantes }
     extra       enlace secundario opcional { texto, url }
     estado      'activa' | 'cerrada'
   ============================================================================ */
window.Campanas = [
  {
    id: 'terremoto',
    titulo: 'Terremoto de Venezuela: ayuda humanitaria',
    lugar: 'La Guaira, Caracas y el centro-norte del país',
    resumen:
      'Alimentos, agua potable, ropa, sábanas y productos de higiene para las familias ' +
      'que lo perdieron todo tras los sismos de magnitud 7,2 y 7,5 del 24 de junio de 2026.',
    url: 'terremoto/',
    imagen: 'assets/hero-relief.webp',
    alt: 'Ayuda humanitaria para familias afectadas por el terremoto en Venezuela',
    etiquetas: ['Ayuda humanitaria', 'Tarjeta en €', 'Colombia en COP'],
    meta: { objetivo: 50000, moneda: 'EUR' },
    progreso: { tipo: 'config' },
    extra: { texto: '¿Donas desde Colombia? Entra aquí (COP)', url: 'colombia/' },
    estado: 'activa',
  },
  {
    id: 'torre-b-robles',
    titulo: 'Torre B de Los Robles: reparar el edificio',
    lugar: 'Conjunto Residencial Bosque Real · Edificio Los Robles, Charallave',
    resumen:
      'El terremoto dañó la estructura del edificio, dejó el ascensor sin funcionar y partió ' +
      'las barandas de los balcones. La Junta de Condominio pide ayuda para repararlo.',
    url: 'robles/',
    imagen: 'assets/campanas/torre-b.jpeg',
    alt: 'Baranda de un balcón de la Torre B partida por el terremoto',
    etiquetas: ['Reparación estructural', 'Tarjeta en €', 'Pago móvil en Bs'],
    meta: { objetivo: 10000, moneda: 'EUR' },
    progreso: { tipo: 'api', url: 'https://ayuda-robles.pages.dev/api/stats' },
    estado: 'activa',
  },
];
