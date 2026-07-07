/* Configuracion de pagos para /colombia/: COP via Wompi y EUR via SumUp. */
(function () {
  'use strict';
  var cfg = window.PaymentConfig || {};

  cfg.proveedorPorMoneda = Object.assign({}, cfg.proveedorPorMoneda || {}, {
    EUR: 'sumup',
    COP: 'wompi',
  });
  cfg.retorno = {
    exito: 'gracias.html',
    cancelado: 'index.html?donacion=cancelada#donar',
  };
  cfg.supabase = Object.assign({}, cfg.supabase || {}, {
    funcionDonacion: 'crear-donacion-wompi-colombia',
  });
  cfg.sumup = Object.assign({}, cfg.sumup || {}, {
    funcionDonacion: 'crear-donacion-sumup',
  });
  cfg.wompi = Object.assign({}, cfg.wompi || {}, {
    sdkUrl: 'https://checkout.wompi.co/widget.js',
    funcionDonacion: 'crear-donacion-wompi-colombia',
  });

  window.PaymentConfig = cfg;
})();
