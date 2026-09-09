document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  // Mobile Menu Logic
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let menuOpen = false;
  const toggleMenu = () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    const icon = menuBtn.querySelector('i');
    icon.setAttribute('data-lucide', menuOpen ? 'x' : 'menu');
    lucide.createIcons();
  };
  if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => { if(menuOpen) toggleMenu(); });
  });

  // Navbar glass logic
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 20) {
      navbar.classList.add('bg-white/90', 'backdrop-blur-xl', 'shadow-sm', 'border-b', 'border-slate-200/50');
      navbar.classList.remove('bg-transparent', 'border-transparent', 'py-2');
    } else {
      navbar.classList.remove('bg-white/90', 'backdrop-blur-xl', 'shadow-sm', 'border-b', 'border-slate-200/50');
      navbar.classList.add('bg-transparent', 'border-transparent', 'py-2');
    }
  }, { passive: true });

  // FAQ Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('button');
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // === GSAP ANIMATIONS ===
  gsap.registerPlugin(ScrollTrigger);

  // 1. Un-hide elements
  gsap.set(".reveal-up, .stagger-grid > *", { visibility: "visible" });

  // 2. Hero Initial Load Animation
  const heroTimeline = gsap.timeline();
  heroTimeline.from(".hero-badge", { y: -20, opacity: 0, duration: 0.6, ease: "back.out(1.5)", delay: 0.2 })
              .from(".hero-title", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
              .from(".hero-desc", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
              .from(".hero-btn", { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.5)" }, "-=0.4")
              .from(".hero-img", { scale: 1.1, opacity: 0, duration: 1.2, ease: "power2.out", filter: "blur(10px)" }, "-=1");

  // 3. Generic Reveal Elements
  gsap.utils.toArray('.reveal-up').forEach(elem => {
    gsap.from(elem, {
      scrollTrigger: { trigger: elem, start: "top 85%" },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  });

  // 4. Staggered Grids
  gsap.utils.toArray('.stagger-grid').forEach(grid => {
    gsap.from(grid.children, {
      scrollTrigger: { trigger: grid, start: "top 80%" },
      y: 50,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: "back.out(1.2)"
    });
  });

  // 5. Image Parallax Scrub
  gsap.utils.toArray('.parallax-bg').forEach(bg => {
    gsap.to(bg, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: bg.closest('.parallax-wrapper'),
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });
  });

  // 6. Magnetic Buttons Logic
  const magneticButtons = document.querySelectorAll('.magnetic-btn');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
      gsap.to(btn, { x: x, y: y, duration: 0.4, ease: "power2.out" });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
  });
});