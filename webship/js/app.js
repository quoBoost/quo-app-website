/* ============================================================
   app.js — WebShip
   Lenis · GSAP ScrollTrigger · Custom Cursor · Interactions
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ═══ TRANSICIONES DE PÁGINA EN ESPIRAL ═════════════════════ */
// Gestionado por js/spiral-transition.js (vórtice logarítmico acelerado por hardware)

/* ═══ LENIS ════════════════════════════════════════════ */
const lenis = new Lenis({
  duration: 1.6,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
  smoothTouch: false,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ═══ NAV SCROLL STATE ══════════════════════════════════ */
const nav = document.getElementById('nav');
ScrollTrigger.create({
  start: 100,
  onEnter: () => nav.classList.add('stuck'),
  onLeaveBack: () => nav.classList.remove('stuck'),
});

/* ═══ CUSTOM CURSOR ════════════════════════════════════ */
const cDot   = document.getElementById('c-dot');
const cTrail = document.getElementById('c-trail');
let dotX = 0, dotY = 0;
let trailX = 0, trailY = 0;
let mx = 0, my = 0;

window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

gsap.ticker.add(() => {
  dotX   += (mx - dotX)   * 0.9;
  dotY   += (my - dotY)   * 0.9;
  trailX += (mx - trailX) * 0.1;
  trailY += (my - trailY) * 0.1;
  gsap.set(cDot,   { x: dotX,   y: dotY   });
  gsap.set(cTrail, { x: trailX, y: trailY });
});

document.querySelectorAll('a, button, .service-card, .portfolio-card').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

/* ═══ HERO INTRO ANIMATION ══════════════════════════════ */
function runIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.to('.line-text', { y: '0%', duration: 1.4, stagger: 0.12 })
    .to('.hero-sub',   { opacity: 1, y: 0, duration: 1.2 }, '-=0.9')
    .to('.hero-ctas',  { opacity: 1, y: 0, duration: 1.0 }, '-=0.9')
    .to('.hero-stats', { opacity: 1, duration: 0.9 }, '-=0.7')
    .to('.scroll-hint',{ opacity: 1, duration: 0.8 }, '-=0.4');
}

/* ═══ HERO STAT COUNTERS ════════════════════════════════ */
document.querySelectorAll('.stat-n').forEach(el => {
  const target = parseInt(el.dataset.n, 10);
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter() {
      gsap.fromTo({ v: 0 }, { v: target }, {
        duration: 2.2,
        ease: 'power2.out',
        onUpdate() { el.textContent = Math.round(this.targets()[0].v); },
      });
    },
  });
});

/* ═══ SERVICE CARDS — staggered reveal ══════════════════ */
gsap.utils.toArray('.service-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1,
    y: 0,
    duration: 1.0,
    delay: (i % 3) * 0.09,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: card,
      start: 'top 88%',
      toggleActions: 'play none none reverse',
    },
  });
});

/* ═══ LAUNCH SEQUENCE (PROCESO) ══════════════════════════ */
const launchSection = document.querySelector('.launch-section');
const launchVisual = document.querySelector('.launch-visual');
const launchSteps = gsap.utils.toArray('.launch-step');

if (launchSection && launchVisual) {
  gsap.fromTo(launchVisual,
    { opacity: 0, y: 42, scale: 0.94 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.25,
      ease: 'power3.out',
      scrollTrigger: { trigger: launchSection, start: 'top 78%', toggleActions: 'play none none reverse' },
    }
  );

  launchSteps.forEach((step, index) => {
    gsap.fromTo(step,
      { opacity: 0, x: 32 },
      {
        opacity: 1,
        x: 0,
        duration: 0.85,
        delay: index * 0.11,
        ease: 'power3.out',
        scrollTrigger: { trigger: launchSection, start: 'top 74%', toggleActions: 'play none none reverse' },
      }
    );
  });

}

/* ═══ NAVBAR THEME TOGGLE ══════════════════════════════ */
/* Handled by transitions.js — smooth GSAP color animation
   that tracks ALL dark sections (hero, proceso, testimonials,
   footer) and interpolates nav colors with scrub. */

/* ═══ SECTION TITLES ════════════════════════════════════ */
gsap.utils.toArray('.section-title').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 28 },
    {
      opacity: 1, y: 0, duration: 1.2, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
    }
  );
});

gsap.utils.toArray('.section-desc, .tag').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 16 },
    {
      opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
    }
  );
});

/* ═══ WHY-US CARDS ══════════════════════════════════════ */
gsap.utils.toArray('.why-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: 1.0, delay: i * 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
  });
});

/* ═══ TESTIMONIALS ══════════════════════════════════════ */
gsap.utils.toArray('.t-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: 1.1, delay: i * 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
  });
});

/* ═══ PORTFOLIO CARDS ═══════════════════════════════════ */
gsap.utils.toArray('.portfolio-card').forEach((card, i) => {
  gsap.fromTo(card,
    { opacity: 0, y: 32, scale: 0.98 },
    {
      opacity: 1, y: 0, scale: 1, duration: 1.1, delay: i * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
    }
  );
});

/* ═══ FAQ ACCORDION ═════════════════════════════════════ */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => other.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ═══ CONTACT FORM ══════════════════════════════════════ */
const form   = document.getElementById('contact-form');
const formOk = document.getElementById('form-ok');

form && form.addEventListener('submit', e => {
  e.preventDefault();
  const btn  = form.querySelector('.btn-submit');
  const span = btn.querySelector('span');
  btn.disabled = true;
  span.textContent = 'Enviando…';

  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    span.textContent = 'Enviar Mensaje';
    formOk.hidden = false;
    gsap.fromTo(formOk,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
    setTimeout(() => {
      gsap.to(formOk, { opacity: 0, duration: 0.5, onComplete: () => { formOk.hidden = true; } });
    }, 5000);
  }, 1100);
});

/* ═══ SMOOTH BTN MICRO-PRESS ════════════════════════════ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousedown',  () => gsap.to(btn, { scale: 0.97, duration: 0.15 }));
  btn.addEventListener('mouseup',    () => gsap.to(btn, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }));
  btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.3 }));
});

/* ═══ LOGOS BAND SCROLL VELOCITY ════════════════════════ */
const logosInner = document.querySelector('.logos-inner');
if (logosInner) {
  ScrollTrigger.create({
    trigger: '.logos-band',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: self => {
      const spd = Math.max(6, Math.min(30, 22 + Math.abs(self.getVelocity()) * 0.003));
      logosInner.style.animationDuration = spd + 's';
    },
  });
}

/* ═══ GRADUAL BLUR (React Bits configuration) ═══════════ */
(function initGradualBlur() {
  const config = {
    height: '6rem',
    strength: 1,
    divCount: 4,
    curve: 'bezier',
    exponential: true,
    opacity: 0.7,
  };

  const container = document.createElement('div');
  container.className = 'gradual-blur gradual-blur-page';
  container.style.position = 'fixed';
  container.style.bottom = '0';
  container.style.left = '0';
  container.style.right = '0';
  container.style.height = config.height;
  container.style.pointerEvents = 'none';
  container.style.zIndex = '1100';
  container.style.isolation = 'isolate';

  const inner = document.createElement('div');
  inner.className = 'gradual-blur-inner';
  inner.style.position = 'relative';
  inner.style.width = '100%';
  inner.style.height = '100%';

  const increment = 100 / config.divCount;
  const curveFunctions = {
    bezier: progress => progress * progress * (3 - 2 * progress),
  };

  for (let i = 1; i <= config.divCount; i++) {
    let progress = i / config.divCount;
    progress = curveFunctions[config.curve](progress);
    const blurValue = config.exponential
      ? Math.pow(2, progress * 4) * 0.0625 * config.strength
      : 0.0625 * (progress * config.divCount + 1) * config.strength;

    const p1 = (increment * i - increment).toFixed(1);
    const p2 = (increment * i).toFixed(1);
    const p3 = (increment * i + increment).toFixed(1);
    const p4 = (increment * i + increment * 2).toFixed(1);

    let gradient = `transparent ${p1}%, black ${p2}%`;
    if (parseFloat(p3) <= 100) gradient += `, black ${p3}%`;
    if (parseFloat(p4) <= 100) gradient += `, transparent ${p4}%`;

    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.inset = '0';
    div.style.maskImage = `linear-gradient(to bottom, ${gradient})`;
    div.style.webkitMaskImage = `linear-gradient(to bottom, ${gradient})`;
    div.style.backdropFilter = `blur(${blurValue.toFixed(3)}rem)`;
    div.style.webkitBackdropFilter = `blur(${blurValue.toFixed(3)}rem)`;
    div.style.opacity = config.opacity;

    inner.appendChild(div);
  }
  container.appendChild(inner);
  document.body.appendChild(container);
})();
