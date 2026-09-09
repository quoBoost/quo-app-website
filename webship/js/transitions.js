/* ============================================================
   transitions.js — WebShip
   Transiciones cinemáticas:
   1. Deslizamiento minimalista suave y lento entre páginas (Index ↔ Portafolio)
   2. Resplandor ambiental interactivo de color entre secciones
   ============================================================ */

(function () {
  'use strict';

  /* ═══ 1. DESLIZAMIENTO MINIMALISTA SUAVE & DINÁMICO ENTRE PÁGINAS ═══ */
  window.triggerPageTransition = function (url) {
    if (typeof gsap === 'undefined') {
      window.location.href = url;
      return;
    }

    var loader = document.getElementById('loader');
    if (!loader) {
      window.location.href = url;
      return;
    }

    var bar = loader.querySelector('.loader-progress');
    if (bar) bar.style.width = '0%';

    gsap.set(loader, { display: 'flex', yPercent: 100 });

    if (bar) {
      gsap.to(bar, { width: '100%', duration: 0.65, ease: 'power2.inOut' });
    }

    // Deslizamiento hacia arriba dinámico y sedoso (0.75s)
    gsap.to(loader, {
      yPercent: 0,
      duration: 0.75,
      ease: 'power4.inOut',
      onComplete: function () {
        window.location.href = url;
      }
    });
  };

  function initPageEntranceSlide() {
    var loader = document.getElementById('loader');
    if (!loader) return;

    var bar = loader.querySelector('.loader-progress');
    var duration = 480; // Carga más ágil y rápida (480ms)
    var start = performance.now();

    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      if (bar) bar.style.width = (p * 100) + '%';
      if (p < 1) {
        requestAnimationFrame(tick);
        return;
      }

      if (typeof gsap !== 'undefined') {
        // Salida suave y rápida hacia arriba (0.85s)
        gsap.to(loader, {
          yPercent: -100,
          duration: 0.85,
          ease: 'power4.inOut',
          delay: 0.04,
          onComplete: function () {
            loader.style.display = 'none';
            if (typeof runIntro === 'function') runIntro();
            if (typeof runPortfolioIntro === 'function') runPortfolioIntro();
          }
        });
      } else {
        loader.style.display = 'none';
      }
    }
    requestAnimationFrame(tick);

    // Soporte para bfcache (atrás/adelante en el navegador)
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        if (typeof gsap !== 'undefined') {
          gsap.to(loader, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power4.inOut',
            onComplete: function () { loader.style.display = 'none'; }
          });
        } else {
          loader.style.display = 'none';
        }
      }
    });

    // Interceptor inteligente de enlaces entre Index y Portafolio
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href) return;

      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || link.target === '_blank') return;
      if (href.includes('wa.me') || href.includes('whatsapp.com')) return;

      var isToIndex = href.includes('index.html') || href.includes('webship.html');
      var isToPort = href.includes('portafolio.html') || href.includes('portafolio');

      if (isToIndex || isToPort) {
        e.preventDefault();
        window.triggerPageTransition(href);
      }
    });
  }

  /* ═══ 2. RESPLANDOR AMBIENTAL ENTRE SECCIONES DE DIFERENTES COLORES ═══ */
  function initDividerGlowAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    var dividers = document.querySelectorAll('.color-transition-divider');
    dividers.forEach(function (div) {
      var glow = div.querySelector('.ctd-ambient-glow');
      if (!glow) return;

      gsap.fromTo(glow,
        { opacity: 0.35, scale: 0.88 },
        {
          opacity: 0.95,
          scale: 1.18,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: div,
            start: 'top 95%',
            end: 'bottom 10%',
            scrub: 1.2,
          }
        }
      );
    });
  }

  function init() {
    initPageEntranceSlide();
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setTimeout(function () {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          initDividerGlowAnimations();
        }
      }, 100);
      return;
    }
    initDividerGlowAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
