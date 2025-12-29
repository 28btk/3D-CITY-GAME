import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { TILE_SIZE, HOUSE_MODEL_PATHS } from "./utils/constants.js";
import { getTargetTiles } from "./utils/grid.js";
import { highlightTiles, clearTileHighlights } from "./utils/highlight.js";

const loader = new GLTFLoader();
const houseModels = {
  1: null,
  2: null,
  3: null,
};

function loadHouseModel(key, path) {
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
      houseModels[key] = root;
    },
    undefined,
    (error) => {
      console.error("Lỗi load nhà", key, path, error);
    }
  );
}

export function loadAllHouseModels() {
  Object.keys(HOUSE_MODEL_PATHS).forEach((key) => {
    loadHouseModel(parseInt(key), HOUSE_MODEL_PATHS[key]);
  });
}

export function getHouseModel(key) {
  return houseModels[key];
}

let previewHouse = null;
let currentHoveredTile = null;
let selectedTile = null;
let selectedTiles = [];

export function createPreviewHouse(tile, rotation, currentHouseHeight, isBuildHouseMode, scene) {
  if (previewHouse) {
    scene.remove(previewHouse);
    previewHouse = null;
  }

  if (!isBuildHouseMode || !tile) return;

  const modelTemplate = houseModels[currentHouseHeight];
  if (!modelTemplate) return;

  previewHouse = modelTemplate.clone(true);
  
  previewHouse.traverse((child) => {
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

  previewHouse.position.set(0, 0, 0);
  previewHouse.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(previewHouse);
  const size = new THREE.Vector3();
  box.getSize(size);

  const targetTiles = getTargetTiles(tile, rotation, currentHouseHeight);

  const canPlace = !targetTiles.some((t) => t.userData.house) || currentHouseHeight === 1;
  
  if (!canPlace) {
    previewHouse.traverse((child) => {
      if (child.isMesh && child.material && !(child.material instanceof THREE.MeshBasicMaterial)) {
        child.material.emissive = new THREE.Color(0xff0000);
        child.material.emissiveIntensity = 0.5;
      }
    });
  }

  if (currentHouseHeight === 1) {
    const targetXZ = TILE_SIZE * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactor = targetXZ / maxXZ;
    previewHouse.scale.multiplyScalar(scaleFactor);
    previewHouse.rotation.y = (rotation * Math.PI) / 180;
  } else if (currentHouseHeight === 2) {
    const targetXZ = TILE_SIZE * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 2;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    previewHouse.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    previewHouse.rotation.y = (rotation * Math.PI) / 180;
  } else if (currentHouseHeight === 3) {
    const normalizedRotation = rotation === 0 || rotation === 90 ? rotation : 0;
    
    const targetLength = TILE_SIZE * 3 * 0.9;
    const targetWidth = TILE_SIZE * 0.9;
    const targetHeight = TILE_SIZE * 1.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    previewHouse.scale.set(scaleX, scaleY, scaleZ);
    
    if (normalizedRotation === 0) {
      previewHouse.rotation.y = 0;
    } else if (normalizedRotation === 90) {
      previewHouse.rotation.y = (90 * Math.PI) / 180;
    }
  }

  box.setFromObject(previewHouse);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if (currentHouseHeight === 3 && targetTiles.length === 3) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / 3;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / 3;
  }

  previewHouse.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(previewHouse);
  currentHoveredTile = tile;
}

export function removePreviewHouse(scene) {
  if (previewHouse) {
    scene.remove(previewHouse);
    previewHouse = null;
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

export function setSelectedTile(tile, rotation, currentHouseHeight, scene) {
  selectedTile = tile;
  selectedTiles = getTargetTiles(tile, rotation, currentHouseHeight);
  highlightTiles(selectedTiles, scene);
}

export function getSelectedTiles() {
  return selectedTiles;
}

export function getCurrentHoveredTile() {
  return currentHoveredTile;
}

export function buildHouse(tile, currentHouseHeight, rotation, targetTiles, scene) {
  const modelTemplate = houseModels[currentHouseHeight];
  if (!modelTemplate) return null;

  const house = modelTemplate.clone(true);

  house.position.set(0, 0, 0);
  house.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(house);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (currentHouseHeight === 1) {
    const targetXZ = TILE_SIZE * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactor = targetXZ / maxXZ;
    house.scale.multiplyScalar(scaleFactor);
    house.rotation.y = (rotation * Math.PI) / 180;
  } else if (currentHouseHeight === 2) {
    const targetXZ = TILE_SIZE * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 2;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    house.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    house.rotation.y = (rotation * Math.PI) / 180;
  } else if (currentHouseHeight === 3) {
    box.setFromObject(house);
    box.getSize(size);
    
    const normalizedRotation = rotation === 0 || rotation === 90 ? rotation : 0;
    
    const targetLength = TILE_SIZE * 3 * 0.9;
    const targetWidth = TILE_SIZE * 0.9;
    const targetHeight = TILE_SIZE * 1.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    house.scale.set(scaleX, scaleY, scaleZ);
    
    if (normalizedRotation === 0) {
      house.rotation.y = 0;
    } else if (normalizedRotation === 90) {
      house.rotation.y = (90 * Math.PI) / 180;
    }
  }

  box.setFromObject(house);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if (currentHouseHeight === 3 && targetTiles.length === 3) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / 3;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / 3;
  }

  house.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(house);
  
  targetTiles.forEach((t) => {
    t.userData.house = house;
  });

  return house;
}
