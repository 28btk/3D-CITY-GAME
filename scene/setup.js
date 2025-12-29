import * as THREE from "three";
import { setupCamera } from "../camera.js";
import { createGrid } from "../city/utils/grid.js";
import { GRID_SIZE, TILE_SIZE } from "../city/utils/constants.js";
import { initDayNight } from "../dayNight.js";

export function setupScene() {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.zIndex = '1';
  document.body.appendChild(renderer.domElement);

  const {
    camera,
    controls,
    setCameraViewMode,
    getCameraViewMode,
  } = setupCamera(renderer);

  const grassTiles = createGrid(scene);

  const grassFieldSize = GRID_SIZE * TILE_SIZE;
  const grassFieldGeometry = new THREE.PlaneGeometry(grassFieldSize, grassFieldSize);
  const grassFieldMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5016,
    roughness: 0.9,
    metalness: 0.0,
  });

  const grassField = new THREE.Mesh(grassFieldGeometry, grassFieldMaterial);
  grassField.rotation.x = -Math.PI / 2;
  grassField.position.y = -0.03;
  grassField.receiveShadow = true;
  scene.add(grassField);

  const waterSize = 10000;
  const waterGeometry = new THREE.PlaneGeometry(waterSize, waterSize);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x006994,
    roughness: 0.8,
    metalness: 0.1,
    transparent: true,
    opacity: 0.8,
  });

  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.8;
  water.receiveShadow = true;
  scene.add(water);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  initDayNight(scene, ambientLight);

  const endDayBtn = document.getElementById("end-day-btn");
  if (endDayBtn) {
    endDayBtn.addEventListener("click", async () => {
      const { endDay } = await import("../dayNight.js");
      await endDay();
    });
  }
  
  // Thiết lập callback sau khi game đã bắt đầu
  // Sử dụng setTimeout để đảm bảo game đã khởi tạo xong
  setTimeout(() => {
    import("../Rules/integration.js").then(({ setupDayCompleteCallback }) => {
      setupDayCompleteCallback();
    });
  }, 1000);

  return {
    scene,
    renderer,
    camera,
    controls,
    grassTiles,
    setCameraViewMode,
    getCameraViewMode,
  };
}

