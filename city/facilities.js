import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { TILE_SIZE, FACILITIES_MODEL_PATHS, FACILITIES_TYPES } from "./utils/constants.js";
import { getTargetTiles } from "./utils/grid.js";
import { highlightTiles, clearTileHighlights } from "./utils/highlight.js";

const loader = new GLTFLoader();
const facilitiesModels = {
  1: null,
  2: null,
  3: null,
  4: null,
  5: null,
};

function loadFacilitiesModel(key, path) {
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
      facilitiesModels[key] = root;
    },
    undefined,
    (error) => {
      console.error("Lỗi load facilities", key, path, error);
    }
  );
}

export function loadAllFacilitiesModels() {
  Object.keys(FACILITIES_MODEL_PATHS).forEach((key) => {
    loadFacilitiesModel(parseInt(key), FACILITIES_MODEL_PATHS[key]);
  });
}

export function getFacilitiesModel(key) {
  return facilitiesModels[key];
}

let previewFacilities = null;
let currentHoveredTile = null;
let selectedTile = null;
let selectedTiles = [];

export function createPreviewFacilities(tile, rotation, currentFacilitiesType, isBuildFacilitiesMode, scene) {
  removePreviewFacilities(scene);

  if (!isBuildFacilitiesMode || !tile) return;

  const modelTemplate = facilitiesModels[currentFacilitiesType];
  if (!modelTemplate) return;

  previewFacilities = modelTemplate.clone(true);
  
  previewFacilities.traverse((child) => {
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

  previewFacilities.position.set(0, 0, 0);
  previewFacilities.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(previewFacilities);
  const size = new THREE.Vector3();
  box.getSize(size);

  const targetTiles = getTargetTiles(tile, rotation, currentFacilitiesType, "facilities");

  const canPlace = !targetTiles.some((t) => t.userData.facilities || t.userData.house || t.userData.energy || t.userData.entertainment || t.userData.store);
  
  if (!canPlace) {
    previewFacilities.traverse((child) => {
      if (child.isMesh && child.material && !(child.material instanceof THREE.MeshBasicMaterial)) {
        child.material.emissive = new THREE.Color(0xff0000);
        child.material.emissiveIntensity = 0.5;
      }
    });
  }

  if (currentFacilitiesType === FACILITIES_TYPES.BANK) {
    const targetXZ = TILE_SIZE * 2 * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 2.0;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    previewFacilities.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    previewFacilities.rotation.y = (rotation * Math.PI) / 180;
  } else {
    const normalizedRotation = rotation === 0 || rotation === 90 ? rotation : (rotation === 180 ? 0 : 90);
    
    const targetLength = TILE_SIZE * 3 * 0.9;
    const targetWidth = TILE_SIZE * 2 * 0.9;
    const targetHeight = (currentFacilitiesType === FACILITIES_TYPES.FIRE_STATION || currentFacilitiesType === FACILITIES_TYPES.POLICE_STATION) 
      ? TILE_SIZE * 1.5 
      : TILE_SIZE * 2.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    previewFacilities.scale.set(scaleX, scaleY, scaleZ);
    
    if (normalizedRotation === 0) {
      previewFacilities.rotation.y = 0;
    } else if (normalizedRotation === 90) {
      previewFacilities.rotation.y = (90 * Math.PI) / 180;
    }
    
    if (rotation === 180) {
      previewFacilities.rotation.y = (180 * Math.PI) / 180;
    } else if (rotation === 270) {
      previewFacilities.rotation.y = (270 * Math.PI) / 180;
    }
  }

  box.setFromObject(previewFacilities);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if (targetTiles.length > 1) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / targetTiles.length;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / targetTiles.length;
  }

  previewFacilities.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(previewFacilities);
  currentHoveredTile = tile;
}

export function removePreviewFacilities(scene) {
  if (previewFacilities) {
    scene.remove(previewFacilities);
    previewFacilities = null;
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

export function setSelectedTile(tile, rotation, currentFacilitiesType, scene) {
  selectedTile = tile;
  selectedTiles = getTargetTiles(tile, rotation, currentFacilitiesType, "facilities");
  highlightTiles(selectedTiles, scene);
}

export function getSelectedTiles() {
  return selectedTiles;
}

export function getCurrentHoveredTile() {
  return currentHoveredTile;
}

export function buildFacilities(tile, currentFacilitiesType, rotation, targetTiles, scene) {
  const modelTemplate = facilitiesModels[currentFacilitiesType];
  if (!modelTemplate) return null;

  const facilities = modelTemplate.clone(true);

  facilities.position.set(0, 0, 0);
  facilities.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(facilities);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (currentFacilitiesType === FACILITIES_TYPES.BANK) {
    const targetXZ = TILE_SIZE * 2 * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 2.0;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    facilities.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    facilities.rotation.y = (rotation * Math.PI) / 180;
  } else {
    const normalizedRotation = rotation === 0 || rotation === 90 ? rotation : (rotation === 180 ? 0 : 90);
    
    const targetLength = TILE_SIZE * 3 * 0.9;
    const targetWidth = TILE_SIZE * 2 * 0.9;
    const targetHeight = (currentFacilitiesType === FACILITIES_TYPES.FIRE_STATION || currentFacilitiesType === FACILITIES_TYPES.POLICE_STATION) 
      ? TILE_SIZE * 1.5 
      : TILE_SIZE * 2.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    facilities.scale.set(scaleX, scaleY, scaleZ);
    
    if (normalizedRotation === 0) {
      facilities.rotation.y = 0;
    } else if (normalizedRotation === 90) {
      facilities.rotation.y = (90 * Math.PI) / 180;
    }
    
    if (rotation === 180) {
      facilities.rotation.y = (180 * Math.PI) / 180;
    } else if (rotation === 270) {
      facilities.rotation.y = (270 * Math.PI) / 180;
    }
  }

  box.setFromObject(facilities);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if (targetTiles.length > 1) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / targetTiles.length;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / targetTiles.length;
  }

  facilities.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(facilities);
  
  targetTiles.forEach((t) => {
    t.userData.facilities = facilities;
  });

  return facilities;
}

export { loader };
