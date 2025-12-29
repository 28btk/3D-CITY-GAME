import * as THREE from "three";

export function setupGame(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  const gridSize = 25;
  const tileSize = 1;
  const halfGrid = (gridSize * tileSize) / 2;

  const grassGeometry = new THREE.BoxGeometry(tileSize, 0.05, tileSize);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const material = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.9,
        metalness: 0.0,
      });

      const tile = new THREE.Mesh(grassGeometry, material);

      const x = i * tileSize - halfGrid + tileSize / 2;
      const z = j * tileSize - halfGrid + tileSize / 2;

      tile.position.set(x, -0.025, z);

      scene.add(tile);
    }
  }

  const gridHelper = new THREE.GridHelper(
    gridSize * tileSize,
    gridSize,
    0x000000,
    0x000000
  );
  gridHelper.position.y = 0.001;
  scene.add(gridHelper);
}
