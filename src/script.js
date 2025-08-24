import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

// debug
const gui = new GUI();

// canvas
const canvas = document.querySelector("canvas.webgl");

// scene
const scene = new THREE.Scene();

const planeSettings = {
  height: 64,
  width: 64,
  resolution: 64,
};

// material
const material = new THREE.ShaderMaterial({
  wireframe: false,
  uniforms: {
    uFrequency: { value: 0.02 },
    uAmplitude: { value: 6.0 },
    uOctaves: { value: 8 },
    uLacunarity: { value: 2.0 },
    uPersistance: { value: 0.5 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

// geometry
let geometry = new THREE.PlaneGeometry(
  planeSettings.width,
  planeSettings.height,
  planeSettings.resolution,
  planeSettings.resolution
);
const plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const updateGeometry = () => {
  plane.geometry.dispose();
  geometry = new THREE.PlaneGeometry(
    planeSettings.width,
    planeSettings.height,
    planeSettings.resolution,
    planeSettings.resolution
  );
  plane.geometry = geometry;
};

const planeOptionsFolder = gui.addFolder("Plane");
planeOptionsFolder
  .add(planeSettings, "height")
  .min(16)
  .max(256)
  .step(1)
  .name("Plane height")
  .onChange(updateGeometry);
planeOptionsFolder
  .add(planeSettings, "width")
  .min(16)
  .max(256)
  .step(1)
  .name("Plane width")
  .onChange(updateGeometry);
planeOptionsFolder
  .add(planeSettings, "resolution")
  .min(16)
  .max(256)
  .step(1)
  .name("Resolution")
  .onChange(updateGeometry);

// debug shader controls
const shaderFolder = gui.addFolder("Terrain");
shaderFolder
  .add(material.uniforms.uFrequency, "value")
  .min(0.01)
  .max(0.05)
  .step(0.001)
  .name("Frequency");
shaderFolder
  .add(material.uniforms.uAmplitude, "value")
  .min(0.0)
  .max(20.0)
  .step(0.1)
  .name("Amplitude");
shaderFolder
  .add(material.uniforms.uOctaves, "value")
  .min(1)
  .max(8)
  .step(1)
  .name("Octaves");
shaderFolder
  .add(material.uniforms.uLacunarity, "value")
  .min(1.0)
  .max(4.0)
  .step(0.1)
  .name("Lacunarity");
shaderFolder
  .add(material.uniforms.uPersistance, "value")
  .min(0.1)
  .max(0.7)
  .step(0.01)
  .name("Persistance");
shaderFolder.add(material, "wireframe").name("Wireframe");

// sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //update render
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
});

canvas.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(50, 20, 20);
scene.add(camera);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;

const clock = new THREE.Clock();

// animations
const loop = () => {
  const elapsedTime = clock.getElapsedTime();

  // update controls
  controls.update();

  //render
  renderer.render(scene, camera);

  window.requestAnimationFrame(loop);
};

loop();
