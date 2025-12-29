import * as THREE from "three";
import { TILE_SIZE } from "./constants.js";

let tileHighlights = [];

export function highlightTiles(tiles, scene, color = 0x3b82f6, opacity = 0.7) {
  clearTileHighlights(scene);
  
  if (!tiles || tiles.length === 0) {
    return;
  }
  
  if (!scene) {
    return;
  }
  
  tiles.forEach((tile) => {
    const highlightGeometry = new THREE.PlaneGeometry(TILE_SIZE * 0.99, TILE_SIZE * 0.99);
    const highlightMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });
    
    const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlight.rotation.x = -Math.PI / 2;
    highlight.position.set(tile.position.x, 0.3, tile.position.z);
    highlight.renderOrder = 10000;
    highlight.frustumCulled = false;
    highlight.visible = true;
    highlight.name = 'coverage-highlight';
    
    scene.add(highlight);
    tileHighlights.push(highlight);
    
    const boxGeometry = new THREE.BoxGeometry(TILE_SIZE * 0.98, 0.05, TILE_SIZE * 0.98);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    });
    
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(tile.position.x, 0.3, tile.position.z);
    box.renderOrder = 10001;
    box.frustumCulled = false;
    box.visible = true;
    box.name = 'coverage-box';
    
    scene.add(box);
    tileHighlights.push(box);
  });
}

export function clearTileHighlights(scene) {
  tileHighlights.forEach((highlight) => {
    if (highlight && highlight.parent === scene) {
      scene.remove(highlight);
      if (highlight.geometry) highlight.geometry.dispose();
      if (highlight.material) highlight.material.dispose();
    }
  });
  tileHighlights = [];
}

