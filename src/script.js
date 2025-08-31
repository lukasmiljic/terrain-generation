import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import GUI from "lil-gui";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

// debug
const gui = new GUI();

// canvas
const canvas = document.querySelector("canvas.webgl");

// scene
const scene = new THREE.Scene();

/**
 * lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(15, 20, 0);
directionalLight.shadow.mapSize.width = 2046;
directionalLight.shadow.mapSize.height = 2046;

const lightsFolder = gui.addFolder("Lights").close();
lightsFolder.add(ambientLight, "visible").name("Ambient light visable:");
lightsFolder
  .add(directionalLight, "visible")
  .name("Directional light visable:");
scene.add(ambientLight, directionalLight);

/*
terrain
*/

// geometry
const planeSettings = {
  size: 128,
  resolution: 512,
};

const updateGeometry = () => {
  terrain.geometry.dispose();
  terrainGeometry = new THREE.PlaneGeometry(
    planeSettings.size,
    planeSettings.size,
    planeSettings.resolution,
    planeSettings.resolution
  );
  terrainMaterial.uniforms.uSize.value = planeSettings.size;
  terrainMaterial.uniforms.uResolution.value = planeSettings.resolution;

  terrain.geometry = terrainGeometry;
};

let terrainGeometry = new THREE.PlaneGeometry(
  planeSettings.size,
  planeSettings.size,
  planeSettings.resolution,
  planeSettings.resolution
);
const planeOptionsFolder = gui.addFolder("Plane").close();
planeOptionsFolder
  .add(planeSettings, "size")
  .min(16)
  .max(256)
  .step(1)
  .name("Plane width")
  .onFinishChange(updateGeometry);
planeOptionsFolder
  .add(planeSettings, "resolution")
  .min(16)
  .max(512)
  .step(1)
  .name("Resolution")
  .onFinishChange(updateGeometry);

// shader based material
const seedSettings = {
  seedString: "",
};

const generateSeed = (userInput) => {
  if (!userInput) return 0.0;

  let hash = 0x811c9dc5;
  for (const char of (userInput + userInput.repeat(7)).slice(0, 8)) {
    hash ^= char.charCodeAt(0);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash / 4294967295;
};

const terrainMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  roughness: 0.45,
  uniforms: {
    uSeed: { value: 0.0 },
    uIsRidged: { value: false },
    uSharpen: { value: false },
    uScale: { value: 0.04 },
    uAmplitude: { value: 6.0 },
    uOctaves: { value: 10 },
    uLacunarity: { value: 2.0 },
    uPersistence: { value: 0.5 },
    uOctaveRotationDelta: { value: 2.9 },
    uShowNormals: { value: false },
    uMask: { value: true },
    uShowMask: { value: true },
    uMaskFadeStart: { value: 2.0 },
    uResolution: { value: planeSettings.resolution },
    uSize: { value: planeSettings.size },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});

const shaderFolder = gui.addFolder("Terrain");
shaderFolder
  .add(seedSettings, "seedString")
  .name("Seed")
  .onFinishChange((input) => {
    terrainMaterial.uniforms.uSeed.value = generateSeed(input);
  });
shaderFolder.add(terrainMaterial.uniforms.uIsRidged, "value").name("Ridged");
shaderFolder.add(terrainMaterial.uniforms.uSharpen, "value").name("Sharpen");
shaderFolder
  .add(terrainMaterial.uniforms.uScale, "value")
  .min(0.01)
  .max(0.1)
  .step(0.001)
  .name("Scale");
shaderFolder
  .add(terrainMaterial.uniforms.uAmplitude, "value")
  .min(0.1)
  .max(20.0)
  .step(0.1)
  .name("Amplitude");
shaderFolder
  .add(terrainMaterial.uniforms.uOctaves, "value")
  .min(1)
  .max(10)
  .step(1)
  .name("Octaves");
shaderFolder
  .add(terrainMaterial.uniforms.uLacunarity, "value")
  .min(1.0)
  .max(4.0)
  .step(0.1)
  .name("Lacunarity");
shaderFolder
  .add(terrainMaterial.uniforms.uPersistence, "value")
  .min(0.1)
  .max(0.7)
  .step(0.01)
  .name("Persistence");
shaderFolder
  .add(terrainMaterial.uniforms.uOctaveRotationDelta, "value")
  .min(0.0)
  .max(3.14)
  .step(0.1)
  .name("Octave rotation delta");
const maskSubfolder = shaderFolder.addFolder("Mask");
maskSubfolder.add(terrainMaterial.uniforms.uMask, "value").name("Enabled");
maskSubfolder
  .add(terrainMaterial.uniforms.uShowMask, "value")
  .name("Show mask");
maskSubfolder
  .add(terrainMaterial.uniforms.uMaskFadeStart, "value")
  .min(0.1)
  .max(4)
  .step(0.1)
  .name("Mask fade start");
shaderFolder.add(terrainMaterial, "wireframe").name("Wireframe");

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;

scene.add(terrain);

// sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // update render
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
renderer.setClearColor("black");

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
