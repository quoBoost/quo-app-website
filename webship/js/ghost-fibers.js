/* ============================================================
   ghost-fibers.js — React Bits GhostFibers, adapted for WebShip
   ============================================================ */

import * as THREE from 'three';

const container = document.getElementById('ghost-fibers');

if (container) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const config = {
    lineColor: '#140E35',
    glowColor: '#933f3f',
    speed: 0.2,
    scale: 2,
    rotation: -98,
    rotationSpeed: 0.25,
    layers: 1,
    waveAmplitude: 0.265,
    waveFrequency: 3,
    waveSpeed: 0.8,
    layerSpeed: 0.08,
    twist: 0.1,
    twistFrequency: 8.9,
    twistSpeed: 1.2,
    lineFrequency: 5,
    lineSpacing: 1.45,
    lineSharpness: 16,
    glowFalloff: 10.5,
    glowIntensity: 1.6,
    brightness: 2.3,
    blueBoost: 1.66,
    vignette: 0.88,
    grain: 0.0225,
    dpr: isMobile ? 0.75 : 1.25,
    fps: isMobile ? 30 : 60,
  };

  const toRgb = hex => {
    const value = hex.replace('#', '');
    const normalized = value.length === 3 ? value.replace(/./g, char => char + char) : value;
    return new THREE.Color(`#${normalized}`);
  };

  const vertexShader = `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uScale;
    uniform float uRotation;
    uniform float uLayers;
    uniform float uWaveAmplitude;
    uniform float uWaveFrequency;
    uniform float uWaveSpeed;
    uniform float uLayerSpeed;
    uniform float uTwist;
    uniform float uTwistFrequency;
    uniform float uTwistSpeed;
    uniform float uLineFrequency;
    uniform float uLineSpacing;
    uniform float uLineSharpness;
    uniform float uGlowFalloff;
    uniform float uGlowIntensity;
    uniform float uBrightness;
    uniform float uBlueBoost;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uRotationSpeed;
    uniform vec3 uLineColor;
    uniform vec3 uGlowColor;

    #define MAX_LAYERS 10

    mat2 rotate2d(float angle) {
      float sine = sin(angle);
      float cosine = cos(angle);
      return mat2(cosine, -sine, sine, cosine);
    }

    float grainHash(vec2 point) {
      point = floor(point);
      float hash = 52.9829189 * fract(dot(point, vec2(0.065, 0.005)));
      return fract(hash);
    }

    float layeredGrain(vec2 fragmentPixel) {
      vec2 point = mod(fragmentPixel + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
      vec2 rotated = mat2(0.8, -0.5, 0.5, 0.8) * point;
      float grain = 0.0;
      grain += 0.40 * grainHash(rotated);
      grain += 0.25 * grainHash(rotated * 2.0 + 17.0);
      grain += 0.20 * grainHash(rotated * 4.0 + 47.0);
      grain += 0.10 * grainHash(rotated * 8.0 + 113.0);
      grain += 0.05 * grainHash(rotated * 16.0 + 191.0);
      return grain;
    }

    void main() {
      vec2 resolution = max(uResolution, vec2(1.0));
      vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
      float time = uTime * uSpeed;
      vec3 backdrop = vec3(0.070588, 0.058824, 0.090196);
      vec3 centerTone = max(uLineColor * 0.85567 - uGlowColor * 0.06186, vec3(0.0));
      vec3 cloudTone = uLineColor * 0.19588 + uGlowColor * 0.2268;
      vec2 p = uv;
      p /= max(uScale, 0.05);
      p = rotate2d(radians(uRotation) + time * uRotationSpeed) * p;
      vec3 color = vec3(0.0);

      for (int index = 0; index < MAX_LAYERS; index++) {
        float fi = float(index) + 1.0;
        if (fi > uLayers) break;

        p += uWaveAmplitude * sin(p.yx * fi * uWaveFrequency + time * (uWaveSpeed + fi * uLayerSpeed));

        float radius = length(p);
        float polarAngle = atan(p.y, p.x);
        polarAngle += sin(radius * uTwistFrequency - time * uTwistSpeed + fi) * uTwist;
        p = vec2(cos(polarAngle), sin(polarAngle)) * radius;

        float lines = abs(sin(p.x * (uLineFrequency + fi * uLineSpacing) + sin(p.y * 3.0 + time)));
        lines = pow(max(0.0, 1.0 - lines), uLineSharpness);
        color += uLineColor * lines / fi;

        float glow = exp(-uGlowFalloff * abs(sin(p.x * 3.0 + time + fi)));
        color += uGlowColor * glow * uGlowIntensity / (fi * 2.0);
      }

      float center = exp(-2.2 * dot(uv, uv));
      color += centerTone * center;

      float cloud = exp(-1.5 * length(uv + vec2(sin(time * 0.3) * 0.25, cos(time * 0.25) * 0.18)));
      color += cloudTone * cloud;

      float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
      color *= mix(1.0 - uVignette, 1.0, vignette);
      color = 1.0 - exp(-color * uBrightness);
      color.b *= uBlueBoost;

      float noise = (layeredGrain(gl_FragCoord.xy) - 0.5) * uGrain;
      gl_FragColor = vec4(clamp(backdrop + color + noise, 0.0, 1.0), 1.0);
    }
  `;

  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(Math.max(config.dpr, 0.5), 2));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uSpeed: { value: config.speed },
    uScale: { value: config.scale },
    uRotation: { value: config.rotation },
    uRotationSpeed: { value: config.rotationSpeed },
    uLayers: { value: config.layers },
    uWaveAmplitude: { value: config.waveAmplitude },
    uWaveFrequency: { value: config.waveFrequency },
    uWaveSpeed: { value: config.waveSpeed },
    uLayerSpeed: { value: config.layerSpeed },
    uTwist: { value: config.twist },
    uTwistFrequency: { value: config.twistFrequency },
    uTwistSpeed: { value: config.twistSpeed },
    uLineFrequency: { value: config.lineFrequency },
    uLineSpacing: { value: config.lineSpacing },
    uLineSharpness: { value: config.lineSharpness },
    uGlowFalloff: { value: config.glowFalloff },
    uGlowIntensity: { value: config.glowIntensity },
    uBrightness: { value: config.brightness },
    uBlueBoost: { value: config.blueBoost },
    uVignette: { value: config.vignette },
    uGrain: { value: config.grain },
    uLineColor: { value: toRgb(config.lineColor) },
    uGlowColor: { value: toRgb(config.glowColor) },
  };

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));

  let frameId = 0;
  let elapsed = 0;
  let previousTime = performance.now();
  let lastRenderTime = 0;
  let isVisible = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(Math.max(window.innerWidth <= 768 ? 0.75 : config.dpr, 0.5), 2));
    renderer.setSize(Math.max(1, Math.floor(width)), Math.max(1, Math.floor(height)), false);
    renderer.getDrawingBufferSize(uniforms.uResolution.value);
    render();
  };
  const canAnimate = () => isVisible && !document.hidden && !reducedMotion.matches;
  const stop = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  };
  const loop = now => {
    frameId = 0;
    if (!canAnimate()) return;
    elapsed += Math.min((now - previousTime) / 1000, 0.1);
    previousTime = now;
    if (now - lastRenderTime >= 1000 / config.fps - 0.5) {
      uniforms.uTime.value = elapsed;
      render();
      lastRenderTime = now;
    }
    frameId = requestAnimationFrame(loop);
  };
  const start = () => {
    if (canAnimate() && !frameId) {
      previousTime = performance.now();
      frameId = requestAnimationFrame(loop);
    }
  };
  const updateAnimation = () => {
    if (canAnimate()) start();
    else {
      stop();
      render();
    }
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    updateAnimation();
  });
  intersectionObserver.observe(container);
  document.addEventListener('visibilitychange', updateAnimation);
  reducedMotion.addEventListener('change', updateAnimation);

  resize();
  start();
}
