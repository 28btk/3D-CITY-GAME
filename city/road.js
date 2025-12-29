import * as THREE from "three";
import { TILE_SIZE } from "./utils/constants.js";
import { getGrassTiles } from "./utils/grid.js";

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

function getRoadDirection(adjacent) {
  const hasNorth = adjacent.north !== null && isRoadTile(adjacent.north);
  const hasSouth = adjacent.south !== null && isRoadTile(adjacent.south);
  const hasEast = adjacent.east !== null && isRoadTile(adjacent.east);
  const hasWest = adjacent.west !== null && isRoadTile(adjacent.west);
  
  const horizontal = hasEast || hasWest;
  const vertical = hasNorth || hasSouth;
  
  let direction = null;
  
  if (horizontal && vertical) {
    direction = 'cross';
  } else if (horizontal) {
    direction = 'horizontal';
  } else if (vertical) {
    direction = 'vertical';
  } else {
    if (hasEast || hasWest) {
      direction = 'horizontal';
    } else if (hasNorth || hasSouth) {
      direction = 'vertical';
    } else {
      direction = 'horizontal';
    }
  }
  
  return {
    direction,
    hasNorth,
    hasSouth,
    hasEast,
    hasWest,
    isCorner: (hasNorth && hasEast) || (hasNorth && hasWest) || 
              (hasSouth && hasEast) || (hasSouth && hasWest)
  };
}

export function buildRoad(tile, scene) {
  const previousColor = tile.material.color.clone();
  const previousRoad = tile.userData.road;
  const previousVisible = tile.visible;
  
  if (previousRoad) {
    scene.remove(previousRoad);
  }
  
  tile.visible = false;
  
  const allTiles = getGrassTiles();
  const adjacent = getAdjacentTiles(tile, allTiles);
  const roadInfo = getRoadDirection(adjacent);
  
  const roadGroup = createRoadGroup(roadInfo);
  
  roadGroup.position.set(tile.position.x, 0, tile.position.z);
  scene.add(roadGroup);
  
  tile.userData.road = roadGroup;
  tile.userData.roadInfo = roadInfo;
  
  updateAdjacentRoads(tile, scene, allTiles);
  
  return { previousColor, previousRoad, previousVisible };
}

function createRoadGroup(roadInfo) {
  const roadGroup = new THREE.Group();
  
  const roadSize = TILE_SIZE * 1.0;
  const roadGeometry = new THREE.PlaneGeometry(roadSize, roadSize);
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.8,
    metalness: 0.1,
  });
  const roadPlane = new THREE.Mesh(roadGeometry, roadMaterial);
  roadPlane.rotation.x = -Math.PI / 2;
  roadPlane.position.y = 0.01;
  roadGroup.add(roadPlane);
  
  const centerLineWidth = TILE_SIZE * 0.05;
  const centerLineMaterial = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    roughness: 0.5,
    metalness: 0.0,
  });
  
  if (roadInfo.hasEast || roadInfo.hasWest) {
    let startX = -TILE_SIZE * 0.475;
    let lengthX = TILE_SIZE * 0.95;
    
    if (roadInfo.hasEast && !roadInfo.hasWest) {
      startX = 0;
      lengthX = TILE_SIZE * 0.475;
    } else if (roadInfo.hasWest && !roadInfo.hasEast) {
      startX = -TILE_SIZE * 0.475;
      lengthX = TILE_SIZE * 0.475;
    }
    
    const centerLineGeometry = new THREE.PlaneGeometry(lengthX, centerLineWidth);
    const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial.clone());
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(startX + lengthX / 2, 0.011, 0);
    roadGroup.add(centerLine);
  }
  
  if (roadInfo.hasNorth || roadInfo.hasSouth) {
    let startZ = -TILE_SIZE * 0.475;
    let lengthZ = TILE_SIZE * 0.95;
    
    if (roadInfo.hasNorth && !roadInfo.hasSouth) {
      startZ = 0;
      lengthZ = TILE_SIZE * 0.475;
    } else if (roadInfo.hasSouth && !roadInfo.hasNorth) {
      startZ = -TILE_SIZE * 0.475;
      lengthZ = TILE_SIZE * 0.475;
    }
    
    const centerLineGeometry = new THREE.PlaneGeometry(centerLineWidth, lengthZ);
    const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial.clone());
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.011, startZ + lengthZ / 2);
    roadGroup.add(centerLine);
  }
  
  const borderWidth = TILE_SIZE * 0.03;
  const borderLength = TILE_SIZE * 0.95;
  const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.0,
  });
  
  if (!roadInfo.hasNorth) {
    const topBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(borderLength, borderWidth),
      borderMaterial.clone()
    );
    topBorder.rotation.x = -Math.PI / 2;
    topBorder.position.set(0, 0.011, TILE_SIZE * 0.46);
    roadGroup.add(topBorder);
  }
  
  if (!roadInfo.hasSouth) {
    const bottomBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(borderLength, borderWidth),
      borderMaterial.clone()
    );
    bottomBorder.rotation.x = -Math.PI / 2;
    bottomBorder.position.set(0, 0.011, -TILE_SIZE * 0.46);
    roadGroup.add(bottomBorder);
  }
  
  if (!roadInfo.hasWest) {
    const leftBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(borderWidth, borderLength),
      borderMaterial.clone()
    );
    leftBorder.rotation.x = -Math.PI / 2;
    leftBorder.position.set(-TILE_SIZE * 0.46, 0.011, 0);
    roadGroup.add(leftBorder);
  }
  
  if (!roadInfo.hasEast) {
    const rightBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(borderWidth, borderLength),
      borderMaterial.clone()
    );
    rightBorder.rotation.x = -Math.PI / 2;
    rightBorder.position.set(TILE_SIZE * 0.46, 0.011, 0);
    roadGroup.add(rightBorder);
  }
  
  if (roadInfo.isCorner) {
    const cornerRadius = TILE_SIZE * 0.15;
    const cornerGeometry = new THREE.CircleGeometry(cornerRadius, 16);
    const cornerMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.1,
    });
    
    if (roadInfo.hasNorth && roadInfo.hasEast) {
      const corner = new THREE.Mesh(cornerGeometry, cornerMaterial.clone());
      corner.rotation.x = -Math.PI / 2;
      corner.position.set(TILE_SIZE * 0.35, 0.01, TILE_SIZE * 0.35);
      roadGroup.add(corner);
    }
    if (roadInfo.hasNorth && roadInfo.hasWest) {
      const corner = new THREE.Mesh(cornerGeometry, cornerMaterial.clone());
      corner.rotation.x = -Math.PI / 2;
      corner.position.set(-TILE_SIZE * 0.35, 0.01, TILE_SIZE * 0.35);
      roadGroup.add(corner);
    }
    if (roadInfo.hasSouth && roadInfo.hasEast) {
      const corner = new THREE.Mesh(cornerGeometry, cornerMaterial.clone());
      corner.rotation.x = -Math.PI / 2;
      corner.position.set(TILE_SIZE * 0.35, 0.01, -TILE_SIZE * 0.35);
      roadGroup.add(corner);
    }
    if (roadInfo.hasSouth && roadInfo.hasWest) {
      const corner = new THREE.Mesh(cornerGeometry, cornerMaterial.clone());
      corner.rotation.x = -Math.PI / 2;
      corner.position.set(-TILE_SIZE * 0.35, 0.01, -TILE_SIZE * 0.35);
      roadGroup.add(corner);
    }
  }
  
  return roadGroup;
}

function updateAdjacentRoads(tile, scene, allTiles) {
  const adjacent = getAdjacentTiles(tile, allTiles);
  
  [adjacent.north, adjacent.south, adjacent.east, adjacent.west].forEach((adjTile) => {
    if (adjTile && isRoadTile(adjTile)) {
      if (adjTile.userData.road) {
        scene.remove(adjTile.userData.road);
      }
      
      const newAdjacent = getAdjacentTiles(adjTile, allTiles);
      const newRoadInfo = getRoadDirection(newAdjacent);
      const newRoadGroup = createRoadGroup(newRoadInfo);
      
      newRoadGroup.position.set(adjTile.position.x, 0, adjTile.position.z);
      scene.add(newRoadGroup);
      
      adjTile.userData.road = newRoadGroup;
      adjTile.userData.roadInfo = newRoadInfo;
    }
  });
}

export function undoRoad(tile, prevData, scene) {
  if (tile && prevData) {
    if (tile.userData.road) {
      scene.remove(tile.userData.road);
      tile.userData.road = null;
    }
    
    if (prevData.previousVisible !== undefined) {
      tile.visible = prevData.previousVisible;
    }
    
    if (prevData.previousColor) {
      tile.material.color.copy(prevData.previousColor);
    }
    
    if (prevData.previousRoad) {
      scene.add(prevData.previousRoad);
      tile.userData.road = prevData.previousRoad;
    }
    
    const allTiles = getGrassTiles();
    updateAdjacentRoads(tile, scene, allTiles);
  }
}
