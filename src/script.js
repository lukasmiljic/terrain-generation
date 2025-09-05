import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import GUI from "lil-gui";

import terrainVertexShader from "./shaders/terrainVertex.glsl";
import terrainFragmentShader from "./shaders/terrainFragment.glsl";
import skyVertexShader from "./shaders/sky/skyVertex.glsl";
import skyFragmentShader from "./shaders/sky/skyFragment.glsl";
import waterVertexShader from "./shaders/water/waterVertex.glsl";
import waterFragmentShader from "./shaders/water/waterFragment.glsl";

// debug
const gui = new GUI();

// canvas
const canvas = document.querySelector("canvas.webgl");

// scene
const scene = new THREE.Scene();

// Sky colors
const skyColors = {
  baseColor: [0.051, 0.4706, 0.8902],
  horizonColor: [0.7529, 0.6, 0.2078],
};

// fog
const fogSettings = {
  enabled: true,
};

const fog = new THREE.Fog(new THREE.Color(...skyColors.baseColor), 10, 230);
scene.fog = fog;

/**
 * lights
 */
const ambientLight = new THREE.AmbientLight(0x3d4e9e, 0.35);

const directionalLight = new THREE.DirectionalLight(0xf2a629, 1.5);
directionalLight.position.set(20, 10, -10);
directionalLight.shadow.mapSize.width = 2046;
directionalLight.shadow.mapSize.height = 2046;

scene.add(ambientLight, directionalLight);

// water
const waterColors = {
  waterColor: [0.0, 0.2, 1.0],
};

const waterMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  metalness: 0.0,
  roughness: 0.75,
  reflectivity: 0.8,
  transmission: 0.0,
  transparent: true,
  ior: 1.33,
  thickness: 0.5,
  uniforms: {
    uColor: { value: new THREE.Vector3(...waterColors.waterColor) },
    uOpacityFadeStart: { value: 45.0 },
    uBlendWidth: { value: 20.0 },
    uOpacity: { value: 0.75 },
    uTime: { value: 0.0 },
    uWaveAmplitude: { value: 0.2 },
    uWaveSpeed: { value: 2.0 },
    uWaveScale: { value: 0.2 },
  },
  fragmentShader: waterFragmentShader,
  vertexShader: waterVertexShader,
});

const waterGeometry = new THREE.PlaneGeometry(200, 200, 200, 200);

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.y = -3.8;

scene.add(water);

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

const colorStops = [
  {
    position: 0.24,
    colorLow: [0.7529, 0.9098, 0.3804],
    colorHigh: [0.7804, 0.7608, 0.4235],
  },
  {
    position: 0.4,
    colorLow: [0.2902, 0.7176, 0.2549],
    colorHigh: [0.5686, 0.7176, 0.4314],
  },
  {
    position: 0.9,
    colorLow: [0.3961, 0.2784, 0.2511],
    colorHigh: [0.498, 0.4745, 0.2706],
  },
  {
    position: 1.0,
    colorLow: [1.0, 1.0, 1.0],
    colorHigh: [0.498, 0.5725, 0.7333],
  },
];

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
  uSlopeBlend: { value: 0.18 },
  uSlopeThreshold: { value: 0.49 },
  uColorsLow: {
    value: colorStops.map((stop) => new THREE.Vector3(...stop.colorLow)),
  },
  uColorsHigh: {
    value: colorStops.map((stop) => new THREE.Vector3(...stop.colorHigh)),
  },
  uStops: { value: colorStops.map((stop) => stop.position) },
  uFlatten: { value: false },
  uColors: { value: true },
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
  vertexShader: terrainVertexShader,
});

const terrainMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  roughness: 0.45,
  uniforms: uniforms,
  vertexShader: terrainVertexShader,
  fragmentShader: terrainFragmentShader,
});

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;

scene.add(terrain);

// sky sphere
const skyUniforms = {
  baseColor: { value: new THREE.Vector3(...skyColors.baseColor) },
  horizonColor: { value: new THREE.Vector3(...skyColors.horizonColor) },
};

const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
const skyMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshBasicMaterial,
  side: THREE.BackSide,
  fog: false,
  uniforms: skyUniforms,
  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// Function to update sky colors
const updateSkyColors = () => {
  skyMaterial.uniforms.baseColor.value = new THREE.Vector3(
    ...skyColors.baseColor
  );
  skyMaterial.uniforms.horizonColor.value = new THREE.Vector3(
    ...skyColors.horizonColor
  );
};

// debug gui
const skyFolder = gui.addFolder("Sky").close();
skyFolder.add(sky, "visible").name("Enable");
skyFolder
  .addColor(skyColors, "baseColor")
  .name("Base color")
  .onChange(updateSkyColors);
skyFolder
  .addColor(skyColors, "horizonColor")
  .name("Zenith color")
  .onChange(updateSkyColors);

const fogFolder = gui.addFolder("Fog").close();
fogFolder
  .add(fogSettings, "enabled")
  .name("Enabled")
  .onChange((enabled) => {
    scene.fog = enabled ? fog : null;
  });
fogFolder.add(fog, "near").min(1).max(100).step(1).name("Near distance");
fogFolder.add(fog, "far").min(50).max(500).step(5).name("Far distance");
fogFolder.addColor(fog, "color").name("Fog color");

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

const updateColorUniforms = () => {
  terrainMaterial.uniforms.uColorsLow.value = colorStops.map(
    (stop) => new THREE.Vector3(...stop.colorLow)
  );
  terrainMaterial.uniforms.uColorsHigh.value = colorStops.map(
    (stop) => new THREE.Vector3(...stop.colorHigh)
  );
  terrainMaterial.uniforms.uStops.value = colorStops.map(
    (stop) => stop.position
  );
};
const terrainColorsFolder = gui.addFolder("Terrain colors").close();

// Slope blending controls
const slopeBlendingFolder = terrainColorsFolder.addFolder("Slope blending");
slopeBlendingFolder
  .add(terrainMaterial.uniforms.uSlopeThreshold, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Slope threshold");
slopeBlendingFolder
  .add(terrainMaterial.uniforms.uSlopeBlend, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Slope blend");
const colorStopsFolder = terrainColorsFolder.addFolder("Color stops");
colorStops.forEach((stop, index) => {
  const colorStopFolder = colorStopsFolder.addFolder(`Color stop ${index + 1}`);
  colorStopFolder.addColor(stop, "colorLow").onChange(updateColorUniforms);
  colorStopFolder.addColor(stop, "colorHigh").onChange(updateColorUniforms);
  colorStopFolder
    .add(stop, "position")
    .min(0)
    .max(1)
    .step(0.01)
    .name("Height")
    .onChange(updateColorUniforms);
});

const waterFolder = gui.addFolder("Water").close();
waterFolder.add(water, "visible").name("Enabled");
waterFolder.add(water.position, "y").name("Height").min(-10).max(10);
waterFolder
  .addColor(waterColors, "waterColor")
  .name("Water Color")
  .onChange(() => {
    waterMaterial.uniforms.uColor.value = new THREE.Vector3(
      ...waterColors.waterColor
    );
  });
waterFolder
  .add(waterMaterial.uniforms.uOpacity, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Opacity");
waterFolder
  .add(waterMaterial.uniforms.uOpacityFadeStart, "value")
  .min(0)
  .max(200)
  .step(1.0)
  .name("Opacity Fade Start");
waterFolder
  .add(waterMaterial.uniforms.uBlendWidth, "value")
  .min(0)
  .max(100)
  .step(1.0)
  .name("Opacity Blending width");

// Water animation controls
const waterAnimationFolder = waterFolder.addFolder("Animation").close();
waterAnimationFolder
  .add(waterMaterial.uniforms.uWaveAmplitude, "value")
  .min(0)
  .max(2)
  .step(0.01)
  .name("Wave Amplitude");
waterAnimationFolder
  .add(waterMaterial.uniforms.uWaveSpeed, "value")
  .min(0)
  .max(2)
  .step(0.1)
  .name("Wave Speed");
waterAnimationFolder
  .add(waterMaterial.uniforms.uWaveScale, "value")
  .min(0.01)
  .max(0.5)
  .step(0.01)
  .name("Wave Scale");

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

const terrainFolder = gui.addFolder("Terrain");
terrainFolder
  .add(seedSettings, "seedString")
  .name("Seed")
  .onFinishChange((input) => {
    terrainMaterial.uniforms.uSeed.value = generateSeed(input);
  });
terrainFolder.add(terrainMaterial.uniforms.uIsRidged, "value").name("Ridged");
terrainFolder.add(terrainMaterial.uniforms.uSharpen, "value").name("Sharpen");
terrainFolder
  .add(terrainMaterial.uniforms.uScale, "value")
  .min(0.01)
  .max(0.1)
  .step(0.001)
  .name("Scale");
terrainFolder
  .add(terrainMaterial.uniforms.uAmplitude, "value")
  .min(0.1)
  .max(20.0)
  .step(0.1)
  .name("Amplitude");
const offsetSubfolder = terrainFolder.addFolder("Offset").close();
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
const fbmSubfolder = terrainFolder.addFolder("Fractal Brownian Motion").close();
fbmSubfolder
  .add(terrainMaterial.uniforms.uOctaves, "value")
  .min(1)
  .max(10)
  .step(1)
  .name("Octaves");
fbmSubfolder
  .add(terrainMaterial.uniforms.uLacunarity, "value")
  .min(1.0)
  .max(4.0)
  .step(0.1)
  .name("Lacunarity");
fbmSubfolder
  .add(terrainMaterial.uniforms.uPersistence, "value")
  .min(0.1)
  .max(0.7)
  .step(0.01)
  .name("Persistence");
fbmSubfolder
  .add(terrainMaterial.uniforms.uOctaveRotationDelta, "value")
  .min(0.0)
  .max(3.14)
  .step(0.1)
  .name("Octave rotation delta");
const maskSubfolder = terrainFolder.addFolder("Mask").close();
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
const debugSubfolder = terrainFolder.addFolder("Debug").close();
debugSubfolder.add(terrainMaterial, "wireframe").name("Wireframe");
debugSubfolder
  .add(terrainParams.debug, "normals")
  .name("Show normals")
  .onChange((showNormals) => {
    terrain.material = showNormals ? normalMaterial : terrainMaterial;
  });
debugSubfolder.add(terrainMaterial.uniforms.uFlatten, "value").name("Flatten");
debugSubfolder
  .add(terrainMaterial.uniforms.uColors, "value")
  .name("Colorize terrain");

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
controls.maxPolarAngle = THREE.MathUtils.degToRad(75);
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

  waterMaterial.uniforms.uTime.value = elapsedTime;

  // update controls
  controls.update();

  //render
  renderer.render(scene, camera);

  window.requestAnimationFrame(loop);
};

loop();
