import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { TILE_SIZE, FACTORY_TYPES, FACTORY_MODEL_PATHS } from "./utils/constants.js";
import { getTargetTiles } from "./utils/grid.js";
import { highlightTiles, clearTileHighlights } from "./utils/highlight.js";

const loader = new GLTFLoader();
const factoryModels = {};
let previewFactory = null;
let selectedTile = null;

function loadFactoryModel(key, path) {
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
      factoryModels[key] = root;
    },
    undefined,
    (error) => {
      console.error("Lỗi load factory", key, path, error);
    }
  );
}

export function loadAllFactoryModels() {
  Object.keys(FACTORY_MODEL_PATHS).forEach((key) => {
    loadFactoryModel(parseInt(key), FACTORY_MODEL_PATHS[key]);
  });
}

export function removePreviewFactory(scene) {
  if (previewFactory) {
    if (previewFactory.parent) {
      previewFactory.parent.remove(previewFactory);
    }
    scene.remove(previewFactory);
    previewFactory = null;
  }
}

let currentHoveredTile = null;
let selectedTiles = [];

export function createPreviewFactory(tile, rotation, currentFactoryType, isBuildFactoryMode, scene) {
  removePreviewFactory(scene);
  currentHoveredTile = tile;

  if (!isBuildFactoryMode || !tile) return;

  const modelTemplate = factoryModels[currentFactoryType];
  if (!modelTemplate) return;

  previewFactory = modelTemplate.clone(true);

  previewFactory.traverse((child) => {
    if (child.isMesh && child.material) {
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
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });

  previewFactory.position.set(0, 0, 0);
  previewFactory.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(previewFactory);
  const size = new THREE.Vector3();
  box.getSize(size);

  const targetTiles = getTargetTiles(tile, rotation, currentFactoryType, "factory");

  const canPlace = !targetTiles.some((t) => t.userData.factory || t.userData.house || t.userData.energy || t.userData.entertainment || t.userData.store || t.userData.facilities);

  if (!canPlace) {
    previewFactory.traverse((child) => {
      if (child.isMesh && child.material && !(child.material instanceof THREE.MeshBasicMaterial)) {
        child.material.emissive = new THREE.Color(0xff0000);
        child.material.emissiveIntensity = 0.5;
      }
    });
  }

  if (currentFactoryType === FACTORY_TYPES.SMALL_FACTORY) {
    const targetXZ = TILE_SIZE * 2 * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 1.5;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    previewFactory.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    previewFactory.rotation.y = (rotation * Math.PI) / 180;
  } else if (currentFactoryType === FACTORY_TYPES.BIG_FACTORY) {
    const normalizedRotation = rotation === 0 || rotation === 90 ? rotation : (rotation === 180 ? 0 : 90);
    
    const targetLength = TILE_SIZE * 3 * 0.9;
    const targetWidth = TILE_SIZE * 2 * 0.9;
    const targetHeight = TILE_SIZE * 2.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    previewFactory.scale.set(scaleX, scaleY, scaleZ);
    
    if (normalizedRotation === 0) {
      previewFactory.rotation.y = 0;
    } else if (normalizedRotation === 90) {
      previewFactory.rotation.y = (90 * Math.PI) / 180;
    }
    
    if (rotation === 180) {
      previewFactory.rotation.y = (180 * Math.PI) / 180;
    } else if (rotation === 270) {
      previewFactory.rotation.y = (270 * Math.PI) / 180;
    }
  } else if (currentFactoryType === FACTORY_TYPES.INDUSTRY) {
    const targetXZ = TILE_SIZE * 5 * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 2.0;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    previewFactory.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    previewFactory.rotation.y = (rotation * Math.PI) / 180;
  }

  box.setFromObject(previewFactory);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if (targetTiles.length > 1) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / targetTiles.length;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / targetTiles.length;
  }

  previewFactory.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  scene.add(previewFactory);
}

export function buildFactory(tile, currentFactoryType, rotation, targetTiles, scene) {
  const modelTemplate = factoryModels[currentFactoryType];
  if (!modelTemplate) return null;

  const factory = modelTemplate.clone(true);

  factory.position.set(0, 0, 0);
  factory.rotation.y = 0;

  const box = new THREE.Box3().setFromObject(factory);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (currentFactoryType === FACTORY_TYPES.SMALL_FACTORY) {
    const targetXZ = TILE_SIZE * 2 * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 1.5;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    factory.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    factory.rotation.y = (rotation * Math.PI) / 180;
  } else if (currentFactoryType === FACTORY_TYPES.BIG_FACTORY) {
    const normalizedRotation = rotation === 0 || rotation === 90 ? rotation : (rotation === 180 ? 0 : 90);
    
    const targetLength = TILE_SIZE * 3 * 0.9;
    const targetWidth = TILE_SIZE * 2 * 0.9;
    const targetHeight = TILE_SIZE * 2.0;
    
    const scaleX = targetLength / (size.x || 1);
    const scaleZ = targetWidth / (size.z || 1);
    const scaleY = targetHeight / (size.y || 1);
    factory.scale.set(scaleX, scaleY, scaleZ);
    
    if (normalizedRotation === 0) {
      factory.rotation.y = 0;
    } else if (normalizedRotation === 90) {
      factory.rotation.y = (90 * Math.PI) / 180;
    }
    
    if (rotation === 180) {
      factory.rotation.y = (180 * Math.PI) / 180;
    } else if (rotation === 270) {
      factory.rotation.y = (270 * Math.PI) / 180;
    }
  } else if (currentFactoryType === FACTORY_TYPES.INDUSTRY) {
    const targetXZ = TILE_SIZE * 5 * 0.9;
    const maxXZ = Math.max(size.x, size.z) || 1;
    const scaleFactorXZ = targetXZ / maxXZ;
    const targetHeight = TILE_SIZE * 2.0;
    const currentHeight = size.y || 1;
    const scaleFactorY = targetHeight / currentHeight;
    factory.scale.set(scaleFactorXZ, scaleFactorY, scaleFactorXZ);
    
    factory.rotation.y = (rotation * Math.PI) / 180;
  }

  box.setFromObject(factory);
  const newCenter = new THREE.Vector3();
  box.getCenter(newCenter);
  const minY = box.min.y;

  let centerX = tile.position.x;
  let centerZ = tile.position.z;
  
  if (targetTiles.length > 1) {
    centerX = targetTiles.reduce((sum, t) => sum + t.position.x, 0) / targetTiles.length;
    centerZ = targetTiles.reduce((sum, t) => sum + t.position.z, 0) / targetTiles.length;
  }

  factory.position.set(
    centerX - newCenter.x,
    -minY,
    centerZ - newCenter.z
  );

  factory.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(factory);

  targetTiles.forEach((t) => {
    t.userData.factory = factory;
  });

  return factory;
}

export function removeFactory(factory, scene) {
  if (factory) {
    const grassTiles = scene.children.filter((child) => child.userData && child.userData.isGrassTile);
    grassTiles.forEach((tile) => {
      if (tile.userData.factory === factory) {
        delete tile.userData.factory;
      }
    });

    scene.remove(factory);
  }
}

export function clearSelection(scene) {
  selectedTile = null;
  selectedTiles = [];
  removePreviewFactory(scene);
  clearTileHighlights(scene);
}

export function getSelectedTile() {
  return selectedTile;
}

export function setSelectedTile(tile, rotation, currentFactoryType, scene) {
  selectedTile = tile;
  selectedTiles = getTargetTiles(tile, rotation, currentFactoryType, "factory");
  highlightTiles(selectedTiles, scene);
}

export function getSelectedTiles() {
  return selectedTiles;
}

export function getCurrentHoveredTile() {
  return currentHoveredTile;
}
