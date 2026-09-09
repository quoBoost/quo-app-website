/* ============================================================
   scene.js — WebShip Hero 3D Scene (ES Module)
   Three.js r160 · Particles Only + Aurora
   ============================================================ */

import * as THREE from 'three';
import { initAurora } from './aurora.js';

const canvas = document.getElementById('hero-canvas');
if (!canvas) throw new Error('No hero canvas');

/* ── Renderer ─────────────────────────────────────────────── */
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 768 ? 1.2 : 2));

/* ── Scene & Camera ────────────────────────────────────────── */
const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 7);

/* ═══ AURORA ════════════════════════════════════════════════ */
const auroraContainer = document.getElementById('aurora-bg');
if (auroraContainer) {
  initAurora(auroraContainer, {
    colorStops: ['#4338CA', '#818CF8', '#A78BFA'],  // Indigo → violet
    amplitude:  1.2,
    blend:      0.6,
    speed:      0.5,
  });
}

/* ═══ PARTICLES ════════════════════════════════════════════ */
const COUNT = 1400;
const posArr  = new Float32Array(COUNT * 3);

for (let i = 0; i < COUNT; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos((Math.random() * 2) - 1);
  const r     = 3.5 + Math.random() * 8;
  posArr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  posArr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  posArr[i * 3 + 2] = r * Math.cos(phi);
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

const particleMat = new THREE.PointsMaterial({
  color: 0xffffff, size: 0.025,
  transparent: true, opacity: 0.4,
  sizeAttenuation: true, depthWrite: false,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

/* ═══ MOUSE ════════════════════════════════════════════════ */
const mouse  = { x: 0, y: 0 };
const target = { x: 0, y: 0 };

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

/* ═══ GSAP SCROLL ══════════════════════════════════════════ */
const heroEl = document.getElementById('hero');
if (heroEl && window.gsap && window.ScrollTrigger) {
  gsap.to(particleMat, {
    opacity: 0,
    ease: 'power2.in',
    scrollTrigger: { trigger: heroEl, start: '50% top', end: 'bottom top', scrub: 1.5 },
  });
}

/* ═══ RESIZE ═══════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 768 ? 1.2 : 2));
});

/* ═══ RENDER LOOP (OPTIMIZADO CON INTERSECTION OBSERVER) ════════ */
let isHeroInView = true;
if (heroEl && typeof IntersectionObserver !== 'undefined') {
  const heroObs = new IntersectionObserver((entries) => {
    isHeroInView = entries[0].isIntersecting;
  }, { threshold: 0 });
  heroObs.observe(heroEl);
}

(function animate(now) {
  requestAnimationFrame(animate);
  if (!isHeroInView) return; // Pausa renderizado fuera del Hero para máxima fluidez
  const clock = now * 0.001;

  target.x += (mouse.x - target.x) * 0.04;
  target.y += (mouse.y - target.y) * 0.04;

  particles.rotation.y = clock * 0.03 + target.x * 0.1;
  particles.rotation.x = clock * 0.018 + target.y * 0.1;

  renderer.render(scene, camera);
}(0));
