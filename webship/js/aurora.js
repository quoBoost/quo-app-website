/* ============================================================
   aurora.js — React Bits Aurora, portado a Vanilla WebGL2
   Sin dependencias externas — raw WebGL2 API
   ============================================================ */

const VERT_SRC = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3  uColorStops[3];
uniform vec2  uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,  0.366025403784439,
   -0.577350269189626,  0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy  -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x  = 2.0*fract(p*C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x *x0.x  + h.x *x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0*dot(m, g);
}

vec3 colorRamp(vec3 c0, vec3 c1, vec3 c2, float t) {
  if (t < 0.5) return mix(c0, c1, t * 2.0);
  return mix(c1, c2, (t - 0.5) * 2.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  vec3 rampColor = colorRamp(uColorStops[0], uColorStops[1], uColorStops[2], uv.x);

  float height   = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height         = exp(height);
  height         = uv.y * 2.0 - height + 0.2;
  float intensity = 0.6 * height;

  float midPoint    = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  vec3  auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}`;

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Aurora shader error:', gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export function initAurora(container, options = {}) {
  const {
    colorStops = ['#4338CA', '#818CF8', '#A78BFA'],
    amplitude  = 1.2,
    blend      = 0.6,
    speed      = 0.5,
  } = options;

  /* ── Canvas & WebGL2 context ─────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true });
  if (!gl) { console.warn('Aurora: WebGL2 not available'); return { destroy: () => {} }; }

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /* ── Compile program ─────────────────────────────────── */
  const vert = compileShader(gl, gl.VERTEX_SHADER,   VERT_SRC);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vert || !frag) return { destroy: () => {} };

  const prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Aurora link error:', gl.getProgramInfoLog(prog));
    return { destroy: () => {} };
  }

  /* ── Full-screen triangle geometry ──────────────────── */
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  /* ── Uniform locations ───────────────────────────────── */
  gl.useProgram(prog);
  const uTime      = gl.getUniformLocation(prog, 'uTime');
  const uAmpl      = gl.getUniformLocation(prog, 'uAmplitude');
  const uRes       = gl.getUniformLocation(prog, 'uResolution');
  const uBlend     = gl.getUniformLocation(prog, 'uBlend');
  const uColorLoc  = gl.getUniformLocation(prog, 'uColorStops');

  /* ── Resize ──────────────────────────────────────────── */
  function resize() {
    const w = container.offsetWidth  || window.innerWidth;
    const h = container.offsetHeight || window.innerHeight;
    canvas.width  = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── Set colors ──────────────────────────────────────── */
  const flat = colorStops.flatMap(hexToRGB);
  gl.useProgram(prog);
  gl.uniform3fv(uColorLoc, flat);
  gl.uniform1f(uAmpl, amplitude);
  gl.uniform1f(uBlend, blend);

  /* ── Render loop ─────────────────────────────────────── */
  let rafId = 0;
  const start = performance.now();

  function frame() {
    rafId = requestAnimationFrame(frame);
    const elapsed = (performance.now() - start) * 0.001 * speed;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform1f(uTime, elapsed);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }
  rafId = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      if (canvas.parentNode === container) container.removeChild(canvas);
    },
  };
}
