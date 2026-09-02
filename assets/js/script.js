(() => {
  'use strict';

  /* ============ Header scroll state ============ */
  const header = document.getElementById('site-header');
  const backToTop = document.getElementById('back-to-top');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    backToTop.classList.toggle('is-visible', window.scrollY > 480);
  };

  /* ============ Mobile nav toggle ============ */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  const closeNav = () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  /* ============ Back to top ============ */
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ Reveal on scroll (with resilient fallbacks) ============ */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    revealItems.forEach(item => revealObserver.observe(item));

    let revealCheckPending = false;
    const revealFallbackCheck = () => {
      revealCheckPending = false;
      document.querySelectorAll('.reveal:not(.is-visible)').forEach(item => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) item.classList.add('is-visible');
      });
    };
    window.addEventListener('scroll', () => {
      if (revealCheckPending) return;
      revealCheckPending = true;
      requestAnimationFrame(revealFallbackCheck);
    }, { passive: true });
    window.addEventListener('load', () => window.setTimeout(revealFallbackCheck, 400));
    window.setTimeout(() => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach(item => item.classList.add('is-visible'));
    }, 4000);
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  /* ============ Animated counters ============ */
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = el => {
    const target = parseFloat(el.getAttribute('data-count'));
    const duration = 1400;
    const start = performance.now();
    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  /* ============ Footer year ============ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ FAQ accordion ============ */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(open => {
        if (open !== item) {
          open.classList.remove('is-open');
          open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ============ Calculadora de monopolio ============ */
  const calcZona = document.getElementById('calc-zona');
  const calcPenetracion = document.getElementById('calc-penetracion');
  const calcPenetracionValue = document.getElementById('calc-penetracion-value');
  const calcClientes = document.getElementById('calc-clientes');
  const calcFacturacion = document.getElementById('calc-facturacion');
  const calcReventa = document.getElementById('calc-reventa');

  const REVENUE_PER_CLIENT = 3600;
  const EBITDA_MARGIN = 0.6;
  const RESALE_MULTIPLE = 5;

  const formatInt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatEUR = n => formatInt(n) + ' €';

  const updateCalculator = () => {
    if (!calcZona || !calcPenetracion) return;
    const tam = parseFloat(calcZona.value);
    const penetracion = parseFloat(calcPenetracion.value) / 100;
    const clientes = tam * penetracion;
    const facturacion = clientes * REVENUE_PER_CLIENT;
    const ebitda = facturacion * EBITDA_MARGIN;
    const reventa = ebitda * RESALE_MULTIPLE;

    calcPenetracionValue.textContent = parseFloat(calcPenetracion.value).toFixed(1) + '%';
    calcClientes.textContent = formatInt(clientes) + ' clientes';
    calcFacturacion.textContent = formatEUR(facturacion);
    calcReventa.textContent = formatEUR(reventa);
  };
  if (calcZona && calcPenetracion) {
    calcZona.addEventListener('change', updateCalculator);
    calcPenetracion.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  /* ============ Chat simulado ("Prueba de Turing") ============ */
  const chatLog = document.getElementById('chat-log');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  const CHAT_RESPONSES = {
    canon: 'El canon de entrada es de 50.000€ llave en mano: incluye derechos de marca, equipamiento tech, formación inicial en Labs Academy, stock de productos y fondo de maniobra. Sin gastos ocultos.',
    royalties: 'Además del canon inicial, existe un canon de mantenimiento mensual sobre el uso de los servidores e IA de Labs24k: tú recibes una comisión pasiva cada mes, sin coste operativo añadido para ti.',
    tiempos: 'Nuestro "Protocolo de Lanzamiento 45 días" cubre desde la firma hasta la facturación: búsqueda del local, adecuación express, formación Founder Level e inauguración con IA.',
    default: 'Buena pregunta. Un consultor de expansión puede darte el detalle exacto para tu zona — te recomiendo enviar tu solicitud en el formulario de más abajo para que Dirección General te contacte directamente.'
  };

  const appendBubble = (text, who) => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-${who}`;
    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const respond = topicKey => {
    window.setTimeout(() => {
      appendBubble(CHAT_RESPONSES[topicKey] || CHAT_RESPONSES.default, 'bot');
    }, 500);
  };

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const topic = chip.getAttribute('data-topic');
      appendBubble(chip.textContent, 'user');
      respond(topic);
    });
  });

  if (chatForm) {
    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      const value = chatInput.value.trim();
      if (!value) return;
      appendBubble(value, 'user');
      chatInput.value = '';
      respond('default');
    });
  }

  /* ============ Admission form validation ============ */
  const form = document.getElementById('admision-form');
  const successPanel = document.getElementById('form-success');

  if (form) {
    const validators = {
      nombre: v => v.trim().length >= 2 || 'Introduce tu nombre y apellidos.',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Introduce un correo válido.',
      telefono: v => /^[+\d][\d\s()-]{6,}$/.test(v) || 'Introduce un teléfono válido.',
      zona: v => v.trim().length >= 2 || 'Indica la zona que deseas liderar.',
      inversion: v => v !== '' || 'Selecciona una opción.',
      motivacion: v => v.trim().length >= 10 || 'Cuéntanos un poco más (mínimo 10 caracteres).'
    };

    const setFieldError = (field, message) => {
      const wrap = field.closest('.field');
      const errorEl = wrap.querySelector('.field-error');
      wrap.classList.toggle('has-error', Boolean(message));
      errorEl.textContent = message || '';
    };

    const validateField = field => {
      const rule = validators[field.name];
      if (!rule) return true;
      const result = rule(field.value, field);
      const isValid = result === true;
      setFieldError(field, isValid ? '' : result);
      return isValid;
    };

    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      const evt = field.tagName === 'SELECT' ? 'change' : 'blur';
      field.addEventListener(evt, () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.field').classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      let isFormValid = true;
      Object.keys(validators).forEach(name => {
        const field = form.elements[name];
        if (!field) return;
        if (!validateField(field)) isFormValid = false;
      });

      if (!isFormValid) {
        const firstError = form.querySelector('.field.has-error input, .field.has-error select, .field.has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const label = submitBtn.querySelector('.btn-label');
      submitBtn.disabled = true;
      label.textContent = 'Enviando...';

      /* Simulated submission — replace with a real endpoint integration. */
      window.setTimeout(() => {
        form.hidden = true;
        successPanel.hidden = false;
        successPanel.setAttribute('tabindex', '-1');
        successPanel.focus();
      }, 900);
    });
  }

  /* ============ Ambient hero canvas (subtle drifting fiber lines) ============ */
  const canvas = document.getElementById('fx-canvas');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && canvas.getContext && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width, height, lines;

    const rand = (min, max) => Math.random() * (max - min) + min;

    const buildLines = () => {
      const count = Math.max(5, Math.min(11, Math.floor(width / 220)));
      lines = Array.from({ length: count }, () => ({
        y: rand(0, height * 0.7),
        amp: rand(20, 60),
        speed: rand(0.15, 0.4),
        offset: rand(0, Math.PI * 2),
        hue: Math.random() > 0.5 ? '32,236,252' : '168,85,247'
      }));
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.min(window.innerHeight, 900);
      buildLines();
    };

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      lines.forEach(line => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 20) {
          const y = line.y + Math.sin(x * 0.004 + t * line.speed + line.offset) * line.amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${line.hue},.12)`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      });
      t += 0.01;
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    requestAnimationFrame(draw);
  }

})();
