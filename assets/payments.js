/* ============================================================================
   payments.js — Integración de cobros.
   ----------------------------------------------------------------------------
   Ruteo POR MONEDA:
     · EUR → SumUp (mismo patrón que AeroSocio: una Edge Function de Supabase
             crea el checkout y devuelve checkoutId; aquí montamos el widget
             in-page de SumUp).
     · USD → Stripe (pendiente de configurar; muestra aviso mientras tanto).

   La llave PÚBLICA/anon de Supabase es segura en el front. La llave SECRETA de
   SumUp vive SOLO en la Edge Function (secret de Supabase), nunca aquí.
   ============================================================================ */

window.PaymentConfig = {
  // Qué proveedor cobra cada moneda. 'ninguno' = aún sin cobro en línea.
  proveedorPorMoneda: {
    EUR: 'sumup',
    USD: 'ninguno',   // ← cámbialo a 'stripe' cuando configures USD
  },

  // Proyecto Supabase que aloja la Edge Function (mismo comercio SumUp que AeroSocio).
  supabase: {
    url: 'https://koxrtxplpybdfymgdhhd.supabase.co',
    anonKey: 'sb_publishable_024-eUVtJmUuVsdrEKTl3A_oMQl0Gla', // pública (segura en el front)
    funcionDonacion: 'crear-donacion-sumup',
  },

  sumup: {
    sdkUrl: 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js',
    locale: 'es-ES',
    country: 'ES',
  },

  wompi: {
    sdkUrl: 'https://checkout.wompi.co/widget.js',
    funcionDonacion: 'crear-donacion-wompi-colombia',
  },

  // USD (futuro): Stripe Checkout. La llave secreta va en tu backend.
  stripe: { publishableKey: '', crearSesionUrl: '' },

  retorno: {
    exito: 'gracias.html',
    cancelado: 'index.html?donacion=cancelada#donar',
  },
};

window.Payments = {
  proveedorDe(moneda) {
    return (window.PaymentConfig.proveedorPorMoneda || {})[moneda] || 'ninguno';
  },
  configurado(moneda) {
    return this.proveedorDe(moneda) !== 'ninguno';
  },

  /**
   * Inicia la donación. Devuelve { estado }:
   *  - 'widget_abierto' → SumUp montado en su modal (el resto lo maneja el widget).
   *  - 'redirigiendo'   → la página redirige a la pasarela (Stripe).
   *  - 'sin_configurar' → aún no hay proveedor para esa moneda.
   *  - lanza Error       → algo falló al iniciar (se muestra al donante).
   */
  async iniciarDonacion(payload) {
    var prov = this.proveedorDe(payload.moneda);
    if (prov === 'sumup') return this._sumup(payload);
    if (prov === 'wompi') return this._wompi(payload);
    if (prov === 'stripe') return this._stripe(payload);
    return { estado: 'sin_configurar' };
  },

  /* ---------------- SumUp (EUR) ---------------- */
  async _sumup(payload) {
    var sb = window.PaymentConfig.supabase;
    var url = sb.url.replace(/\/$/, '') + '/functions/v1/' + sb.funcionDonacion;
    var res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.anonKey,
          'Authorization': 'Bearer ' + sb.anonKey,
        },
        body: JSON.stringify({
          amount: payload.monto,
          currency: payload.moneda,
          name: payload.donante && payload.donante.nombre || '',
          email: payload.donante && payload.donante.email || '',
          mensaje: payload.donante && payload.donante.mensaje || '',
          anonimo: !!(payload.donante && payload.donante.anonimo),
          // A dónde vuelve el donante tras pagar (funciona en localhost y en producción).
          returnUrl: new URL('gracias.html', location.href).href,
        }),
      });
    } catch (e) {
      throw new Error('No pudimos conectar con el servidor de pagos. Si estás en VPN o bloqueador, desactívalo y prueba de nuevo. Si persiste, el dominio debe autorizarse en Supabase.');
    }
    if (!res.ok) {
      var msg = 'No se pudo iniciar el pago. Intenta de nuevo.';
      try { var j = await res.json(); if (j && j.error) msg = j.error; } catch (e) {}
      throw new Error(msg);
    }
    var data = await res.json();
    // Preferido: redirigir a la página de pago alojada por SumUp (robusto ante bloqueadores).
    if (data.hostedUrl) {
      window.location.href = data.hostedUrl;
      return { estado: 'redirigiendo' };
    }
    // Respaldo: widget embebido (si por algo no vino hostedUrl).
    var checkoutId = data.checkoutId || data.id;
    if (!checkoutId) throw new Error('SumUp no devolvió un checkout válido.');
    await this._montarSumup(checkoutId, payload);
    return { estado: 'widget_abierto' };
  },

  _loadSumupSdk() {
    if (window.SumUpCard) return Promise.resolve();
    var u = window.PaymentConfig.sumup.sdkUrl;
    return new Promise(function (resolve, reject) {
      var ex = document.querySelector('script[src="' + u + '"]');
      if (ex) {
        ex.addEventListener('load', function () { resolve(); });
        ex.addEventListener('error', function () { reject(new Error('No se pudo cargar el SDK de SumUp')); });
        return;
      }
      var s = document.createElement('script');
      s.src = u; s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('No se pudo cargar el SDK de SumUp')); };
      document.body.appendChild(s);
    });
  },

  async _montarSumup(checkoutId, payload) {
    this._abrirModal(payload);
    var cfg = window.PaymentConfig.sumup;
    try {
      await this._loadSumupSdk();
      if (!window.SumUpCard) throw new Error('SumUp no está disponible.');
      var cont = document.getElementById('sumup-card');
      if (cont) cont.innerHTML = '';
      var self = this;
      self._widgetOk = false;
      window.SumUpCard.mount({
        id: 'sumup-card',
        checkoutId: checkoutId,
        email: (payload.donante && payload.donante.email) || undefined,
        locale: cfg.locale,
        country: cfg.country,
        showSubmitButton: true,
        onLoad: function () {
          self._widgetOk = true;
          var l = document.querySelector('#sumup-card .sumup-loading');
          if (l) l.remove();
        },
        onResponse: function (type, body) {
          if (type === 'success') {
            window.location.href = window.PaymentConfig.retorno.exito;
          } else if (type === 'error') {
            self._error((body && body.message) || 'El pago no se pudo procesar. Revisa los datos de tu tarjeta o prueba con otra.');
          }
        },
      });
      // Si en ~9s no cargó el formulario (típico: un bloqueador/antivirus bloquea
      // los iframes de SumUp), damos una pista útil al donante.
      setTimeout(function () {
        if (self._widgetOk) return;
        var c = document.getElementById('sumup-card');
        if (c && c.querySelector('iframe[src*="field.html"]')) return;
        var err = document.getElementById('sumup-error');
        if (err) {
          err.hidden = false;
          err.innerHTML = '¿No aparece el formulario de tarjeta? Casi siempre es un <b>bloqueador de anuncios o antivirus</b> que bloquea SumUp. Desactívalo para este sitio, prueba en <b>modo incógnito</b> o con otro navegador.';
        }
      }, 9000);
    } catch (e) {
      this._error(e.message || 'No se pudo cargar el formulario de pago.');
    }
  },

  _abrirModal(payload) {
    var cfgm = (window.CampaignConfig && window.CampaignConfig.simbolos) || {};
    var sym = cfgm[payload.moneda] || '€';
    var amt = document.getElementById('sumup-amount');
    if (amt) amt.textContent = 'Donación: ' + sym + Math.round(payload.monto) + ' · pago único';
    var err = document.getElementById('sumup-error');
    if (err) { err.hidden = true; err.textContent = ''; }
    var card = document.getElementById('sumup-card');
    if (card) card.innerHTML = '<div class="sumup-loading">Cargando pago seguro…</div>';
    var bg = document.getElementById('sumup-modal');
    if (bg) bg.hidden = false;
  },
  cerrarModal() {
    var bg = document.getElementById('sumup-modal');
    if (bg) bg.hidden = true;
    var card = document.getElementById('sumup-card');
    if (card) card.innerHTML = '';
  },
  _error(msg) {
    var err = document.getElementById('sumup-error');
    if (err) { err.textContent = msg; err.hidden = false; }
    var loading = document.querySelector('#sumup-card .sumup-loading');
    if (loading) loading.remove();
  },

  /* ---------------- Wompi (COP / Colombia) ---------------- */
  async _wompi(payload) {
    var sb = window.PaymentConfig.supabase;
    var wc = window.PaymentConfig.wompi || {};
    var fn = wc.funcionDonacion || sb.funcionDonacion || 'crear-donacion-wompi-colombia';
    var url = sb.url.replace(/\/$/, '') + '/functions/v1/' + fn;
    var returnUrl = new URL((window.PaymentConfig.retorno && window.PaymentConfig.retorno.exito) || 'gracias.html', location.href).href;
    var res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.anonKey,
          'Authorization': 'Bearer ' + sb.anonKey,
        },
        body: JSON.stringify({
          amount: payload.monto,
          currency: payload.moneda,
          name: payload.donante && payload.donante.nombre || '',
          email: payload.donante && payload.donante.email || '',
          mensaje: payload.donante && payload.donante.mensaje || '',
          anonimo: !!(payload.donante && payload.donante.anonimo),
          returnUrl: returnUrl,
        }),
      });
    } catch (e) {
      throw new Error('No pudimos conectar con el servidor de pagos de Wompi. Intenta de nuevo en unos minutos.');
    }
    if (!res.ok) {
      var msg = 'No se pudo iniciar el pago con Wompi. Intenta de nuevo.';
      try { var j = await res.json(); if (j && j.error) msg = j.error; } catch (e) {}
      throw new Error(msg);
    }
    var data = await res.json();
    await this._loadWompiSdk();
    if (!window.WidgetCheckout) throw new Error('Wompi no está disponible en este momento.');

    var checkout = new window.WidgetCheckout({
      currency: data.currency || 'COP',
      amountInCents: data.amountInCents,
      reference: data.reference,
      publicKey: data.publicKey,
      signature: { integrity: data.signature },
      redirectUrl: data.redirectUrl || returnUrl,
      customerData: {
        email: payload.donante && payload.donante.email || undefined,
        fullName: payload.donante && payload.donante.nombre || undefined,
      },
    });
    checkout.open(function (result) {
      var tx = result && result.transaction;
      if (tx && tx.id) {
        var next = new URL(returnUrl);
        next.searchParams.set('id', tx.id);
        window.location.href = next.href;
      }
    });
    return { estado: 'widget_abierto' };
  },

  _loadWompiSdk() {
    if (window.WidgetCheckout) return Promise.resolve();
    var u = (window.PaymentConfig.wompi && window.PaymentConfig.wompi.sdkUrl) || 'https://checkout.wompi.co/widget.js';
    return new Promise(function (resolve, reject) {
      var ex = document.querySelector('script[src="' + u + '"]');
      if (ex) {
        ex.addEventListener('load', function () { resolve(); });
        ex.addEventListener('error', function () { reject(new Error('No se pudo cargar Wompi')); });
        return;
      }
      var s = document.createElement('script');
      s.src = u; s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('No se pudo cargar Wompi')); };
      document.body.appendChild(s);
    });
  },

  /* ---------------- Stripe (USD, futuro) ---------------- */
  async _stripe(payload) {
    var cfg = window.PaymentConfig.stripe;
    if (!cfg.crearSesionUrl) return { estado: 'sin_configurar' };
    var res = await fetch(cfg.crearSesionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('No se pudo iniciar el pago. Intenta de nuevo.');
    var data = await res.json();
    if (!data.url) throw new Error('Respuesta de pago inválida.');
    window.location.href = data.url;
    return { estado: 'redirigiendo' };
  },
};
