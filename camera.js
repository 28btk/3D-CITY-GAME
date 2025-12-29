import * as THREE from "three";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/controls/OrbitControls.js";
import { GRID_SIZE, TILE_SIZE, HALF_GRID } from "./city/utils/constants.js";

export function setupCamera(renderer) {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 1, 5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableRotate = false;
  controls.enabled = true;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  
  const panLimit = HALF_GRID * 0.8;
  controls.target.set(0, 0, 0);
  
  controls.addEventListener('change', () => {
    controls.target.x = Math.max(-panLimit, Math.min(panLimit, controls.target.x));
    controls.target.z = Math.max(-panLimit, Math.min(panLimit, controls.target.z));
    controls.target.y = 0;
  });
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };

  let cameraViewMode = false;

  function setBodyScroll(enabled) {
    document.body.style.overflowY = enabled ? "auto" : "hidden";
    if (enabled) {
      document.body.style.overflowX = "hidden";
    }
  }

  function setCameraViewMode(enabled) {
    cameraViewMode = enabled;

    if (cameraViewMode) {
      controls.enableRotate = true;
      controls.enablePan = false;
      controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI / 2;
      setBodyScroll(false);
      renderer.domElement.style.cursor = "grab";
    } else {
      controls.enableRotate = false;
      controls.enablePan = true;
      controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
      setBodyScroll(true);
      renderer.domElement.style.cursor = "default";
    }
  }

  function toggleCameraViewMode() {
    setCameraViewMode(!cameraViewMode);
  }

  renderer.domElement.addEventListener("mousedown", () => {
    if (cameraViewMode) {
      renderer.domElement.style.cursor = "grabbing";
    }
  });

  renderer.domElement.addEventListener("mouseup", () => {
    if (cameraViewMode) {
      renderer.domElement.style.cursor = "grab";
    }
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    camera,
    controls,
    setCameraViewMode,
    toggleCameraViewMode,
    getCameraViewMode: () => cameraViewMode,
  };
}
