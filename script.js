/**
 * CONTESUR – script.js
 * Funcionalidades: navbar scroll, menú móvil, animaciones scroll,
 * FAQ accordion, formulario con validación, back to top, año footer.
 */

(function () {
  'use strict';

  /* ============================================================
     1. UTILIDADES
  ============================================================ */

  /** Selecciona un elemento del DOM */
  const $ = (selector) => document.querySelector(selector);
  /** Selecciona múltiples elementos */
  const $$ = (selector) => document.querySelectorAll(selector);

  /* ============================================================
     2. NAVBAR: scroll + menú móvil
  ============================================================ */
  const navbar    = $('#navbar');
  const navToggle = $('#nav-toggle');
  const navMenu   = $('#nav-menu');
  const navLinks  = $$('.nav-link');

  /** Cambia el estilo del navbar al hacer scroll */
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /** Abre/cierra el menú móvil */
  function toggleMobileMenu() {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  /** Cierra el menú móvil */
  function closeMobileMenu() {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  /** Resalta el link activo según la sección visible */
  function updateActiveLink() {
    const sections = $$('section[id]');
    let currentId = '';

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href')?.slice(1);
      link.classList.toggle('active', href === currentId);
    });
  }

  // Cerrar menú al hacer clic en un link
  navLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  navToggle.addEventListener('click', toggleMobileMenu);
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // Estado inicial
  handleNavbarScroll();

  /* ============================================================
     3. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
  ============================================================ */
  const revealEls = $$('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ============================================================
     4. ANIMACIONES HERO (carga inicial)
  ============================================================ */
  const heroAnimEls = $$('.animate-fade-up');

  // Pequeño delay para que la animación se vea tras la carga
  setTimeout(() => {
    heroAnimEls.forEach((el) => el.classList.add('loaded'));
  }, 100);

  /* ============================================================
     5. FAQ ACCORDION
  ============================================================ */
  const faqQuestions = $$('.faq-question');

  faqQuestions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      // Cierra todos los demás
      faqQuestions.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling.classList.remove('open');
        }
      });

      // Alterna el actual
      btn.setAttribute('aria-expanded', String(!isExpanded));
      answer.classList.toggle('open', !isExpanded);
    });
  });

  /* ============================================================
     6. FORMULARIO DE CONTACTO – VALIDACIÓN Y ENVÍO
  ============================================================ */
  const form       = $('#contact-form');
  const submitBtn  = $('#submit-btn');
  const successBox = $('#form-success');

  if (form) {
    /**
     * Valida un campo individual.
     * @param {HTMLElement} field - El campo a validar.
     * @returns {boolean} true si es válido.
     */
    function validateField(field) {
      const id       = field.id;
      const errorEl  = $(`#error-${id}`);
      let   message  = '';

      field.classList.remove('error');

      if (field.hasAttribute('required') && !field.value.trim()) {
        message = 'Este campo es obligatorio.';
      } else if (id === 'email' && field.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value.trim())) {
          message = 'Ingresa un correo electrónico válido.';
        }
      } else if (id === 'telefono' && field.value.trim()) {
        const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
        if (!phoneRegex.test(field.value.trim())) {
          message = 'Ingresa un teléfono válido.';
        }
      }

      if (message) {
        field.classList.add('error');
        if (errorEl) errorEl.textContent = message;
        return false;
      }

      if (errorEl) errorEl.textContent = '';
      return true;
    }

    /** Valida todo el formulario y retorna true si es válido */
    function validateForm() {
      const fields = form.querySelectorAll('[required]');
      let isValid  = true;

      fields.forEach((field) => {
        if (!validateField(field)) isValid = false;
      });

      return isValid;
    }

    // Validación en tiempo real (al perder el foco)
    form.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    // Envío del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      // Estado de carga
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled  = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

      try {
        /**
         * INTEGRACIÓN DE CORREO:
         * Para enviar correos reales, reemplaza el bloque de abajo con:
         *
         * Opción A – Formspree (recomendado para GitHub Pages):
         *   const res = await fetch('https://formspree.io/f/TU_ID', {
         *     method: 'POST',
         *     body: new FormData(form),
         *     headers: { 'Accept': 'application/json' }
         *   });
         *   if (!res.ok) throw new Error('Error al enviar');
         *
         * Opción B – EmailJS:
         *   await emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', form, 'PUBLIC_KEY');
         *
         * Opción C – Backend propio:
         *   const res = await fetch('/api/contact', {
         *     method: 'POST',
         *     headers: { 'Content-Type': 'application/json' },
         *     body: JSON.stringify(getFormData())
         *   });
         */

        // Simulación de envío exitoso (2 segundos)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mostrar mensaje de éxito
        form.reset();
        successBox.style.display = 'flex';
        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Ocultar el mensaje de éxito después de 6 segundos
        setTimeout(() => {
          successBox.style.display = 'none';
        }, 6000);

      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        alert('Hubo un error al enviar el mensaje. Por favor intenta de nuevo o contáctanos directamente.');
      } finally {
        submitBtn.disabled  = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  /* ============================================================
     7. BOTÓN VOLVER ARRIBA
  ============================================================ */
  const backToTopBtn = $('#back-to-top');

  function handleBackToTop() {
    backToTopBtn.classList.toggle('visible', window.scrollY > 400);
  }

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', handleBackToTop, { passive: true });

  /* ============================================================
     8. AÑO DINÁMICO EN EL FOOTER
  ============================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     9. SMOOTH SCROLL PARA TODOS LOS LINKS INTERNOS
  ============================================================ */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = $(targetId);
      if (!target) return;

      e.preventDefault();

      const navH   = navbar?.offsetHeight || 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     10. LAZY LOADING DE IMÁGENES (para imágenes propias futuras)
  ============================================================ */
  if ('IntersectionObserver' in window) {
    const lazyImages = $$('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  /* ============================================================
     11. DESTACAR TARJETAS DE SERVICIO AL HACER HOVER (teclado)
  ============================================================ */
  $$('.service-card, .about-card, .testimonial-card').forEach((card) => {
    card.setAttribute('tabindex', '0');

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ============================================================
     12. CIERRE DEL MENÚ AL HACER CLIC FUERA DE ÉL
  ============================================================ */
  document.addEventListener('click', (e) => {
    const isInsideNav = navbar.contains(e.target);
    if (!isInsideNav && navMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  /* ============================================================
     13. EVITAR REBOTE EN SAFARI (iOS) CUANDO SE CIERRA EL MENÚ
  ============================================================ */
  navMenu.addEventListener('touchmove', (e) => {
    if (navMenu.classList.contains('open')) {
      e.stopPropagation();
    }
  });

})();
