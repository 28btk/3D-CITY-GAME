import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { TILE_SIZE } from "./utils/constants.js";
import { getGrassTiles } from "./utils/grid.js";

const loader = new GLTFLoader();
const vehicleModels = {};

const VEHICLE_MODEL_PATHS = {
  1: "https://res.cloudinary.com/dca7qiz5w/image/upload/v1767021098/hummer_ev_-_low_poly_u0gvld.glb",
  2: "https://res.cloudinary.com/dca7qiz5w/image/upload/v1767021098/low_poly_car_-_cadillac_75_sedan_1953_c1x3hv.glb",
  3: "https://res.cloudinary.com/dca7qiz5w/image/upload/v1767021098/low_poly_truck_kd5w0f.glb",
  4: "https://res.cloudinary.com/dca7qiz5w/image/upload/v1767021095/2002_mazda_rx-7_spirit_r_type_a_fd_w8xncj.glb",
  5: "https://res.cloudinary.com/dca7qiz5w/image/upload/v1767021095/green_bus_low_poly_wg8kh9.glb",
  6: "https://res.cloudinary.com/dca7qiz5w/image/upload/v1767021093/1989_mazda_mx-5_dl8bui.glb",
};

function isRoadTile(tile) {
  return tile.userData.road !== undefined && tile.userData.road !== null;
}

function getAdjacentTiles(tile, allTiles) {
  const adjacent = { north: null, south: null, east: null, west: null };
  const x = tile.position.x;
  const z = tile.position.z;
  
  allTiles.forEach((t) => {
    if (t === tile) return;
    const dx = Math.abs(t.position.x - x);
    const dz = Math.abs(t.position.z - z);
    
    if (dx < 0.1 && Math.abs(t.position.z - (z + TILE_SIZE)) < 0.1) {
      adjacent.north = t;
    } else if (dx < 0.1 && Math.abs(t.position.z - (z - TILE_SIZE)) < 0.1) {
      adjacent.south = t;
    } else if (dz < 0.1 && Math.abs(t.position.x - (x + TILE_SIZE)) < 0.1) {
      adjacent.east = t;
    } else if (dz < 0.1 && Math.abs(t.position.x - (x - TILE_SIZE)) < 0.1) {
      adjacent.west = t;
    }
  });
  
  return adjacent;
}

function getAdjacentRoadTiles(tile, allTiles) {
  const adjacent = getAdjacentTiles(tile, allTiles);
  const roadTiles = [];
  
  if (adjacent.north && isRoadTile(adjacent.north)) roadTiles.push(adjacent.north);
  if (adjacent.south && isRoadTile(adjacent.south)) roadTiles.push(adjacent.south);
  if (adjacent.east && isRoadTile(adjacent.east)) roadTiles.push(adjacent.east);
  if (adjacent.west && isRoadTile(adjacent.west)) roadTiles.push(adjacent.west);
  
  return roadTiles;
}

function loadVehicleModel(key, path) {
  loader.load(
    path,
    (gltf) => {
      const root = gltf.scene.clone();
      root.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      vehicleModels[key] = root;
    },
    undefined,
    (error) => {
      console.error("Lỗi load vehicle", key, path, error);
    }
  );
}

export function loadAllVehicleModels() {
  Object.keys(VEHICLE_MODEL_PATHS).forEach((key) => {
    loadVehicleModel(parseInt(key), VEHICLE_MODEL_PATHS[key]);
  });
}

const vehicles = [];

function createVehicle(vehicleType, roadTile, scene) {
  if (!vehicleModels[vehicleType]) {
    console.warn(`Vehicle model ${vehicleType} chưa được load`);
    return null;
  }
  
  const vehicleModel = vehicleModels[vehicleType].clone();
  
  const box = new THREE.Box3().setFromObject(vehicleModel);
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  const targetSize = TILE_SIZE * 0.6;
  const scale = targetSize / maxSize;
  vehicleModel.scale.set(scale, scale, scale);
  
  vehicleModel.position.set(
    roadTile.position.x,
    0.02,
    roadTile.position.z
  );
  
  const vehicle = {
    model: vehicleModel,
    currentTile: roadTile,
    targetTile: null,
    speed: 0.5 + Math.random() * 0.5,
    progress: 0,
    lastDirection: null,
    currentLaneOffset: 0,
    targetLaneOffset: TILE_SIZE * 0.3,
  };
  
  const adjacentRoads = getAdjacentRoadTiles(roadTile, getGrassTiles());
  if (adjacentRoads.length > 0) {
    vehicle.targetTile = adjacentRoads[Math.floor(Math.random() * adjacentRoads.length)];
  }
  
  scene.add(vehicleModel);
  vehicles.push(vehicle);
  
  return vehicle;
}

function checkAndHandleCollisions(vehicles, scene) {
  const collisionRadius = TILE_SIZE * 0.3;
  const vehiclesToTurn = new Set();
  
  for (let i = 0; i < vehicles.length; i++) {
    if (vehiclesToTurn.has(i)) continue;
    
    const vehicle1 = vehicles[i];
    const pos1 = vehicle1.model.position;
    
    for (let j = i + 1; j < vehicles.length; j++) {
      if (vehiclesToTurn.has(j)) continue;
      
      const vehicle2 = vehicles[j];
      const pos2 = vehicle2.model.position;
      
      const distance = pos1.distanceTo(pos2);
      
      if (distance < collisionRadius) {
        vehiclesToTurn.add(j);
        break;
      }
    }
  }
  
  vehiclesToTurn.forEach((index) => {
    const vehicle = vehicles[index];
    
    vehicle.model.rotation.y += Math.PI;
    
    const temp = vehicle.currentTile;
    vehicle.currentTile = vehicle.targetTile || vehicle.currentTile;
    vehicle.targetTile = temp;
    
    if (vehicle.progress > 0) {
      vehicle.progress = 1 - vehicle.progress;
    }
    
    if (vehicle.lastDirection) {
      vehicle.lastDirection.multiplyScalar(-1);
    }
  });
}

function updateVehiclePosition(vehicle, deltaTime) {
  if (!vehicle.targetTile) {
    const adjacentRoads = getAdjacentRoadTiles(vehicle.currentTile, getGrassTiles());
    if (adjacentRoads.length > 0) {
      const filtered = adjacentRoads.filter(t => t !== vehicle.currentTile);
      if (filtered.length > 0) {
        vehicle.targetTile = filtered[Math.floor(Math.random() * filtered.length)];
      } else {
        vehicle.targetTile = adjacentRoads[0];
      }
      vehicle.progress = 0;
    } else {
      return;
    }
  }
  
  const distance = TILE_SIZE;
  const moveDistance = vehicle.speed * deltaTime * 0.001;
  vehicle.progress += moveDistance / distance;
  
  if (vehicle.progress >= 1) {
    vehicle.currentTile = vehicle.targetTile;
    vehicle.targetTile = null;
    vehicle.progress = 0;
    
    const adjacentRoads = getAdjacentRoadTiles(vehicle.currentTile, getGrassTiles());
    if (adjacentRoads.length > 0) {
      const filtered = adjacentRoads.filter(t => {
        return adjacentRoads.length === 1 || true;
      });
      vehicle.targetTile = filtered[Math.floor(Math.random() * filtered.length)];
    }
  } else {
    const startPos = new THREE.Vector3(
      vehicle.currentTile.position.x,
      0.02,
      vehicle.currentTile.position.z
    );
    const endPos = new THREE.Vector3(
      vehicle.targetTile.position.x,
      0.02,
      vehicle.targetTile.position.z
    );
    
    const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    
    const right = new THREE.Vector3().crossVectors(
      direction,
      new THREE.Vector3(0, 1, 0)
    ).normalize();
    
    const laneChangeSpeed = 0.05;
    vehicle.currentLaneOffset += (vehicle.targetLaneOffset - vehicle.currentLaneOffset) * laneChangeSpeed;
    
    const rightOffset = right.multiplyScalar(vehicle.currentLaneOffset);
    
    const centerPos = new THREE.Vector3().lerpVectors(startPos, endPos, vehicle.progress);
    
    const finalPos = new THREE.Vector3().addVectors(centerPos, rightOffset);
    finalPos.y = 0.02;
    
    vehicle.model.position.copy(finalPos);
    
    if (direction.length() > 0.01) {
      vehicle.model.lookAt(
        vehicle.model.position.x + direction.x,
        vehicle.model.position.y,
        vehicle.model.position.z + direction.z
      );
      vehicle.lastDirection = direction;
    }
  }
}

let isInitialized = false;
let roadTiles = [];

function updateRoadTiles() {
  const allTiles = getGrassTiles();
  roadTiles = allTiles.filter(tile => isRoadTile(tile));
}

function spawnVehicle(scene) {
  if (roadTiles.length === 0) return;
  
  const vehicleType = Math.floor(Math.random() * Object.keys(VEHICLE_MODEL_PATHS).length) + 1;
  
  const randomRoadTile = roadTiles[Math.floor(Math.random() * roadTiles.length)];
  
  const hasVehicleAtTile = vehicles.some(v => {
    const dx = Math.abs(v.model.position.x - randomRoadTile.position.x);
    const dz = Math.abs(v.model.position.z - randomRoadTile.position.z);
    return dx < 0.5 && dz < 0.5;
  });
  
  if (!hasVehicleAtTile) {
    createVehicle(vehicleType, randomRoadTile, scene);
  }
}

export function updateVehicles(deltaTime, scene) {
  if (!isInitialized) {
    const allLoaded = Object.keys(VEHICLE_MODEL_PATHS).every(key => vehicleModels[key] !== undefined);
    if (allLoaded) {
      isInitialized = true;
      updateRoadTiles();
    } else {
      return;
    }
  }
  
  updateRoadTiles();
  
  vehicles.forEach((vehicle) => {
    updateVehiclePosition(vehicle, deltaTime);
  });
  
  checkAndHandleCollisions(vehicles, scene);
  
  for (let i = vehicles.length - 1; i >= 0; i--) {
    const vehicle = vehicles[i];
    if (!isRoadTile(vehicle.currentTile) && 
        (!vehicle.targetTile || !isRoadTile(vehicle.targetTile))) {
      scene.remove(vehicle.model);
      vehicles.splice(i, 1);
    }
  }
  
  const targetVehicleCount = Math.floor(roadTiles.length / 4.5);
  if (roadTiles.length > 0 && vehicles.length < targetVehicleCount) {
    if (Math.random() < 0.01) {
      spawnVehicle(scene);
    }
  }
}

export function clearAllVehicles(scene) {
  vehicles.forEach((vehicle) => {
    scene.remove(vehicle.model);
  });
  vehicles.length = 0;
  isInitialized = false;
}
