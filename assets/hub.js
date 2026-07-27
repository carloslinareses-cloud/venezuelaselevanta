/* ============================================================================
   hub.js — Dibuja el directorio de campañas a partir de assets/campanas.js.
   Para añadir una campaña NO se toca este archivo: solo campanas.js.
   ============================================================================ */
(function () {
  'use strict';

  var SIMBOLO = { EUR: '€', COP: 'COP $', USD: '$', VES: 'Bs' };

  function fmt(monto, moneda) {
    var n = Number(monto) || 0;
    var sim = SIMBOLO[moneda] || '';
    var loc = moneda === 'COP' ? 'es-CO' : 'es-ES';
    return sim + ' ' + n.toLocaleString(loc, { maximumFractionDigits: 0 });
  }

  function esExterna(url) {
    return /^https?:\/\//i.test(url);
  }

  /** Cifras de progreso de una campaña, según su fuente. */
  function progresoInicial(c) {
    var p = c.progreso || {};
    if (p.tipo === 'config' && window.CampaignConfig && window.CampaignConfig.meta) {
      var m = window.CampaignConfig.meta;
      return {
        recaudado: Number(m.recaudado) || 0,
        donantes: Number(m.donantes) || 0,
        objetivo: Number(m.objetivo) || (c.meta && c.meta.objetivo) || 0,
        moneda: m.moneda || (c.meta && c.meta.moneda) || 'EUR',
      };
    }
    if (p.tipo === 'manual') {
      return {
        recaudado: Number(p.recaudado) || 0,
        donantes: Number(p.donantes) || 0,
        objetivo: (c.meta && c.meta.objetivo) || 0,
        moneda: (c.meta && c.meta.moneda) || 'EUR',
      };
    }
    // 'api' → se rellena después con fetch
    return {
      recaudado: null,
      donantes: null,
      objetivo: (c.meta && c.meta.objetivo) || 0,
      moneda: (c.meta && c.meta.moneda) || 'EUR',
    };
  }

  function pintarProgreso(card, datos) {
    var barra = card.querySelector('.camp-bar span');
    var texto = card.querySelector('.camp-cifras');
    if (!barra || !texto) return;

    if (datos.recaudado === null) {
      texto.innerHTML = '<strong>Meta:</strong> ' + fmt(datos.objetivo, datos.moneda);
      barra.style.width = '0%';
      return;
    }
    var pct = datos.objetivo > 0 ? Math.min(100, (datos.recaudado / datos.objetivo) * 100) : 0;
    barra.style.width = pct.toFixed(1) + '%';

    var partes = ['<strong>' + fmt(datos.recaudado, datos.moneda) + '</strong> de ' +
      fmt(datos.objetivo, datos.moneda)];
    if (datos.donantes > 0) {
      partes.push(datos.donantes === 1 ? '1 donación' : datos.donantes + ' donaciones');
    }
    texto.innerHTML = partes.join(' · ');
  }

  function tarjeta(c) {
    var externa = esExterna(c.url);
    var art = document.createElement('article');
    art.className = 'camp-card';
    art.setAttribute('data-campana', c.id);

    var etiquetas = (c.etiquetas || [])
      .map(function (e) { return '<span class="camp-tag">' + e + '</span>'; })
      .join('');

    var extra = c.extra
      ? '<p class="camp-extra"><a href="' + c.extra.url + '">' + c.extra.texto + '</a></p>'
      : '';

    art.innerHTML =
      '<a class="camp-img" href="' + c.url + '"' + (externa ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<img src="' + c.imagen + '" alt="' + (c.alt || c.titulo) + '" loading="lazy" />' +
      '</a>' +
      '<div class="camp-body">' +
        '<div class="camp-tags">' + etiquetas + '</div>' +
        '<h3 class="camp-titulo">' +
          '<a href="' + c.url + '"' + (externa ? ' target="_blank" rel="noopener"' : '') + '>' + c.titulo + '</a>' +
        '</h3>' +
        '<p class="camp-lugar">📍 ' + c.lugar + '</p>' +
        '<p class="camp-resumen">' + c.resumen + '</p>' +
        '<div class="camp-progreso">' +
          '<div class="camp-bar"><span style="width:0%"></span></div>' +
          '<p class="camp-cifras">Cargando…</p>' +
        '</div>' +
        '<a class="btn btn-primary btn-block camp-cta" href="' + c.url + '"' +
          (externa ? ' target="_blank" rel="noopener"' : '') + '>Ver campaña y donar</a>' +
        extra +
      '</div>';

    return art;
  }

  function init() {
    var grid = document.getElementById('campanas-grid');
    var lista = window.Campanas || [];
    if (!grid || !lista.length) return;

    lista
      .filter(function (c) { return c.estado !== 'cerrada'; })
      .forEach(function (c) {
        var card = tarjeta(c);
        grid.appendChild(card);
        pintarProgreso(card, progresoInicial(c));

        // Campañas con contador propio: se consultan en vivo.
        if (c.progreso && c.progreso.tipo === 'api' && c.progreso.url) {
          fetch(c.progreso.url, { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              if (!d || typeof d.raised !== 'number') return;
              pintarProgreso(card, {
                recaudado: d.raised,
                donantes: d.count || 0,
                objetivo: d.goal || (c.meta && c.meta.objetivo) || 0,
                moneda: (c.meta && c.meta.moneda) || 'EUR',
              });
            })
            .catch(function () {
              // Si no responde, se muestra al menos la meta.
              pintarProgreso(card, {
                recaudado: null,
                objetivo: (c.meta && c.meta.objetivo) || 0,
                moneda: (c.meta && c.meta.moneda) || 'EUR',
              });
            });
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
