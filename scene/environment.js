import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.164/examples/jsm/loaders/GLTFLoader.js";
import { GRID_SIZE, TILE_SIZE } from "../city/utils/constants.js";

export function loadIsland(scene) {
  const islandLoader = new GLTFLoader();
  let islandModel = null;

  islandLoader.load(
    "https://res.cloudinary.com/dca7qiz5w/image/upload/v1767021098/low_poly_island_lgbpov.glb",
    (gltf) => {
      const island = gltf.scene;
      
      const gridWidth = GRID_SIZE * TILE_SIZE;
      
      const box = new THREE.Box3().setFromObject(island);
      const islandBoxSize = box.getSize(new THREE.Vector3());
      const maxIslandSize = Math.max(islandBoxSize.x, islandBoxSize.z);
      
      const baseScale = (gridWidth * 1.2) / maxIslandSize;
      const scale = baseScale * 2.25;
      island.scale.set(scale, scale, scale);
      
      island.position.set(0, -5.35, 2.0);
      
      island.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      scene.add(island);
      islandModel = island;
    },
    undefined,
    (error) => {
      console.error("Lỗi load hòn đảo", error);
    }
  );

  return islandModel;
}

