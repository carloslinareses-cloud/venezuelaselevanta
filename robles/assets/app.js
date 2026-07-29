(function () {
  "use strict";

  /* ============================================================
   *  EDITA AQUÍ — datos de la campaña
   * ============================================================ */
  const CONFIG = {
    // Backend de pagos: lo define assets/api-base.js (vacío = mismo dominio).
    apiBase: window.ROBLES_API_BASE || "",
    metaEur: 10000, // meta en euros (el recaudado se lee automáticamente de /api/stats)
    // Datos de la Junta de Condominio
    entidad: "Junta de Condominio Los Robles Torre B",
    rif: "J-501036594",
    contactoNombre: "Bárbara Bohorques",
    email: "admlosroblesb@hotmail.com",
    whatsapp: "584129331278", // 0412-9331278 en formato internacional
    whatsappVisible: "+58 412-9331278",
    numFotos: 35, // fotos de daños en assets/img/ (dano-01.jpeg ... dano-35.jpeg)
    // Fotos que NO muestran estructura sino tabiquería (pared divisoria
    // separada del techo). Se describen aparte: llamarlas "daño estructural"
    // sería inexacto y a esta campaña una exageración le costaría la
    // credibilidad entera.
    fotosTabiqueria: [33, 34, 35],
    // Fotos tomadas en el cuarto de máquinas del ascensor, que está en la
    // azotea. Es donde más grietas se aprecian. Sin decirlo, quien las mira
    // ve una construcción baja con alero y no la relaciona con una torre de
    // diez pisos: el contexto es lo que las hace creíbles.
    fotosCuartoMaquinas: [28, 29, 30, 31, 32],
    // Fotos de presupuestos/informe en assets/img/ (presupuesto-01.jpeg, -02…).
    // Al poner un número > 0 aparece automáticamente la sección "Presupuestos".
    numPresupuestos: 0,
  };

  /* ============================================================
   *  EDITA AQUÍ — traducciones al inglés
   *  (el español se toma automáticamente del index.html)
   *  Las claves que no estén aquí se quedan en español.
   * ============================================================ */
  const EN = {
    "meta.title": "Help for Tower B — Bosque Real, Charallave",
    "meta.desc":
      "Solidarity campaign to repair Tower B in the Bosque Real Residential Complex, Los Robles building, Charallave, Venezuela, damaged by an earthquake.",
    "brand.name": "Robles Relief",
    "brand.tag": "Bosque Real · Charallave",
    "nav.donate": "Donate",

    "hero.kicker": "After the earthquake",
    "hero.title": "Help us repair Tower B in the Los Robles building",
    "hero.subtitle":
      "On 24 June 2026, two earthquakes of magnitude 7.2 and 7.5 struck northern Venezuela. Our building was left with structural damage, the elevator out of service and railings split apart. We are the neighbours, and we are asking for help to repair it.",
    "meta.math": "<strong>200 donations of €50</strong> complete the goal.",
    "hero.location":
      "📍 Bosque Real Residential Complex · Los Robles building · Tower B · Charallave, Venezuela",
    "hero.ctaDonate": "Donate now",
    "hero.ctaLearn": "See the damage",
    "hero.caption":
      "This is Tower B, in the Bosque Real residential complex. It is the building shown in every photo on this page.",

    "situacion.title": "What is happening?",
    "situacion.body":
      "<p>On <strong>24 June 2026</strong>, at 6:04 in the evening, a magnitude <strong>7.2</strong> earthquake struck northern Venezuela with its epicentre near San Felipe, in Yaracuy state. Thirty-nine seconds later a second quake followed, magnitude <strong>7.5</strong>. It was one of the worst natural disasters in the country's recent history.</p><p>Our building — Tower B in the Bosque Real Residential Complex, Los Robles building, Charallave — was left standing, but <strong>damaged in its structure</strong>. The photos on this page show vertical cracks running the full height of <strong>columns</strong>, spalled concrete at the <strong>beam-column joints</strong>, <strong>cracked floor slabs</strong> and diagonally cracked walls, including the rooftop structure.</p><p>The <strong>elevator stopped working</strong> and several <strong>balcony railings split apart</strong> completely: in some you can see daylight through the crack.</p><p>Tower B has <strong>84 affected flats</strong>: ten floors of eight flats each, plus four penthouses. What needs repairing is the whole building — the structure, the elevator and the railings — not one individual home, and that is beyond what we can raise here: wages are paid in bolívares.</p><p>That is why we are asking for help outside Venezuela. What we are asking for is concrete: <strong>repair the structure, get the elevator running and secure the railings</strong>.</p>",

    "goal.title": "Our goal",
    "meta.of": "of",
    "meta.note":
      "The amount raised updates automatically from payments confirmed by SumUp. It is not a hand-written number.",

    "uso.title": "How your help will be used",
    "uso.estimacion":
      "<strong>About the €10,000:</strong> this is the Condominium Board's preliminary estimate based on the visible damage. The technical assessment of the building has been arranged and we will publish the itemised quotes here. If the final figure changes, we will say so on this same page.",
    "uso.item1": "Structural repair: columns, beams and beam-column joints",
    "uso.item2": "Elevator repair",
    "uso.item3": "Cracked walls, safety railings and rooftop",

    "donar.title": "Make your donation",
    "donar.subtitle": "Secure card payment through SumUp. Amounts are in euros (€).",
    "donar.amountLabel": "Choose an amount",
    "donar.customLabel": "Other amount (€)",
    "donar.continue": "Continue to payment",
    "trust.secure": "🔒 Secure payment processed by SumUp",
    "trust.card": "💳 Your card details never pass through this site",
    "trust.auto": "📊 The amount raised updates automatically",

    "donar.thanksTitle": "Thank you for your help!",
    "donar.thanksBody":
      "Your donation helps give the families of Tower B a safe home again.",
    "donar.venezuela": "🇻🇪 In Venezuela? Help via pago móvil in bolívares →",
    "donar.fallback": "Prefer another way, or having trouble paying? Write to us:",
    "donar.contactCta": "Contact us",

    "pm.title": "In Venezuela? Help via pago móvil",
    "pm.intro":
      "The card payment above is in euros and is meant for those helping from abroad. If you are <strong>inside Venezuela</strong>, you can contribute in bolívares via <strong>pago móvil</strong> to the Condominium Board's account.",
    "pm.qrNote": "Scan it from your banking app",
    "pm.datosTitle": "Or enter the details manually:",
    "pm.banco": "Bank",
    "pm.rif": "Tax ID (RIF)",
    "pm.tel": "Phone",
    "pm.titular": "Account name",
    "pm.copiar": "Copy",
    "pm.aviso":
      "⚠️ <strong>Important:</strong> contributions via pago móvil <strong>do not appear automatically</strong> in the counter above, because that counter only reads card payments.<br><br><strong>Send us a screenshot of your payment</strong> to the building administration's email, <a class='pm-correo' href='#'>admlosroblesb@hotmail.com</a>, or on WhatsApp. It is the only way your contribution gets counted: we add it manually, report it under <a href='#actualizaciones'>Updates</a> and can thank you for it.",

    "verif.title": "Check it for yourself",
    "verif.note":
      "You don't have to take our word about the earthquake: it was world news. These media and institutions report the quake; <strong>they do not endorse this campaign</strong>.",

    "danos.title": "What you see in the photos and what it means",
    "danos.note": "Not every crack is the same. This is what the photos show.",
    "danos.col1": "What you see",
    "danos.col2": "What it means",
    "danos.r1a": "Vertical cracks running the full height of a column",
    "danos.r1b":
      "Columns hold the building up. A crack like this means that element was pushed to its limit during the quake.",
    "danos.r2a": "Concrete blown out where a beam meets a column",
    "danos.r2b":
      "This is the point that suffers most in an earthquake. When the concrete spalls, the inside of the element is left exposed.",
    "danos.r3a": "Diagonal stair-step cracks following the block joints",
    "danos.r3b": "This is the classic signature of earthquake stress on a wall.",
    "danos.r4a": "Balcony railings and parapets split and pulled apart",
    "danos.r4b":
      "Immediate risk of falling debris over the edge. This is the most urgent thing to secure.",
    "danos.r5a": "Cracked floor slabs and separated tiles",
    "danos.r5b": "The structure moved enough to fracture the floor.",
    "danos.ascensorPie":
      "Technical inspection of the elevator: it marks the bent counterweight rail and the gap between the counterweight and the rail. The rail has to be replaced.",
    "danos.r6a": "Elevator: the counterweight rail was bent",
    "danos.r6b":
      "With the rail bent, the counterweight came away from its guide. That is why the elevator is out of service: the rail has to be replaced before it can run safely again.",
    "danos.r8a":
      "The elevator machine room, up on the roof, is where the most cracks can be seen",
    "danos.r8b":
      "It is the small structure on top of the building that houses the machinery driving the elevator. Several photos on this page were taken there: cracks run right across the wall and in places the render has fallen away, leaving the block exposed. Being a small structure on the roof, it does not look like a ten-storey building in the photo, but it is one.",
    "danos.r7a":
      "The top of an interior wall pulled away from the ceiling: an open gap, plaster broken off and loose pieces hanging",
    "danos.r7b":
      "What is damaged here is a partition wall and its joint with the ceiling, not a column or a beam. It is the kind of damage that shows up when the structure moves and the wall, which is stiff and brittle, does not follow it. It has to be repaired, and in the meantime the loose pieces of plaster can fall on anyone walking underneath.",

    "transp.title": "How we handle the money",
    "transp.body":
      "<p>We know that donating to a group of neighbours in another country takes trust. That is why we commit to the following:</p>",
    "transp.item1":
      "The funds are managed by the <strong>Los Robles Tower B Condominium Board</strong> (tax ID <strong>J-501036594</strong>), which reports to the building's owners' assembly.",
    "transp.item2":
      "The amount raised shown above <strong>is reported by the payment provider</strong> — we do not type it in ourselves.",
    "transp.item3":
      "We will publish here <strong>what every contribution is used for</strong>, with photos of the work as it progresses.",
    "transp.item4":
      "The <strong>technical assessment of the building has already been arranged</strong>, and the <strong>repair quotes</strong> will be published on this same page, so anyone can see where the figure we are asking for comes from.",

    "updates.title": "Updates",
    "updates.u2date": "July 2026 · Technical assessment",
    "updates.u2body":
      "The technical assessment of the building has been arranged. We will publish the repair quotes here as soon as we have them.",
    "updates.u1date": "July 2026 · Launch",
    "updates.u1body":
      "We launched this campaign. We documented the earthquake damage with photographs of the building and began asking for help with the repairs.",
    "updates.note":
      "We will post every step here: quotes, the engineer's report and the progress of the works.",

    "galeria.title": "Tower B today",
    "galeria.note":
      "Real photos of the damage the earthquake left in Tower B. Tap an image to see it full size.",

    "faq.title": "Frequently asked questions",
    "compartir.title": "Can't donate? Share",
    "compartir.body":
      "Spreading this campaign takes a minute and can be worth as much as a donation. Help it reach someone who can help.",

    "quienes.title": "Who we are",
    "quienes.body":
      "<p>This campaign is organised by the <strong>Los Robles Tower B Condominium Board</strong>, on behalf of the families living in the building in the Bosque Real Residential Complex, Los Robles building, in Charallave. All the help received goes toward the repair of the tower.</p>",
    "quienes.emailLabel": "Email",
    "ficha.entidad": "Organised by",
    "ficha.rif": "Tax ID (RIF)",
    "ficha.contacto": "Contact person",
    "ficha.ubicacion": "Location",
    "ficha.ubicacionValor":
      "Tower B, Bosque Real Residential Complex, Los Robles building, Charallave, Miranda state, Venezuela",

    "footer.location":
      "Bosque Real Residential Complex · Los Robles building · Tower B · Charallave, Miranda state, Venezuela",
    "footer.legal":
      "Campaign organised by the Los Robles Tower B Condominium Board · Tax ID J-501036594 · Contact: Bárbara Bohorques, +58 412-9331278",
  };

  /** URL del backend de pagos (permite alojar la página en otro dominio). */
  function api(ruta) {
    return (CONFIG.apiBase || "") + ruta;
  }

  /* ============================================================
   *  Preguntas frecuentes — responden las dudas reales de un donante
   * ============================================================ */
  const FAQ_ES = [
    {
      q: "¿Quién organiza esta campaña?",
      a: "La <strong>Junta de Condominio Los Robles Torre B</strong>, RIF <strong>J-501036594</strong>, en representación de las familias que viven en el edificio. No somos una ONG ni una empresa: somos la junta de los propios vecinos afectados. Puedes escribirle a <strong>Bárbara Bohorques</strong> por WhatsApp antes de donar.",
    },
    {
      q: "¿Cómo sé que mi donación llega de verdad?",
      a: "El pago lo procesa <strong>SumUp</strong>, una entidad de pagos europea regulada; el dinero entra directamente a la cuenta de la campaña. Además, el monto recaudado que ves en esta página <strong>se actualiza solo</strong> con los pagos que SumUp confirma: no es un número que escribimos a mano.",
    },
    {
      q: "¿En qué se va a gastar exactamente el dinero?",
      a: "En reparar los daños que dejó el terremoto: <strong>la estructura</strong> (columnas, vigas y sus uniones), <strong>el ascensor</strong> y los <strong>elementos de seguridad</strong> como las barandas de los balcones que quedaron partidas. Publicaremos en qué se va usando conforme avancen los trabajos.",
    },
    {
      q: "¿Por qué las donaciones son en euros?",
      a: "Porque la pasarela de pago que usamos procesa en euros y así puede recibir donaciones con tarjeta desde cualquier país. Tu banco hará la conversión desde tu moneda automáticamente.",
    },
    {
      q: "Estoy en Venezuela, ¿puedo ayudar?",
      a: "Sí. Además del pago con tarjeta en euros, tienes <strong>pago móvil en bolívares</strong> a la cuenta de la Junta: Banco de Venezuela (0102), RIF J-501036594, teléfono 0412-9331278. Puedes escanear el <a href='#venezuela'>código QR</a> desde la app de tu banco. Ten en cuenta que esos aportes no entran solos en el contador: los sumamos a mano, así que avísanos por WhatsApp.",
    },
    {
      q: "¿Es seguro donar con mi tarjeta?",
      a: "Sí. El pago se completa en la página segura de SumUp; <strong>los datos de tu tarjeta nunca pasan por este sitio</strong> ni los guardamos.",
    },
    {
      q: "¿Qué pasa si no se alcanza la meta?",
      a: "Todo lo recaudado se destina igualmente a la reparación, empezando por lo más urgente para la seguridad de las familias. Si se recibiera más de lo necesario, el excedente se usaría en las reparaciones pendientes del mismo edificio.",
    },
    {
      q: "¿Se descuenta alguna comisión?",
      a: "Sí. SumUp cobra una comisión por procesar cada pago con tarjeta, como cualquier pasarela. Preferimos decirlo antes que prometer que «el 100 % llega a la obra», porque no sería cierto. Publicaremos el porcentaje exacto de nuestro contrato junto con los presupuestos.",
    },
    {
      q: "¿Es deducible de impuestos?",
      a: "No. No somos una fundación ni una ONG registrada, así que <strong>tu donación no da derecho a deducción fiscal</strong> en ningún país. Es una donación privada entre particulares para reparar un edificio de viviendas.",
    },
    {
      q: "¿Por qué no lo paga el Estado o un seguro?",
      a: "El terremoto del 24 de junio afectó a miles de edificios en varios estados del país y la respuesta pública está desbordada. Publicaremos en esta página cualquier respuesta oficial o de seguro que recibamos, con su fecha.",
    },
    {
      q: "¿Por qué debería creerles?",
      a: "Porque puedes comprobar casi todo por tu cuenta: el terremoto fue noticia mundial (te dejamos los enlaces arriba), las fotos son del edificio y podemos enviarte los originales, y el dinero recaudado lo reporta la pasarela de pago, no nosotros. Si quieres hablar con alguien de la Junta antes de donar, escríbenos y coordinamos una videollamada desde el propio edificio.",
    },
    {
      q: "No puedo donar. ¿Puedo ayudar de otra forma?",
      a: "Sí, y mucho: <strong>comparte esta página</strong>. Que llegue a alguien que pueda ayudar vale tanto como una donación.",
    },
  ];

  const FAQ_EN = [
    {
      q: "Who is organising this campaign?",
      a: "The <strong>Los Robles Tower B Condominium Board</strong>, tax ID (RIF) <strong>J-501036594</strong>, on behalf of the families living in the building. We are not an NGO or a company: we are the board of the affected neighbours themselves. You can message <strong>Bárbara Bohorques</strong> on WhatsApp before donating.",
    },
    {
      q: "How do I know my donation actually arrives?",
      a: "Payments are processed by <strong>SumUp</strong>, a regulated European payment institution, and go directly to the campaign account. On top of that, the amount raised shown on this page <strong>updates by itself</strong> from the payments SumUp confirms — it is not a number we type in by hand.",
    },
    {
      q: "What exactly will the money be spent on?",
      a: "Repairing the earthquake damage: the <strong>structure</strong> (columns, beams and their joints), the <strong>elevator</strong>, and <strong>safety elements</strong> such as the balcony railings that split apart. We will publish how the funds are used as the work progresses.",
    },
    {
      q: "Why are donations in euros?",
      a: "Because our payment provider processes in euros, which lets us receive card donations from any country. Your bank converts from your currency automatically.",
    },
    {
      q: "I'm in Venezuela — can I help?",
      a: "Yes. Besides the card payment in euros, there is <strong>pago móvil in bolívares</strong> to the Board's account: Banco de Venezuela (0102), RIF J-501036594, phone 0412-9331278. You can scan the <a href='#venezuela'>QR code</a> from your banking app. Note that those contributions do not enter the counter by themselves: we add them manually, so please let us know on WhatsApp.",
    },
    {
      q: "Is it safe to donate with my card?",
      a: "Yes. The payment is completed on SumUp's secure page; <strong>your card details never pass through this site</strong> and we never store them.",
    },
    {
      q: "What if the goal isn't reached?",
      a: "Everything raised still goes to the repairs, starting with what is most urgent for the families' safety. If more than needed were received, the surplus would go to the remaining repairs of the same building.",
    },
    {
      q: "Is any fee deducted?",
      a: "Yes. SumUp charges a fee for processing each card payment, like any payment gateway. We would rather say so than promise that «100% reaches the works», because that would not be true. We will publish the exact percentage of our contract along with the quotes.",
    },
    {
      q: "Is my donation tax deductible?",
      a: "No. We are not a foundation or a registered NGO, so <strong>your donation does not qualify for a tax deduction</strong> in any country. It is a private donation between individuals to repair a residential building.",
    },
    {
      q: "Why doesn't the State or an insurer pay for it?",
      a: "The 24 June earthquake hit thousands of buildings across several states and the public response is overwhelmed. We will publish on this page any official or insurance response we receive, with its date.",
    },
    {
      q: "Why should I believe you?",
      a: "Because you can check almost everything yourself: the earthquake was world news (links above), the photos are of the building and we can send you the originals, and the amount raised is reported by the payment gateway, not by us. If you want to speak with someone from the Board before donating, write to us and we will arrange a video call from the building itself.",
    },
    {
      q: "I can't donate. Can I help another way?",
      a: "Yes, and it matters a lot: <strong>share this page</strong>. Reaching someone who can help is worth as much as a donation.",
    },
  ];

  /* ============================================================
   *  i18n (el español se captura del DOM)
   * ============================================================ */
  const ES = {};

  function capturarES() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (ES[key] === undefined) {
        ES[key] = el.tagName === "META" ? el.getAttribute("content") : el.innerHTML.trim();
      }
    });
  }

  function aplicarIdioma(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = lang === "en" ? EN[key] : ES[key];
      if (val === undefined) return;
      if (el.tagName === "META") el.setAttribute("content", val);
      else el.innerHTML = val;
    });
    const toggle = document.getElementById("lang-toggle");
    if (toggle) toggle.textContent = lang === "en" ? "ES" : "EN";
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {
      /* ignore */
    }
    aplicarConfig();
    // Estos bloques se generan por JS: hay que rehacerlos al cambiar de idioma.
    initCompartir();
    initFaq();
    pintarMontos();
    actualizarBoton();
  }

  function aplicarConfig() {
    pintarProgreso();
    // Oculta los datos de contacto mientras sean de ejemplo (hasta tener los reales).
    const emailReal = CONFIG.email && CONFIG.email !== "CORREO@EJEMPLO.com";
    const waReal = CONFIG.whatsapp && CONFIG.whatsapp !== "000000000000";
    const waUrl = "https://wa.me/" + CONFIG.whatsapp;

    // El correo del aviso de pago móvil sale de CONFIG, no escrito a mano, y se
    // rehace en cada cambio de idioma porque aplicarIdioma reescribe el bloque.
    // El asunto viene puesto para que llegue identificado y sea fácil de sumar.
    document.querySelectorAll("a.pm-correo").forEach((a) => {
      if (!emailReal) return;
      a.textContent = CONFIG.email;
      a.href =
        "mailto:" + CONFIG.email +
        "?subject=" + encodeURIComponent("Captura de pago móvil - Torre B Los Robles");
    });

    const emailCard = document.getElementById("contact-email");
    if (emailReal) {
      const emailSmall = document.querySelector("#contact-email small");
      if (emailSmall) emailSmall.textContent = CONFIG.email;
      if (emailCard) {
        emailCard.href = "mailto:" + CONFIG.email;
        emailCard.hidden = false;
      }
    } else if (emailCard) {
      emailCard.hidden = true;
    }

    const wa = document.getElementById("contact-whatsapp");
    if (wa) {
      if (waReal) {
        wa.href = waUrl;
        const waSmall = wa.querySelector("small");
        if (waSmall) waSmall.textContent = CONFIG.whatsappVisible || "+" + CONFIG.whatsapp;
        const waName = wa.querySelector(".contact-person");
        if (waName && CONFIG.contactoNombre) waName.textContent = CONFIG.contactoNombre;
        wa.hidden = false;
      } else {
        wa.hidden = true;
      }
    }

    // El enlace de "contáctanos" del bloque de donación apunta a lo que exista.
    const fallbackLink = document.getElementById("contact-link-donate");
    if (fallbackLink) {
      fallbackLink.href = emailReal ? "mailto:" + CONFIG.email : waUrl;
      if (!emailReal && waReal) {
        fallbackLink.target = "_blank";
        fallbackLink.rel = "noopener";
      }
    }
    const fallback = document.querySelector(".donar-fallback");
    if (fallback) fallback.hidden = !(emailReal || waReal);

    // Identidad de la junta (RIF, entidad) allí donde aparezca.
    document.querySelectorAll("[data-campo]").forEach((el) => {
      const v = CONFIG[el.dataset.campo];
      if (v) el.textContent = v;
    });
  }

  /* ============================================================
   *  Compartir la campaña (difundir vale tanto como donar)
   * ============================================================ */
  function initCompartir() {
    const cont = document.getElementById("share-buttons");
    if (!cont) return;
    const en = document.documentElement.lang === "en";
    const url = location.origin + location.pathname;
    const texto = en
      ? "Help repair Tower B in Los Robles, Charallave, damaged by the June 24 earthquake:"
      : "Ayuda a reparar la Torre B del edificio Los Robles, en Charallave, dañada por el terremoto del 24 de junio:";
    const enc = encodeURIComponent;

    // El menú nativo del teléfono va primero (convierte mejor en móvil), pero
    // siempre se muestran también las opciones concretas: si solo hubiera un
    // botón genérico, parece que no hace nada.
    const nativo = navigator.share
      ? '<button type="button" class="share-btn share-native" id="share-native">📲 ' +
        (en ? "Share" : "Compartir") +
        "</button>"
      : "";

    cont.innerHTML =
      nativo +
      '<a class="share-btn share-wa" target="_blank" rel="noopener" href="https://wa.me/?text=' +
      enc(texto + " " + url) +
      '">WhatsApp</a>' +
      '<a class="share-btn share-fb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' +
      enc(url) +
      '">Facebook</a>' +
      '<a class="share-btn share-x" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=' +
      enc(texto) +
      "&url=" +
      enc(url) +
      '">X</a>' +
      '<button type="button" class="share-btn share-copy" id="share-copy">' +
      (en ? "Copy link" : "Copiar enlace") +
      "</button>";

    const nb = document.getElementById("share-native");
    if (nb) {
      nb.addEventListener("click", function () {
        navigator
          .share({ title: document.title, text: texto, url: url })
          .catch(function () {
            /* el usuario canceló el menú de compartir */
          });
      });
    }

    const btn = document.getElementById("share-copy");
    if (btn) {
      btn.addEventListener("click", async function () {
        const original = btn.textContent;
        try {
          await navigator.clipboard.writeText(url);
        } catch (e) {
          // Respaldo para navegadores sin permiso de portapapeles
          const tmp = document.createElement("input");
          tmp.value = url;
          document.body.appendChild(tmp);
          tmp.select();
          try {
            document.execCommand("copy");
          } catch (e2) {
            /* nada más que hacer */
          }
          document.body.removeChild(tmp);
        }
        btn.textContent = en ? "Link copied ✓" : "Enlace copiado ✓";
        btn.classList.add("copiado");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("copiado");
        }, 2000);
      });
    }
  }

  /* ============================================================
   *  Copiar los datos del pago móvil (evita transcribir a mano)
   * ============================================================ */
  async function copiarTexto(txt) {
    try {
      await navigator.clipboard.writeText(txt);
      return true;
    } catch (e) {
      const tmp = document.createElement("input");
      tmp.value = txt;
      document.body.appendChild(tmp);
      tmp.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e2) {
        ok = false;
      }
      document.body.removeChild(tmp);
      return ok;
    }
  }

  function initPagoMovil() {
    document.querySelectorAll(".pm-copy").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        const destino = document.getElementById(btn.dataset.copiar);
        if (!destino) return;
        const en = document.documentElement.lang === "en";
        await copiarTexto(destino.textContent.trim());
        const original = btn.textContent;
        btn.textContent = en ? "Copied ✓" : "Copiado ✓";
        btn.classList.add("copiado");
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("copiado");
        }, 1800);
      });
    });
  }

  /* ============================================================
   *  Botón flotante: estorba cuando la tarjeta de donar ya se ve
   * ============================================================ */
  function initFlotante() {
    const btn = document.getElementById("floating-donate");
    const panel = document.getElementById("donar");
    if (!btn || !panel || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          btn.classList.toggle("oculto", e.isIntersecting);
        });
      },
      { threshold: 0.25 },
    );
    obs.observe(panel);
  }

  /* ============================================================
   *  Preguntas frecuentes (acordeón)
   * ============================================================ */
  function initFaq() {
    const cont = document.getElementById("faq-list");
    if (!cont) return;
    const en = document.documentElement.lang === "en";
    const items = en ? FAQ_EN : FAQ_ES;
    cont.innerHTML = items
      .map(
        (f) =>
          "<details class='faq-item'><summary>" +
          f.q +
          "</summary><div class='faq-answer'>" +
          f.a +
          "</div></details>",
      )
      .join("");
  }

  /* ============================================================
   *  Donación con SumUp
   * ============================================================ */
  // Montos sugeridos. Las etiquetas son ARITMÉTICA VERIFICABLE sobre la meta,
  // no equivalencias inventadas ("50 € = una baranda"), que serían falsas
  // mientras no haya presupuestos firmados.
  const MONTOS = [
    { v: 25, es: "1 de las 400 donaciones que completan la meta", en: "1 of the 400 donations that complete the goal" },
    { v: 50, es: "Sugerido por los organizadores", en: "Suggested by the organisers", sugerido: true },
    { v: 100, es: "El 1 % de toda la reparación", en: "1% of the whole repair" },
    { v: 250, es: "El 2,5 % de la meta", en: "2.5% of the goal" },
    { v: 500, es: "El 5 % de la meta", en: "5% of the goal" },
  ];

  let montoSeleccionado = 0;

  function textoBoton(monto) {
    const en = document.documentElement.lang === "en";
    if (!monto) return en ? "Choose an amount" : "Elige un monto";
    return (en ? "Donate " : "Donar ") + fmtEur(monto) + (en ? " · secure payment" : " · pago seguro");
  }

  function actualizarBoton() {
    const btn = document.getElementById("donate-btn");
    const label = document.getElementById("donate-btn-label");
    if (!btn || !label) return;
    label.textContent = textoBoton(montoSeleccionado);
    btn.disabled = !(montoSeleccionado >= 1);
  }

  function pintarMontos() {
    const grid = document.getElementById("amount-grid");
    if (!grid) return;
    const en = document.documentElement.lang === "en";
    grid.innerHTML = MONTOS.map(
      (m) =>
        '<button type="button" class="amount-btn' +
        (m.v === montoSeleccionado ? " selected" : "") +
        '" data-amount="' +
        m.v +
        '">' +
        fmtEur(m.v) +
        (m.sugerido
          ? '<span class="amount-tag">' + (en ? "Suggested" : "Sugerido") + "</span>"
          : "") +
        "</button>",
    ).join("");
    pintarHint();
  }

  function pintarHint() {
    const hint = document.getElementById("amount-hint");
    if (!hint) return;
    const en = document.documentElement.lang === "en";
    const m = MONTOS.find((x) => x.v === montoSeleccionado);
    hint.textContent = m ? (en ? m.en : m.es) : "";
  }

  function initDonar() {
    const grid = document.getElementById("amount-grid");
    const custom = document.getElementById("custom-amount");
    const btn = document.getElementById("donate-btn");
    const status = document.getElementById("donate-status");
    if (!grid || !btn) return;

    // 50 € preseleccionado: reduce la fricción de decidir. Es "sugerido por los
    // organizadores" (cierto), nunca "el más elegido" (sería falso con 0 donaciones).
    if (!montoSeleccionado) montoSeleccionado = 50;
    pintarMontos();
    actualizarBoton();

    grid.addEventListener("click", (e) => {
      const b = e.target.closest(".amount-btn");
      if (!b) return;
      if (custom) custom.value = "";
      montoSeleccionado = Math.floor(Number(b.dataset.amount) || 0);
      pintarMontos();
      actualizarBoton();
    });

    if (custom) {
      custom.addEventListener("input", () => {
        montoSeleccionado = Math.floor(Number(custom.value) || 0);
        grid.querySelectorAll(".amount-btn").forEach((x) => x.classList.remove("selected"));
        pintarHint();
        actualizarBoton();
      });
    }

    btn.addEventListener("click", () => iniciarPago(btn, status));
  }

  async function iniciarPago(btn, status) {
    if (montoSeleccionado < 1) return;
    const lang = document.documentElement.lang;
    btn.disabled = true;
    mostrarStatus(
      status,
      "info",
      lang === "en" ? "Preparing secure payment…" : "Preparando el pago seguro…",
    );
    try {
      const returnUrl = new URL("gracias.html", location.href).href;
      const res = await fetch(api("/api/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: montoSeleccionado, returnUrl }),
      });
      const data = await res.json();
      if (!res.ok || (!data.hostedUrl && !data.checkoutId)) {
        throw new Error(data.error || "checkout");
      }
      // Primario: redirigir al Hosted Checkout de SumUp (robusto ante adblockers).
      if (data.hostedUrl) {
        window.location.href = data.hostedUrl;
        return;
      }
      // Respaldo: widget embebido en la página.
      status.hidden = true;
      const step = document.getElementById("amount-step");
      if (step) step.hidden = true;
      montarWidget(data.checkoutId, status, lang);
    } catch (err) {
      btn.disabled = false;
      mostrarStatus(
        status,
        "error",
        lang === "en"
          ? "We couldn't start the payment. Please try again or contact us."
          : "No pudimos iniciar el pago. Intenta de nuevo o escríbenos.",
      );
    }
  }

  function montarWidget(checkoutId, status, lang) {
    if (typeof SumUpCard === "undefined") {
      mostrarStatus(
        status,
        "error",
        lang === "en"
          ? "The payment form could not load. Check your connection."
          : "El formulario de pago no cargó. Revisa tu conexión.",
      );
      return;
    }
    SumUpCard.mount({
      checkoutId: checkoutId,
      locale: lang === "en" ? "en-GB" : "es-ES",
      donateSubmitButton: true,
      onResponse: function (type, body) {
        const pagado = type === "success" || (body && body.status === "PAID");
        if (pagado) {
          const card = document.getElementById("sumup-card");
          if (card) card.innerHTML = "";
          const ok = document.getElementById("donate-success");
          if (ok) ok.hidden = false;
        } else if (type === "error" || type === "fail") {
          mostrarStatus(
            status,
            "error",
            lang === "en"
              ? "Payment could not be completed."
              : "El pago no pudo completarse.",
          );
        }
      },
    });
  }

  function mostrarStatus(el, tipo, msg) {
    if (!el) return;
    el.className = "donate-status " + tipo;
    el.textContent = msg;
    el.hidden = false;
  }

  /* ============================================================
   *  Progreso real de la campaña (datos verificados de SumUp)
   * ============================================================ */
  const estado = { raised: 0, count: 0, goal: CONFIG.metaEur };

  const fmtEur = (n) =>
    "€" +
    Number(n || 0).toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: Number(n) % 1 === 0 ? 0 : 2,
    });

  function pintarProgreso() {
    const en = document.documentElement.lang === "en";
    const goal = document.getElementById("meta-goal");
    const raised = document.getElementById("meta-raised");
    const of = document.getElementById("meta-of");
    const bar = document.getElementById("progress-bar");
    const barra = document.getElementById("progress");
    const donantes = document.getElementById("meta-donantes");
    const hayAlgo = estado.raised > 0;

    if (goal) goal.textContent = fmtEur(estado.goal);
    if (raised) {
      raised.textContent = fmtEur(estado.raised);
      raised.hidden = !hayAlgo;
    }
    // Sin donaciones aún, una barra vacía desanima: se muestra solo la meta.
    if (of) of.textContent = hayAlgo ? (en ? "of" : "de") : en ? "Goal" : "Meta";
    if (barra) barra.hidden = !hayAlgo;
    if (bar) {
      const pct = estado.goal > 0 ? Math.min(100, (estado.raised / estado.goal) * 100) : 0;
      bar.style.width = pct + "%";
    }

    if (donantes) {
      if (estado.count > 0) {
        donantes.textContent =
          estado.count === 1
            ? en
              ? "1 person has donated"
              : "1 persona ha donado"
            : String(estado.count) + (en ? " people have donated" : " personas han donado");
      } else {
        donantes.textContent = en
          ? "Be the first person to donate"
          : "Sé la primera persona en donar";
      }
      donantes.hidden = false;
    }
  }

  async function cargarProgreso() {
    try {
      const r = await fetch(api("/api/stats"), { cache: "no-store" });
      const d = await r.json();
      if (d && typeof d.raised === "number") {
        estado.raised = d.raised;
        estado.count = d.count || 0;
        if (d.goal) estado.goal = d.goal;
        pintarProgreso();
      }
    } catch (e) {
      /* si falla, se mantiene la meta mostrada */
    }
  }

  /* ============================================================
   *  Galería de fotos + lightbox (assets/img/dano-01.jpeg ...)
   * ============================================================ */
  const lbSrcs = [];
  let lbIndex = 0;

  /**
   * `grupos` permite dar un texto alternativo propio a ciertas fotos:
   * [{ indices: [28, 29], alt: "…" }]. No todas las fotos muestran lo mismo y
   * describirlas a todas igual sería inexacto.
   */
  function agregarFotos(contId, prefijo, cantidad, alt, grupos) {
    const cont = document.getElementById(contId);
    if (!cont || !cantidad) return false;
    const grupo = (i) => (grupos || []).find((g) => g.indices.indexOf(i) !== -1);
    let html = "";
    for (let i = 1; i <= cantidad; i++) {
      const nn = String(i).padStart(2, "0");
      const src = "assets/img/" + prefijo + "-" + nn + ".jpeg";
      const idx = lbSrcs.push(src) - 1; // índice global para el lightbox
      const g = grupo(i);
      const alv = (g ? g.alt : alt) + " " + i;
      html +=
        '<a href="' + src + '" data-index="' + idx + '" class="gallery-link">' +
        '<img loading="lazy" src="' + src + '" alt="' + alv + '" /></a>';
    }
    cont.innerHTML = html;
    return true;
  }

  function construirGaleria() {
    lbSrcs.length = 0;
    agregarFotos(
      "gallery",
      "dano",
      CONFIG.numFotos || 0,
      "Daño estructural en la Torre B, Bosque Real —",
      [
        {
          indices: CONFIG.fotosTabiqueria || [],
          alt: "Pared interior separada del techo en la Torre B, Bosque Real —",
        },
        {
          indices: CONFIG.fotosCuartoMaquinas || [],
          alt: "Grietas en el cuarto de máquinas del ascensor, en la azotea de la Torre B —",
        },
      ],
    );
    const hayPresup = agregarFotos(
      "presupuestos-list",
      "presupuesto",
      CONFIG.numPresupuestos || 0,
      "Presupuesto / informe técnico —",
    );
    const sec = document.getElementById("presupuestos");
    if (sec) sec.hidden = !hayPresup;
  }

  function abrirLightbox(i) {
    lbIndex = i;
    const lb = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    if (!lb || !img) return;
    img.src = lbSrcs[i];
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function cerrarLightbox() {
    const lb = document.getElementById("lightbox");
    if (lb) lb.hidden = true;
    document.body.style.overflow = "";
  }
  function navLightbox(delta) {
    if (!lbSrcs.length) return;
    lbIndex = (lbIndex + delta + lbSrcs.length) % lbSrcs.length;
    const img = document.getElementById("lightbox-img");
    if (img) img.src = lbSrcs[lbIndex];
  }
  function initLightbox() {
    // Se escucha en todo el documento y se resuelve la imagen por su ruta:
    // así también funcionan las fotos que están fuera de la galería
    // (por ejemplo la del ascensor, dentro de la sección de daños).
    document.addEventListener("click", function (e) {
      const a = e.target.closest("a.gallery-link");
      if (!a) return;
      const src = a.getAttribute("href");
      let i = lbSrcs.indexOf(src);
      if (i === -1) i = lbSrcs.push(src) - 1;
      e.preventDefault();
      abrirLightbox(i);
    });
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    const cerrar = document.getElementById("lb-close");
    const prev = document.getElementById("lb-prev");
    const next = document.getElementById("lb-next");
    if (cerrar) cerrar.addEventListener("click", cerrarLightbox);
    if (prev) prev.addEventListener("click", function () { navLightbox(-1); });
    if (next) next.addEventListener("click", function () { navLightbox(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) cerrarLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") cerrarLightbox();
      else if (e.key === "ArrowLeft") navLightbox(-1);
      else if (e.key === "ArrowRight") navLightbox(1);
    });
  }

  /* ============================================================
   *  Init
   * ============================================================ */
  document.addEventListener("DOMContentLoaded", function () {
    capturarES();
    let saved = null;
    try {
      saved = localStorage.getItem("lang");
    } catch (e) {
      /* ignore */
    }
    const lang =
      saved || (navigator.language && navigator.language.startsWith("en") ? "en" : "es");
    aplicarIdioma(lang);

    const toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.addEventListener("click", () =>
        aplicarIdioma(document.documentElement.lang === "en" ? "es" : "en"),
      );
    }
    initDonar();
    construirGaleria();
    initLightbox();
    cargarProgreso();
    initCompartir();
    initFaq();
    initFlotante();
    initPagoMovil();
  });
})();
