/* ============================================================================
   app.js — lógica de la página. Lee CampaignConfig, arma las secciones,
   maneja el widget de donación y llama a Payments para el cobro.
   ============================================================================ */
(function () {
  'use strict';
  var CFG = window.CampaignConfig || {};
  var nf = new Intl.NumberFormat('es-VE');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function resolve(path) {
    return path.split('.').reduce(function (o, k) { return (o == null ? undefined : o[k]); }, CFG);
  }
  function sym(cur) { return (CFG.simbolos && CFG.simbolos[cur]) || '$'; }
  function money(n, cur) { return sym(cur) + nf.format(Math.round(Number(n) || 0)); }
  function textEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text == null ? '' : String(text);
    return el;
  }

  /* ---------- Estado del widget ---------- */
  var state = {
    moneda: (CFG.monedas && CFG.monedas[0]) || 'USD',
    monto: 0,
    personalizado: false,
  };

  /* ==========================================================================
     1. Data-binding de textos y montos
     ========================================================================== */
  function bindTextos() {
    $$('[data-bind]').forEach(function (el) {
      var key = el.getAttribute('data-bind');
      var val;
      if (key === 'metaPct') {
        val = metaPct() + '%';
      } else {
        val = resolve(key);
      }
      if (val !== undefined && val !== null && val !== '') el.textContent = val;
    });
    $$('[data-bind-money]').forEach(function (el) {
      var val = resolve(el.getAttribute('data-bind-money'));
      if (val !== undefined) el.textContent = money(val, (CFG.meta && CFG.meta.moneda) || 'USD');
    });
  }
  function metaPct() {
    var m = CFG.meta || {};
    if (!m.objetivo) return 0;
    return Math.max(0, Math.min(100, Math.round((m.recaudado / m.objetivo) * 100)));
  }

  /* ==========================================================================
     2. Datos del evento (oculta lo vacío)
     ========================================================================== */
  function renderEvento() {
    var e = CFG.evento || {};
    var partes = [];
    if (e.zona) partes.push('📍 ' + e.zona);
    if (e.fecha) partes.push('🗓️ ' + e.fecha);
    if (e.magnitud) partes.push('📊 Magnitud ' + e.magnitud);
    var el = $('#evento-meta');
    if (el) { el.textContent = partes.join('   ·   '); if (!partes.length) el.hidden = true; }
    var note = $('#source-note');
    if (note && e.corte) note.textContent = 'Cifras oficiales preliminares con corte: ' + e.corte + '. Consulta las fuentes públicas en la sección de verificación.';
  }

  /* ==========================================================================
     3. Uso de fondos
     ========================================================================== */
  var ICONOS = {
    casa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>',
    agua: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/></svg>',
    salud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2 5 4-10 2 5h6"/></svg>',
    corazon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"/></svg>',
    ropa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 3.5 6l2 3.5L8 8v11h8V8l2.5 1.5 2-3.5L16 3l-1.8 1.4a3.5 3.5 0 0 1-4.4 0Z"/></svg>',
    caja: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
  };
  function renderUso() {
    var grid = $('#uso-grid'); if (!grid) return;
    (CFG.usoFondos || []).forEach(function (u) {
      var card = document.createElement('div');
      card.className = 'uso-card reveal';
      var icon = document.createElement('div');
      icon.className = 'uso-icon';
      icon.innerHTML = ICONOS[u.icono] || ICONOS.corazon;
      var pct = textEl('div', 'uso-pct', u.pct + '%');
      var label = textEl('div', 'uso-lbl', u.etiqueta);
      var bar = document.createElement('div');
      var fill = document.createElement('span');
      bar.className = 'uso-bar';
      fill.setAttribute('data-w', u.pct);
      bar.appendChild(fill);
      card.append(icon, pct, label, bar);
      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     4. Niveles de impacto
     ========================================================================== */
  function renderNiveles() {
    var grid = $('#niveles-grid'); if (!grid) return;
    var monedaImpacto = CFG.monedaImpacto || (CFG.monedas && CFG.monedas[0]) || 'EUR';
    (CFG.niveles || []).forEach(function (n) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'nivel-card reveal';
      card.append(
        textEl('div', 'nivel-monto', money(n.monto, monedaImpacto)),
        textEl('div', 'nivel-titulo', n.titulo),
        textEl('div', 'nivel-texto', n.texto)
      );
      card.addEventListener('click', function () {
        state.moneda = monedaImpacto; sincronizarMonedaUI();
        seleccionarMonto(n.monto, false);
        document.getElementById('donar').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     5. Transparencia / historias / métodos alternativos / footer
     ========================================================================== */
  function renderUpdates() {
    var ups = (CFG.transparencia && CFG.transparencia.actualizaciones) || [];
    if (!ups.length) return;
    var wrap = $('#updates'), list = $('#updates-list');
    wrap.hidden = false;
    ups.forEach(function (u) {
      var li = document.createElement('li');
      li.append(textEl('b', '', u.fecha || ''), document.createTextNode(' — ' + (u.texto || '')));
      list.appendChild(li);
    });
  }
  function renderHistorias() {
    var hs = CFG.historias || [];
    if (!hs.length) return;
    var sec = $('#historias'), grid = $('#historias-grid');
    sec.hidden = false;
    hs.forEach(function (h) {
      var d = document.createElement('div');
      d.className = 'historia-card reveal';
      d.append(textEl('p', 'historia-texto', h.texto), textEl('div', 'historia-nombre', '— ' + h.nombre));
      grid.appendChild(d);
    });
  }
  function renderMetodosAlt() {
    var ms = CFG.metodosAlternativos || [];
    if (!ms.length) return;
    var wrap = $('#metodos-alt'), list = $('#metodos-alt-list');
    wrap.hidden = false;
    ms.forEach(function (m) {
      var li = document.createElement('li');
      var strong = textEl('strong', '', (m.etiqueta || '') + ':');
      li.appendChild(strong);
      li.appendChild(document.createTextNode(' '));
      if (m.tipo === 'enlace') {
        var a = document.createElement('a');
        a.href = m.valor;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = m.valor || '';
        li.appendChild(a);
      } else {
        li.appendChild(document.createTextNode(m.valor || ''));
      }
      list.appendChild(li);
    });
  }
  function renderFooter() {
    var m = CFG.marca || {};
    // Contacto
    var c = $('#footer-contact');
    if (c) {
      c.textContent = '';
      if (m.email) {
        var mailWrap = document.createElement('div');
        var mail = document.createElement('a');
        mail.href = 'mailto:' + m.email;
        mail.textContent = m.email;
        mailWrap.append(document.createTextNode('✉️ '), mail);
        c.appendChild(mailWrap);
      }
      if (m.telefono) c.appendChild(textEl('div', '', '📞 ' + m.telefono));
      if (m.web) c.appendChild(textEl('div', '', '🌐 ' + m.web));
    }
    // Redes
    var r = (m.redes || {}), soc = $('#footer-social');
    var iconos = {
      instagram: 'IG', facebook: 'FB', x: 'X', whatsapp: 'WA',
    };
    if (soc) {
      soc.textContent = '';
      Object.keys(iconos).forEach(function (k) {
        if (!r[k]) return;
        var a = document.createElement('a');
        var span = document.createElement('span');
        a.href = r[k];
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', k);
        span.className = 'social-label';
        span.textContent = iconos[k];
        a.appendChild(span);
        soc.appendChild(a);
      });
    }
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  function renderVerificacion() {
    var principios = $('#principios-list');
    if (principios) {
      principios.textContent = '';
      (CFG.principios || []).forEach(function (txt) {
        var li = document.createElement('li');
        li.textContent = txt;
        principios.appendChild(li);
      });
    }
    var fuentes = $('#fuentes-list');
    if (fuentes) {
      fuentes.textContent = '';
      (CFG.fuentes || []).forEach(function (f) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = f.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = f.etiqueta || f.url;
        li.appendChild(a);
        fuentes.appendChild(li);
      });
    }
    var rendicion = $('#rendicion-link');
    var url = CFG.transparencia && CFG.transparencia.rendicionUrl;
    if (rendicion && url) {
      rendicion.href = url;
      rendicion.hidden = false;
    }
  }

  /* ==========================================================================
     6. Widget de donación
     ========================================================================== */
  function montosDe(cur) { return (CFG.montos && CFG.montos[cur]) || [10, 25, 50, 100]; }
  function minDe(cur) { return (CFG.montoMinimo && CFG.montoMinimo[cur]) || 1; }

  function renderMontos() {
    var box = $('#amounts'); if (!box) return;
    box.innerHTML = '';
    montosDe(state.moneda).forEach(function (v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'amount-btn';
      b.textContent = money(v, state.moneda);
      b.setAttribute('data-val', v);
      b.addEventListener('click', function () { seleccionarMonto(v, false); });
      box.appendChild(b);
    });
  }

  function seleccionarMonto(val, personalizado) {
    state.monto = Number(val) || 0;
    state.personalizado = !!personalizado;
    // marcar botón activo
    $$('#amounts .amount-btn').forEach(function (b) {
      b.classList.toggle('is-active', !personalizado && Number(b.getAttribute('data-val')) === state.monto);
    });
    if (!personalizado) {
      var ci = $('#custom-amount'); if (ci) ci.value = '';
    }
    actualizarResumen();
  }

  function sincronizarMonedaUI() {
    $$('.cur-btn').forEach(function (b) {
      var on = b.getAttribute('data-cur') === state.moneda;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var cs = $('#ca-symbol'); if (cs) cs.textContent = sym(state.moneda);
    renderMontos();
    // re-seleccionar un monto por defecto de la nueva moneda
    var lista = montosDe(state.moneda);
    var def = lista[Math.min(2, lista.length - 1)];
    seleccionarMonto(def, false);
  }

  function convNota() {
    var el = $('#conv-note'); if (!el) return;
    var r = CFG.eurPorUsd || 0.92;
    var txt = '';
    if (state.monto > 0 && (state.moneda === 'USD' || state.moneda === 'EUR')) {
      if (state.moneda === 'USD') txt = '≈ ' + money(state.monto * r, 'EUR') + ' aprox.';
      else txt = '≈ ' + money(state.monto / r, 'USD') + ' aprox.';
    }
    el.textContent = txt;
  }

  function actualizarResumen() {
    var etiqueta = state.monto > 0 ? money(state.monto, state.moneda) : sym(state.moneda) + '0';
    var sa = $('#summary-amount'); if (sa) sa.textContent = etiqueta;
    var ba = $('#donate-btn-amount'); if (ba) ba.textContent = etiqueta;
    convNota();
    var err = $('#form-error'); if (err) err.hidden = true;
  }

  function asegurarBotonDonacion() {
    var btn = $('#donate-btn');
    if (!btn) return null;
    if (!$('#donate-btn-amount', btn)) {
      btn.innerHTML = 'Donar <span id="donate-btn-amount"></span> ahora';
    }
    return btn;
  }

  function restaurarBotonDonacion() {
    var btn = asegurarBotonDonacion();
    if (!btn) return;
    btn.disabled = false;
    btn.style.opacity = '';
    actualizarResumen();
  }

  function bindWidget() {
    $$('.cur-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        state.moneda = b.getAttribute('data-cur');
        sincronizarMonedaUI();
      });
    });
    var ci = $('#custom-amount');
    if (ci) ci.addEventListener('input', function () {
      var v = parseFloat(ci.value);
      if (!isNaN(v) && v > 0) seleccionarMonto(v, true);
      else { state.monto = 0; state.personalizado = true; $$('#amounts .amount-btn').forEach(function (b) { b.classList.remove('is-active'); }); actualizarResumen(); }
    });
    var form = $('#donate-form');
    if (form) form.addEventListener('submit', onSubmit);
  }

  function onSubmit(e) {
    e.preventDefault();
    var err = $('#form-error');
    var min = minDe(state.moneda);
    if (!(state.monto >= min)) {
      mostrarError('El monto mínimo es ' + money(min, state.moneda) + '.');
      return;
    }
    var email = ($('#d-email') && $('#d-email').value || '').trim();
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      mostrarError('Revisa tu correo, parece incompleto.');
      return;
    }
    var payload = {
      monto: state.monto,
      moneda: state.moneda,
      tipo: 'unica',
      donante: {
        nombre: ($('#d-nombre') && $('#d-nombre').value || '').trim(),
        email: email,
        mensaje: ($('#d-msg') && $('#d-msg').value || '').trim(),
        anonimo: !!($('#d-anon') && $('#d-anon').checked),
      },
    };

    var btn = $('#donate-btn');
    if (!btn) return;
    btn.disabled = true; btn.style.opacity = '.7';
    btn.innerHTML = 'Procesando...';

    Promise.resolve(window.Payments.iniciarDonacion(payload))
      .then(function (res) {
        if (res && res.estado === 'redirigiendo') return; // la página redirige
        if (res && res.estado === 'sin_configurar') {
          abrirModal(payload);
        }
        restaurar();
      })
      .catch(function (e2) {
        mostrarError((e2 && e2.message) || 'No se pudo procesar. Intenta de nuevo.');
        restaurar();
      });

    function restaurar() { restaurarBotonDonacion(); }
  }

  function mostrarError(msg) {
    var err = $('#form-error');
    if (err) { err.textContent = msg; err.hidden = false; }
  }

  /* ==========================================================================
     7. Modal (pagos aún sin configurar)
     ========================================================================== */
  function abrirModal(payload) {
    var bg = $('#modal-info'); if (!bg) return;
    var res = $('#modal-resumen');
    if (res) res.textContent = 'Tu donación: ' + money(payload.monto, payload.moneda) + ' (pago único)';
    // Si hay métodos alternativos, empuja al donante hacia ellos.
    var tieneAlt = (CFG.metodosAlternativos || []).length > 0;
    var cta = $('#modal-cta');
    if (cta) { cta.textContent = tieneAlt ? 'Ver formas de donar' : 'Entendido'; cta.setAttribute('href', tieneAlt ? '#metodos-alt' : '#donar'); }
    bg.hidden = false;
  }
  function cerrarModal() { var bg = $('#modal-info'); if (bg) bg.hidden = true; }

  /* ==========================================================================
     8. Progreso, contadores, reveal, nav, banners
     ========================================================================== */
  function animarProgreso() {
    var fill = $('#progress-fill'); var pct = metaPct();
    var pb = $('#progressbar'); if (pb) pb.setAttribute('aria-valuenow', pct);
    // pequeño delay para que la transición CSS se vea
    setTimeout(function () { if (fill) fill.style.width = pct + '%'; }, 250);
    $$('.uso-bar span').forEach(function (s) {
      setTimeout(function () { s.style.width = (s.getAttribute('data-w') || 0) + '%'; }, 400);
    });
  }

  function observarReveal() {
    // Contadores
    var counters = $$('[data-count]');
    counters.forEach(function (el) {
      var target = Number(resolve(el.getAttribute('data-count'))) || 0;
      el.dataset.target = target;
      el.textContent = nf.format(target);
    });
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(function (el) { el.classList.add('in'); });
      counters.forEach(function (el) { el.textContent = nf.format(Number(el.dataset.target)); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.2 });
    $$('.reveal, [data-count]').forEach(function (el) { io.observe(el); });
  }

  function bindNav() {
    var toggle = $('#nav-toggle'), nav = $('#site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      $$('a', nav).forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
      });
    }
    // Modal info (pagos aún sin configurar)
    var mc = $('#modal-close'); if (mc) mc.addEventListener('click', cerrarModal);
    var mcta = $('#modal-cta'); if (mcta) mcta.addEventListener('click', cerrarModal);
    var mbg = $('#modal-info'); if (mbg) mbg.addEventListener('click', function (e) { if (e.target === mbg) cerrarModal(); });
    // Modal SumUp (widget de pago EUR)
    var sc = $('#sumup-close'); if (sc) sc.addEventListener('click', function () { if (window.Payments) window.Payments.cerrarModal(); });
    var sm = $('#sumup-modal'); if (sm) sm.addEventListener('click', function (e) { if (e.target === sm && window.Payments) window.Payments.cerrarModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      cerrarModal();
      if (window.Payments) window.Payments.cerrarModal();
    });
  }

  function bannersPorURL() {
    var q = new URLSearchParams(location.search);
    if (q.get('donacion') === 'cancelada') {
      var b = $('#banner-cancelado'); if (b) b.hidden = false;
    }
  }

  /* ==========================================================================
     Donaciones en tiempo real (feed)
     ========================================================================== */
  function tiempoRelativo(iso) {
    var d = new Date(iso); var s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (isNaN(s) || s < 60) return 'hace un momento';
    var m = Math.floor(s / 60); if (m < 60) return 'hace ' + m + ' min';
    var h = Math.floor(m / 60); if (h < 24) return 'hace ' + h + ' h';
    var dias = Math.floor(h / 24); return 'hace ' + dias + (dias === 1 ? ' día' : ' días');
  }
  function renderDonacionesVivas() {
    var cont = $('#donaciones-lista'); if (!cont) return;
    var sb = (window.PaymentConfig && window.PaymentConfig.supabase) || {};
    if (!sb.url || !sb.anonKey) return;
    var url = sb.url.replace(/\/$/, '') + '/functions/v1/' + (sb.funcionDonacion || 'crear-donacion-sumup') + '?feed=1';
    fetch(url, { headers: { apikey: sb.anonKey, Authorization: 'Bearer ' + sb.anonKey } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var arr = (d && d.donaciones) || [];
        cont.innerHTML = '';
        if (!arr.length) {
          cont.appendChild(textEl('div', 'donaciones-vacio', 'Aún no hay donaciones. ¡Sé el primero en sumarte! 💛'));
          return;
        }
        arr.forEach(function (x) {
          var anon = !x.nombre || x.nombre === 'Anónimo';
          var symb = (CFG.simbolos && CFG.simbolos[x.moneda]) || '€';
          var item = document.createElement('div'); item.className = 'donacion-item';
          var ava = textEl('div', 'donacion-ava' + (anon ? ' anon' : ''), anon ? '★' : String(x.nombre).trim().charAt(0).toUpperCase());
          var info = document.createElement('div'); info.className = 'donacion-info';
          info.appendChild(textEl('div', 'donacion-nombre', x.nombre || 'Anónimo'));
          info.appendChild(textEl('div', 'donacion-cuando', tiempoRelativo(x.cuando)));
          var monto = textEl('div', 'donacion-monto', symb + nf.format(Math.round(Number(x.monto) || 0)));
          item.append(ava, info, monto);
          cont.appendChild(item);
        });
      })
      .catch(function () { /* mantener lo que haya */ });
  }

  /* ==========================================================================
     Init
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    bindTextos();
    renderEvento();
    renderUso();
    renderNiveles();
    renderUpdates();
    renderHistorias();
    renderMetodosAlt();
    renderFooter();
    renderVerificacion();
    sincronizarMonedaUI();  // arma montos + selecciona por defecto
    bindWidget();
    bindNav();
    observarReveal();
    animarProgreso();
    bannersPorURL();
    renderDonacionesVivas();
    setInterval(renderDonacionesVivas, 25000); // refresco del feed cada 25s
  });

  window.addEventListener('pageshow', function () {
    restaurarBotonDonacion();
  });
})();
