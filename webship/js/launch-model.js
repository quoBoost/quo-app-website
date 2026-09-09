/* 3D windmill for the WebShip launch section. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const canvas = document.getElementById('launch-model-canvas');

if (canvas) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  scene.add(new THREE.HemisphereLight(0xd6ddff, 0x1e1738, 2.3));
  const keyLight = new THREE.DirectionalLight(0xdedbff, 3.2);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffc7d8, 1.8);
  fillLight.position.set(-5, 2, -4);
  scene.add(fillLight);

  let model;
  let targetRotationX = 0;
  let targetRotationY = -0.5;
  let isVisible = true;
  let frameId;

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function frameModel(object) {
    const bounds = new THREE.Box3().setFromObject(object);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    object.position.sub(center);

    const largestSide = Math.max(size.x, size.y, size.z);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = largestSide / (2 * Math.tan(fov / 2));
    camera.position.set(0, size.y * 0.08, distance * 4.5);
    camera.lookAt(0, 0.10 , 0);
  }

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load(
    '3d/fantasy-x-tree-15.glb',
    gltf => {
      model = gltf.scene;
      modelGroup.add(model);
      frameModel(model);
      resize();
    },
    undefined,
    error => console.error('No se pudo cargar el modelo 3D del molino.', error),
  );

window.addEventListener('pointermove', event => {
    // Calculamos el movimiento en base a toda la ventana, no solo el canvas
    targetRotationY = ((event.clientX / window.innerWidth) - 0.5) * 4.5; // El 4.5 le da MUCHA sensibilidad
    targetRotationX = ((event.clientY / window.innerHeight) - 0.5) * 2.0; 
  });

  window.addEventListener('pointerleave', () => {
    targetRotationX = 0;
    targetRotationY = -0.5;
  });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; }, { threshold: 0.01 }).observe(canvas);

function render(time) {
    frameId = requestAnimationFrame(render);
    if (!isVisible || !model) return;

    // Aumentamos de 0.06 a 0.2 para que el modelo persiga el ratón casi instantáneamente
    modelGroup.rotation.x += (targetRotationX - modelGroup.rotation.x) * 0.2;
    modelGroup.rotation.y += (targetRotationY - modelGroup.rotation.y) * 0.2;
    
    if (!prefersReducedMotion) modelGroup.rotation.y += Math.sin(time * 0.00035) * 0.00045;
    renderer.render(scene, camera);
  }

  render(0);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frameId), { once: true });
}
