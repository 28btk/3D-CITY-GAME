import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { TILE_SIZE, ENTERTAINMENT_MODEL_PATHS } from "./utils/constants.js";
import { getTargetTiles } from "./utils/grid.js";
import { highlightTiles, clearTileHighlights } from "./utils/highlight.js";

const loader = new GLTFLoader();
const entertainmentModels = {
  1: null,
  2: null,
};

function loadEntertainmentModel(key, path) {
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
      entertainmentModels[key] = root;
    },
    undefined,
    (error) => {
      console.error("Lỗi load entertainment", key, path, error);
    }
  );
}

export function loadAllEntertainmentModels() {
  Object.keys(ENTERTAINMENT_MODEL_PATHS).forEach((key) => {
    loadEntertainmentModel(parseInt(key), ENTERTAINMENT_MODEL_PATHS[key]);
  });
}

export function getEntertainmentModel(key) {
  return entertainmentModels[key];
}

let previewEntertainment = null;
let currentHoveredTile = null;
let selectedTile = null;
let selectedTiles = [];

export function createPreviewEntertainment(tile, rotation, currentEntertainmentType, isBuildEntertainmentMode, scene) {
  removePreviewEntertainment(scene);

  if (!isBuildEntertainmentMode || !tile) return;

  const modelTemplate = entertainmentModels[currentEntertainmentType];
  if (!modelTemplate) return;

  previewEntertainment = modelTemplate.clone(true);
  
  previewEntertainment.traverse((child) => {
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

  previewEntertainment.position.set(0, 0, 0);
  previewEntertainment.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(previewEntertainment);
  const size = new THREE.Vector3();
  box.getSize(size);

  const targetTiles = getTargetTiles(tile, rotation, currentEntertainmentType, "entertainment");

  const canPlace = !targetTiles.some((t) => t.userData.entertainment || t.userData.house || t.userData.energy);
  
  if (!canPlace) {
    previewEntertainment.traverse((child) => {
      if (child.isMesh && child.material && !(child.material instanceof THREE.MeshBasicMaterial)) {
        child.material.emissive = new THREE.Color(0xff0000);
        child.material.emissiveIntensity = 0.5;
      }
    });
  }

  if (currentEntertainmentType === 1) {
    const targetXZ = TILE_SIZE * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 1.0;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    previewEntertainment.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    previewEntertainment.rotation.y = (rotation * Math.PI) / 180;
  } else if (currentEntertainmentType === 2) {
    const normalizedRotation = rotation === 0 || rotation === 90 ? rotation : (rotation === 180 ? 0 : 90);
    
    const targetLength = TILE_SIZE * 4 * 0.9;
    const targetWidth = TILE_SIZE * 3 * 0.9;
    const targetHeight = TILE_SIZE * 2.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    previewEntertainment.scale.set(scaleX, scaleY, scaleZ);
    
    if (normalizedRotation === 0) {
      previewEntertainment.rotation.y = 0;
    } else if (normalizedRotation === 90) {
      previewEntertainment.rotation.y = (90 * Math.PI) / 180;
    }
    
    if (rotation === 180) {
      previewEntertainment.rotation.y = (180 * Math.PI) / 180;
    } else if (rotation === 270) {
      previewEntertainment.rotation.y = (270 * Math.PI) / 180;
    }
  }

  box.setFromObject(previewEntertainment);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if (currentEntertainmentType === 2 && targetTiles.length > 1) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / targetTiles.length;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / targetTiles.length;
  }

  previewEntertainment.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(previewEntertainment);
  currentHoveredTile = tile;
}

export function removePreviewEntertainment(scene) {
  if (previewEntertainment) {
    scene.remove(previewEntertainment);
    previewEntertainment = null;
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

export function setSelectedTile(tile, rotation, currentEntertainmentType, scene) {
  selectedTile = tile;
  selectedTiles = getTargetTiles(tile, rotation, currentEntertainmentType, "entertainment");
  highlightTiles(selectedTiles, scene);
}

export function getSelectedTiles() {
  return selectedTiles;
}

export function getCurrentHoveredTile() {
  return currentHoveredTile;
}

export function buildEntertainment(tile, currentEntertainmentType, rotation, targetTiles, scene) {
  const modelTemplate = entertainmentModels[currentEntertainmentType];
  if (!modelTemplate) return null;

  const entertainment = modelTemplate.clone(true);

  entertainment.position.set(0, 0, 0);
  entertainment.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(entertainment);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (currentEntertainmentType === 1) {
    const targetXZ = TILE_SIZE * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 1.0;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    entertainment.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    entertainment.rotation.y = (rotation * Math.PI) / 180;
  } else if (currentEntertainmentType === 2) {
    const normalizedRotation = rotation === 0 || rotation === 90 ? rotation : (rotation === 180 ? 0 : 90);
    
    const targetLength = TILE_SIZE * 4 * 0.9;
    const targetWidth = TILE_SIZE * 3 * 0.9;
    const targetHeight = TILE_SIZE * 2.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    entertainment.scale.set(scaleX, scaleY, scaleZ);
    
    if (normalizedRotation === 0) {
      entertainment.rotation.y = 0;
    } else if (normalizedRotation === 90) {
      entertainment.rotation.y = (90 * Math.PI) / 180;
    }
    
    if (rotation === 180) {
      entertainment.rotation.y = (180 * Math.PI) / 180;
    } else if (rotation === 270) {
      entertainment.rotation.y = (270 * Math.PI) / 180;
    }
  }

  box.setFromObject(entertainment);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if (currentEntertainmentType === 2 && targetTiles.length > 1) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / targetTiles.length;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / targetTiles.length;
  }

  entertainment.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(entertainment);
  
  targetTiles.forEach((t) => {
    t.userData.entertainment = entertainment;
  });

  return entertainment;
}

export { loader };
