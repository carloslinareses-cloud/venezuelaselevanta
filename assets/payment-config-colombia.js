/* Configuracion de pagos para /colombia/: COP via Wompi. */
(function () {
  'use strict';
  var cfg = window.PaymentConfig || {};

  cfg.proveedorPorMoneda = { COP: 'wompi' };
  cfg.retorno = {
    exito: 'gracias.html',
    cancelado: 'index.html?donacion=cancelada#donar',
  };
  cfg.supabase = Object.assign({}, cfg.supabase || {}, {
    funcionDonacion: 'crear-donacion-wompi-colombia',
  });
  cfg.wompi = {
    sdkUrl: 'https://checkout.wompi.co/widget.js',
    funcionDonacion: 'crear-donacion-wompi-colombia',
  };

  window.PaymentConfig = cfg;
})();
