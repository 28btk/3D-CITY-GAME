import { loadAllHouseModels } from "./city/house.js";
import { loadAllEnergyModels } from "./city/energy.js";
import { loadAllEntertainmentModels } from "./city/entertainment.js";
import { loadAllStoreModels } from "./city/store.js";
import { loadAllFacilitiesModels } from "./city/facilities.js";
import { loadAllFactoryModels } from "./city/factory.js";
import { loadAllVehicleModels } from "./city/vehicles.js";
import { setupCameraButton } from "./city/utils/ui.js";
import { setupScene } from "./scene/setup.js";
import { loadIsland } from "./scene/environment.js";
import { setupBuildModeHandlers } from "./ui/buildModeHandlers.js";
import { setupClickHandlers } from "./ui/clickHandlers.js";
import { setupAnimationLoop } from "./game/animation.js";
import { getUIElements } from "./city/utils/ui.js";
import { initializeRules } from "./Rules/integration.js";

loadAllHouseModels();
loadAllEnergyModels();
loadAllEntertainmentModels();
loadAllStoreModels();
loadAllFacilitiesModels();
loadAllFactoryModels();
loadAllVehicleModels();

const {
  scene,
  renderer,
  camera,
  controls,
  grassTiles,
  setCameraViewMode,
  getCameraViewMode,
} = setupScene();

setupCameraButton(setCameraViewMode, getCameraViewMode);

loadIsland(scene);

setupBuildModeHandlers(scene, getUIElements());

setupClickHandlers(scene, renderer, camera, grassTiles);

setupAnimationLoop(renderer, scene, camera, controls, grassTiles);

console.log('Scene setup complete, initializing Rules...');
initializeRules();
console.log('Rules initialized');
