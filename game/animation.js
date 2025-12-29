import { updateVehicles } from "../city/vehicles.js";

export function setupAnimationLoop(renderer, scene, camera, controls, grassTiles) {
  let lastTime = 0;
  
  function animate(currentTime) {
    if (controls.enabled) {
      controls.update();
    }
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    const rotationSpeed = 0.001;
    
    grassTiles.forEach((tile) => {
      if (tile.userData.energy && tile.userData.energy.userData.isWindTurbine) {
        const windTurbine = tile.userData.energy;
        const bladeGroup = windTurbine.userData.bladeGroup;
        
        if (bladeGroup && bladeGroup !== windTurbine) {
          bladeGroup.rotation.y += rotationSpeed * deltaTime;
        } else if (windTurbine.userData.isWindTurbine && !bladeGroup) {
          console.warn("Wind turbine found but no blade group!");
        }
      }
    });
    
    updateVehicles(deltaTime, scene);

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
}

