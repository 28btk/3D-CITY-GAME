import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { TILE_SIZE, ENERGY_MODEL_PATHS } from "./utils/constants.js";
import { getTargetTiles } from "./utils/grid.js";
import { highlightTiles, clearTileHighlights } from "./utils/highlight.js";

const loader = new GLTFLoader();
const energyModels = {
  1: null,
  2: null,
  3: null,
};

function loadEnergyModel(key, path) {
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
      energyModels[key] = root;
    },
    undefined,
    (error) => {
      console.error("Lỗi load energy", key, path, error);
    }
  );
}

export function loadAllEnergyModels() {
  Object.keys(ENERGY_MODEL_PATHS).forEach((key) => {
    loadEnergyModel(parseInt(key), ENERGY_MODEL_PATHS[key]);
  });
}

export function getEnergyModel(key) {
  return energyModels[key];
}

let previewEnergy = null;
let currentHoveredTile = null;
let selectedTile = null;
let selectedTiles = [];

export function createPreviewEnergy(tile, rotation, currentEnergyType, isBuildEnergyMode, scene) {
  removePreviewEnergy(scene);

  if (!isBuildEnergyMode || !tile) return;

  const modelTemplate = energyModels[currentEnergyType];
  if (!modelTemplate) return;

  previewEnergy = modelTemplate.clone(true);
  
  previewEnergy.traverse((child) => {
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

  previewEnergy.position.set(0, 0, 0);
  previewEnergy.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(previewEnergy);
  const size = new THREE.Vector3();
  box.getSize(size);

  const targetTiles = getTargetTiles(tile, rotation, currentEnergyType, "energy");

  const canPlace = !targetTiles.some((t) => t.userData.energy || t.userData.house);
  
  if (!canPlace) {
    previewEnergy.traverse((child) => {
      if (child.isMesh && child.material && !(child.material instanceof THREE.MeshBasicMaterial)) {
        child.material.emissive = new THREE.Color(0xff0000);
        child.material.emissiveIntensity = 0.5;
      }
    });
  }

  if (currentEnergyType === 1 || currentEnergyType === 2) {
    const targetLength = TILE_SIZE * 3 * 0.9;
    const targetWidth = TILE_SIZE * 2 * 0.9;
    const targetHeight = TILE_SIZE * 2.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    previewEnergy.scale.set(scaleX, scaleY, scaleZ);
    
    if (rotation === 0) {
      previewEnergy.rotation.y = 0;
    } else if (rotation === 90) {
      previewEnergy.rotation.y = (90 * Math.PI) / 180;
    }
  } else if (currentEnergyType === 3) {
    const targetXZ = TILE_SIZE * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 1.0;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    previewEnergy.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    previewEnergy.rotation.y = (rotation * Math.PI) / 180;
  }

  box.setFromObject(previewEnergy);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if ((currentEnergyType === 1 || currentEnergyType === 2) && targetTiles.length > 1) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / targetTiles.length;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / targetTiles.length;
  }

  previewEnergy.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(previewEnergy);
  currentHoveredTile = tile;
}

export function removePreviewEnergy(scene) {
  if (previewEnergy) {
    scene.remove(previewEnergy);
    previewEnergy = null;
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

export function setSelectedTile(tile, rotation, currentEnergyType, scene) {
  selectedTile = tile;
  selectedTiles = getTargetTiles(tile, rotation, currentEnergyType, "energy");
  highlightTiles(selectedTiles, scene);
}

export function getSelectedTiles() {
  return selectedTiles;
}

export function getCurrentHoveredTile() {
  return currentHoveredTile;
}

export function buildEnergy(tile, currentEnergyType, rotation, targetTiles, scene) {
  const modelTemplate = energyModels[currentEnergyType];
  if (!modelTemplate) return null;

  const energy = modelTemplate.clone(true);

  energy.position.set(0, 0, 0);
  energy.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(energy);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (currentEnergyType === 1 || currentEnergyType === 2) {
    const targetLength = TILE_SIZE * 3 * 0.9;
    const targetWidth = TILE_SIZE * 2 * 0.9;
    const targetHeight = TILE_SIZE * 2.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    energy.scale.set(scaleX, scaleY, scaleZ);
    
    if (rotation === 0) {
      energy.rotation.y = 0;
    } else if (rotation === 90) {
      energy.rotation.y = (90 * Math.PI) / 180;
    }
  } else if (currentEnergyType === 3) {
    const targetXZ = TILE_SIZE * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 1.0;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    energy.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    energy.rotation.y = (rotation * Math.PI) / 180;
    
    let bladeGroup = null;
    
    energy.traverse((child) => {
      if (child !== energy && (child.isGroup || child.isMesh)) {
        const name = child.name || "";
        if (name.includes("Cube") && name.includes("003")) {
          bladeGroup = child;
        }
      }
    });
    
    if (bladeGroup) {
      energy.userData.bladeGroup = bladeGroup;
      energy.userData.isWindTurbine = true;
    }
  }

  box.setFromObject(energy);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if ((currentEnergyType === 1 || currentEnergyType === 2) && targetTiles.length > 1) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / targetTiles.length;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / targetTiles.length;
  }

  energy.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(energy);
  
  targetTiles.forEach((t) => {
    t.userData.energy = energy;
  });

  return energy;
}

export { loader };
