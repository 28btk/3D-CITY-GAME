import * as THREE from "three";
import { GRID_SIZE, TILE_SIZE, HALF_GRID } from "./constants.js";

let grassTiles = [];
let gridHelper = null;

export function createGrid(scene) {
  const grassGeometry = new THREE.BoxGeometry(TILE_SIZE, 0.05, TILE_SIZE);
  grassTiles = [];

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const material = new THREE.MeshStandardMaterial({
        color: 0x50673a,
        roughness: 0.9,
        metalness: 0.0,
      });

      const tile = new THREE.Mesh(grassGeometry, material);
      tile.receiveShadow = true;

      const x = i * TILE_SIZE - HALF_GRID + TILE_SIZE / 2;
      const z = j * TILE_SIZE - HALF_GRID + TILE_SIZE / 2;

      tile.position.set(x, -0.025, z);
      tile.visible = false;

      scene.add(tile);
      grassTiles.push(tile);
    }
  }

  gridHelper = new THREE.GridHelper(
    GRID_SIZE * TILE_SIZE,
    GRID_SIZE,
    0x000000,
    0x000000
  );
  gridHelper.position.y = 0.001;
  gridHelper.name = "gridHelper";
  scene.add(gridHelper);

  return grassTiles;
}

export function getGridHelper() {
  return gridHelper;
}

export function getGrassTiles() {
  return grassTiles;
}

export function getTargetTiles(tile, rotation, currentType, category = "house") {
  let targetTiles = [tile];
  
  if (category === "house") {
    if (currentType === 3) {
      const clickedX = tile.position.x;
      const clickedZ = tile.position.z;
      
      let nextTile1, nextTile2;
      if (rotation === 0) {
        nextTile1 = grassTiles.find(
          (t) =>
            Math.abs(t.position.x - (clickedX + TILE_SIZE)) < 0.1 &&
            Math.abs(t.position.z - clickedZ) < 0.1
        );
        nextTile2 = grassTiles.find(
          (t) =>
            Math.abs(t.position.x - (clickedX + 2 * TILE_SIZE)) < 0.1 &&
            Math.abs(t.position.z - clickedZ) < 0.1
        );
      } else if (rotation === 90) {
        nextTile1 = grassTiles.find(
          (t) =>
            Math.abs(t.position.x - clickedX) < 0.1 &&
            Math.abs(t.position.z - (clickedZ + TILE_SIZE)) < 0.1
        );
        nextTile2 = grassTiles.find(
          (t) =>
            Math.abs(t.position.x - clickedX) < 0.1 &&
            Math.abs(t.position.z - (clickedZ + 2 * TILE_SIZE)) < 0.1
        );
      }

      if (nextTile1 && nextTile2) {
        targetTiles = [tile, nextTile1, nextTile2];
      }
    }
  } else if (category === "energy") {
    if (currentType === 1 || currentType === 2) {
      const clickedX = tile.position.x;
      const clickedZ = tile.position.z;
      
      const tiles = [];
      
      if (rotation === 0) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      } else if (rotation === 90) {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 3; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      }
      
      if (tiles.length > 0) {
        targetTiles = tiles;
      }
    }
  } else if (category === "entertainment") {
    if (currentType === 2) {
      const clickedX = tile.position.x;
      const clickedZ = tile.position.z;
      
      const tiles = [];
      
      if (rotation === 0) {
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 3; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      } else if (rotation === 90) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 4; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      } else if (rotation === 180) {
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 3; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      } else if (rotation === 270) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 4; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      }
      
      if (tiles.length > 0) {
        targetTiles = tiles;
      }
    }
  } else if (category === "store") {
  } else if (category === "facilities") {
    if (currentType === 1) {
      const clickedX = tile.position.x;
      const clickedZ = tile.position.z;
      
      const tiles = [];
      
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const foundTile = grassTiles.find(
            (t) =>
              Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
              Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
          );
          if (foundTile) tiles.push(foundTile);
        }
      }
      
      if (tiles.length > 0) {
        targetTiles = tiles;
      }
    } else if (currentType === 2 || currentType === 3 || currentType === 4 || currentType === 5) {
      const clickedX = tile.position.x;
      const clickedZ = tile.position.z;
      
      const tiles = [];
      
      if (rotation === 0) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      } else if (rotation === 90) {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 3; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      } else if (rotation === 180) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      } else if (rotation === 270) {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 3; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      }
      
      if (tiles.length > 0) {
        targetTiles = tiles;
      }
    }
  } else if (category === "factory") {
    if (currentType === 1) {
      const clickedX = tile.position.x;
      const clickedZ = tile.position.z;
      
      const tiles = [];
      
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const foundTile = grassTiles.find(
            (t) =>
              Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
              Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
          );
          if (foundTile) tiles.push(foundTile);
        }
      }
      
      if (tiles.length > 0) {
        targetTiles = tiles;
      }
    } else if (currentType === 2) {
      const clickedX = tile.position.x;
      const clickedZ = tile.position.z;
      
      const tiles = [];
      
      if (rotation === 0) {
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      } else if (rotation === 90) {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 3; j++) {
            const foundTile = grassTiles.find(
              (t) =>
                Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
                Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
            );
            if (foundTile) tiles.push(foundTile);
          }
        }
      }
      
      if (tiles.length > 0) {
        targetTiles = tiles;
      }
    } else if (currentType === 3) {
      const clickedX = tile.position.x;
      const clickedZ = tile.position.z;
      
      const tiles = [];
      
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const foundTile = grassTiles.find(
            (t) =>
              Math.abs(t.position.x - (clickedX + i * TILE_SIZE)) < 0.1 &&
              Math.abs(t.position.z - (clickedZ + j * TILE_SIZE)) < 0.1
          );
          if (foundTile) tiles.push(foundTile);
        }
      }
      
      if (tiles.length > 0) {
        targetTiles = tiles;
      }
    }
  }

  return targetTiles;
}
