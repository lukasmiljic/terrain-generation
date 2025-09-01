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

// fog
const fogSettings = {
  enabled: true,
};

const fog = new THREE.Fog(0xb0cfda, 20, 250);
scene.fog = fog;

const fogFolder = gui.addFolder("Fog").close();
fogFolder
  .add(fogSettings, "enabled")
  .name("Enabled")
  .onChange((enabled) => {
    scene.fog = enabled ? fog : null;
  });
fogFolder.add(fog, "near").min(1).max(100).step(1).name("Near distance");
fogFolder.add(fog, "far").min(50).max(500).step(5).name("Far distance");
fogFolder.addColor(fog, "color").name("color");

/**
 * lights
 */
const ambientLight = new THREE.AmbientLight(0x756bd1, 0.35);

const directionalLight = new THREE.DirectionalLight(0xf2a629, 1.5);
directionalLight.position.set(20, 10, -10);
directionalLight.shadow.mapSize.width = 2046;
directionalLight.shadow.mapSize.height = 2046;

const lightsFolder = gui.addFolder("Lights").close();
const ambientFolder = lightsFolder.addFolder("Ambient Light");
ambientFolder.add(ambientLight, "visible").name("Enabled");
ambientFolder
  .add(ambientLight, "intensity")
  .min(0)
  .max(2)
  .step(0.01)
  .name("Intensity");
ambientFolder.addColor(ambientLight, "color").name("Color");
const directionalFolder = lightsFolder.addFolder("Directional Light");
directionalFolder.add(directionalLight, "visible").name("Enabled");
directionalFolder
  .add(directionalLight, "intensity")
  .min(0)
  .max(5)
  .step(0.1)
  .name("Intensity");
directionalFolder.addColor(directionalLight, "color").name("Color");
const lightPositionFolder = directionalFolder.addFolder("Position");
lightPositionFolder
  .add(directionalLight.position, "x")
  .min(-50)
  .max(50)
  .step(1)
  .name("X");
lightPositionFolder
  .add(directionalLight.position, "y")
  .min(1)
  .max(100)
  .step(1)
  .name("Y");
lightPositionFolder
  .add(directionalLight.position, "z")
  .min(-50)
  .max(50)
  .step(1)
  .name("Z");

scene.add(ambientLight, directionalLight);

/*
terrain
*/

const terrainParams = {
  geometry: {
    size: 128,
    resolution: 800,
  },
  noise: {
    seed: "",
    scale: 0.04,
    amplitude: 6.0,
    offsetX: 0.0,
    offsetY: 0.0,
    ridged: false,
    sharpen: false,
    octaves: 10,
    lacunarity: 2.0,
    persistence: 0.5,
    octaveRotationDelta: 2.9,
  },
  mask: {
    enabled: true,
    fadeStart: 2.0,
    highlight: false,
  },
  debug: {
    wireframe: false,
    normals: false,
  },
};

const uniforms = {
  uSeed: { value: terrainParams.noise.seed },
  uScale: { value: terrainParams.noise.scale },
  uAmplitude: { value: terrainParams.noise.amplitude },
  uOffsetX: { value: terrainParams.noise.offsetX },
  uOffsetY: { value: terrainParams.noise.offsetY },
  uIsRidged: { value: terrainParams.noise.ridged },
  uSharpen: { value: terrainParams.noise.sharpen },
  uOctaves: { value: terrainParams.noise.octaves },
  uLacunarity: { value: terrainParams.noise.lacunarity },
  uPersistence: { value: terrainParams.noise.persistence },
  uOctaveRotationDelta: { value: terrainParams.noise.octaveRotationDelta },
  uShowNormals: { value: terrainParams.debug.normals },
  uMask: { value: terrainParams.mask.enabled },
  uShowMask: { value: terrainParams.mask.highlight },
  uMaskFadeStart: { value: terrainParams.mask.fadeStart },
  uResolution: { value: terrainParams.geometry.resolution },
  uSize: { value: terrainParams.geometry.size },
};

// geometry
const updateGeometry = () => {
  terrain.geometry.dispose();
  terrainGeometry = new THREE.PlaneGeometry(
    terrainParams.geometry.size,
    terrainParams.geometry.size,
    terrainParams.geometry.resolution,
    terrainParams.geometry.resolution
  );
  terrainMaterial.uniforms.uSize.value = terrainParams.geometry.size;
  terrainMaterial.uniforms.uResolution.value =
    terrainParams.geometry.resolution;

  terrain.geometry = terrainGeometry;
};

let terrainGeometry = new THREE.PlaneGeometry(
  terrainParams.geometry.size,
  terrainParams.geometry.size,
  terrainParams.geometry.resolution,
  terrainParams.geometry.resolution
);
const planeOptionsFolder = gui.addFolder("Plane").close();
planeOptionsFolder
  .add(terrainParams.geometry, "size")
  .min(16)
  .max(256)
  .step(1)
  .name("Plane width")
  .onFinishChange(updateGeometry);
planeOptionsFolder
  .add(terrainParams.geometry, "resolution")
  .min(16)
  .max(1024)
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

const normalMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshNormalMaterial,
  uniforms: uniforms,
  vertexShader: vertexShader,
});

const terrainMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  roughness: 0.45,
  uniforms: uniforms,
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
const offsetSubfolder = shaderFolder.addFolder("Offset");
offsetSubfolder
  .add(terrainMaterial.uniforms.uOffsetX, "value")
  .min(-1024)
  .max(1024)
  .step(1)
  .name("X");
offsetSubfolder
  .add(terrainMaterial.uniforms.uOffsetY, "value")
  .min(-1024)
  .max(1024)
  .step(1)
  .name("Y");
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
shaderFolder
  .add(terrainParams.debug, "normals")
  .name("Show normals")
  .onChange((showNormals) => {
    terrain.material = showNormals ? normalMaterial : terrainMaterial;
  });

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
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height);
camera.position.set(50, 20, 20);
scene.add(camera);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxPolarAngle = Math.PI * 0.5 -  THREE.MathUtils.degToRad(15);
controls.minDistance = 50;
controls.maxDistance = 100;
controls.enablePan = false;

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
