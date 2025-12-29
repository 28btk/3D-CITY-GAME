import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { TILE_SIZE, STORE_MODEL_PATHS } from "./utils/constants.js";
import { getTargetTiles } from "./utils/grid.js";
import { highlightTiles, clearTileHighlights } from "./utils/highlight.js";

const loader = new GLTFLoader();
const storeModels = {
  1: null,
  2: null,
};

function loadStoreModel(key, path) {
  loader.load(
    path,
    (gltf) => {
      const root = gltf.scene;
      root.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      storeModels[key] = root;
    },
    undefined,
    (error) => {
      console.error("Lỗi load store", key, path, error);
    }
  );
}

export function loadAllStoreModels() {
  Object.keys(STORE_MODEL_PATHS).forEach((key) => {
    loadStoreModel(parseInt(key), STORE_MODEL_PATHS[key]);
  });
}

export function getStoreModel(key) {
  return storeModels[key];
}

let previewStore = null;
let currentHoveredTile = null;
let selectedTile = null;
let selectedTiles = [];

export function createPreviewStore(tile, rotation, currentStoreType, isBuildStoreMode, scene) {
  removePreviewStore(scene);

  if (!isBuildStoreMode || !tile) return;

  const modelTemplate = storeModels[currentStoreType];
  if (!modelTemplate) return;

  previewStore = modelTemplate.clone(true);
  
  previewStore.traverse((child) => {
    if (child.isMesh) {
      let material = child.material.clone();
      if (material instanceof THREE.MeshBasicMaterial) {
        material = new THREE.MeshStandardMaterial({
          color: material.color,
          map: material.map,
          transparent: material.transparent,
          opacity: material.opacity,
        });
      }
      material.transparent = true;
      material.opacity = 0.6;
      material.emissive = new THREE.Color(0x00ff00);
      material.emissiveIntensity = 0.3;
      child.material = material;
    }
  });

  previewStore.position.set(0, 0, 0);
  previewStore.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(previewStore);
  const size = new THREE.Vector3();
  box.getSize(size);

  const targetTiles = getTargetTiles(tile, rotation, currentStoreType, "store");

  const canPlace = !targetTiles.some((t) => t.userData.store || t.userData.house || t.userData.energy || t.userData.entertainment);
  
  if (!canPlace) {
    previewStore.traverse((child) => {
      if (child.isMesh && child.material && !(child.material instanceof THREE.MeshBasicMaterial)) {
        child.material.emissive = new THREE.Color(0xff0000);
        child.material.emissiveIntensity = 0.5;
      }
    });
  }

  const targetXZ = TILE_SIZE * 0.9;
  const maxXZ = Math.max(size.x, size.z) || 1;
  const scaleFactorXZ = targetXZ / maxXZ;
  const targetHeight = TILE_SIZE * 1.0;
  const currentHeight = size.y || 1;
  const scaleFactorY = targetHeight / currentHeight;
  previewStore.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
  
  previewStore.rotation.y = (rotation * Math.PI) / 180;

  box.setFromObject(previewStore);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  const centerX = tile.position.x;
  const centerZ = tile.position.z;

  previewStore.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(previewStore);
  currentHoveredTile = tile;
}

export function removePreviewStore(scene) {
  if (previewStore) {
    scene.remove(previewStore);
    previewStore = null;
  }
  currentHoveredTile = null;
}

export function clearSelection(scene) {
  selectedTile = null;
  selectedTiles = [];
  clearTileHighlights(scene);
}

export function getSelectedTile() {
  return selectedTile;
}

export function setSelectedTile(tile, rotation, currentStoreType, scene) {
  selectedTile = tile;
  selectedTiles = getTargetTiles(tile, rotation, currentStoreType, "store");
  highlightTiles(selectedTiles, scene);
}

export function getSelectedTiles() {
  return selectedTiles;
}

export function getCurrentHoveredTile() {
  return currentHoveredTile;
}

export function buildStore(tile, currentStoreType, rotation, targetTiles, scene) {
  const modelTemplate = storeModels[currentStoreType];
  if (!modelTemplate) return null;

  const store = modelTemplate.clone(true);

  store.position.set(0, 0, 0);
  store.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(store);
  const size = new THREE.Vector3();
  box.getSize(size);

  const targetXZ = TILE_SIZE * 0.9;
  const maxXZ = Math.max(size.x, size.z) || 1;
  const scaleFactorXZ = targetXZ / maxXZ;
  const targetHeight = TILE_SIZE * 1.0;
  const currentHeight = size.y || 1;
  const scaleFactorY = targetHeight / currentHeight;
  store.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
  
  store.rotation.y = (rotation * Math.PI) / 180;

  box.setFromObject(store);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  const centerX = tile.position.x;
  const centerZ = tile.position.z;

  store.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(store);
  
  targetTiles.forEach((t) => {
    t.userData.store = store;
  });

  return store;
}

export { loader };
