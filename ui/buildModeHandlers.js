import {
  removePreviewHouse, clearSelection as clearHouseSelection,
} from "../city/house.js";
import {
  removePreviewEnergy, clearSelection as clearEnergySelection,
} from "../city/energy.js";
import {
  removePreviewEntertainment, clearSelection as clearEntertainmentSelection,
} from "../city/entertainment.js";
import {
  removePreviewStore, clearSelection as clearStoreSelection,
} from "../city/store.js";
import {
  removePreviewFacilities, clearSelection as clearFacilitiesSelection,
} from "../city/facilities.js";
import {
  removePreviewFactory, clearSelection as clearFactorySelection,
} from "../city/factory.js";
import { undoAction } from "../undo.js";
import { resetRotation, getRotation, setRotation } from "../city/utils/rotation.js";
import { 
  clearHouseOptionActive, 
  clearEnergyOptionActive, 
  clearEntertainmentOptionActive, 
  clearStoreOptionActive, 
  clearFacilitiesOptionActive, 
  clearFactoryOptionActive 
} from "../city/utils/ui.js";
import * as State from "../game/state.js";

export function setupBuildModeHandlers(scene, uiElements) {
  const {
    buildRoadButton,
    undoRoadButton,
    buildHouseButton,
    buildHouseGroup,
    houseOptionButtons,
    buildEnergyButton,
    buildEnergyGroup,
    energyOptionButtons,
    buildEntertainmentButton,
    buildEntertainmentGroup,
    entertainmentOptionButtons,
    buildStoreButton,
    buildStoreGroup,
    storeOptionButtons,
    buildFacilitiesButton,
    buildFacilitiesGroup,
    facilitiesOptionButtons,
    buildFactoryButton,
    buildFactoryGroup,
    factoryOptionButtons,
  } = uiElements;

  function clearAllOtherModes() {
    State.setBuildRoadMode(false);
    State.setBuildHouseMode(false);
    State.setBuildEnergyMode(false);
    State.setBuildEntertainmentMode(false);
    State.setBuildStoreMode(false);
    State.setBuildFacilitiesMode(false);
    State.setBuildFactoryMode(false);
    
    buildRoadButton?.classList.remove("toolbar__button--active");
    buildHouseButton?.classList.remove("toolbar__button--active");
    buildHouseGroup?.classList.remove("toolbar__group--open");
    buildEnergyButton?.classList.remove("toolbar__button--active");
    buildEnergyGroup?.classList.remove("toolbar__group--open");
    buildEntertainmentButton?.classList.remove("toolbar__button--active");
    buildEntertainmentGroup?.classList.remove("toolbar__group--open");
    buildStoreButton?.classList.remove("toolbar__button--active");
    buildStoreGroup?.classList.remove("toolbar__group--open");
    buildFacilitiesButton?.classList.remove("toolbar__button--active");
    buildFacilitiesGroup?.classList.remove("toolbar__group--open");
    buildFactoryButton?.classList.remove("toolbar__button--active");
    buildFactoryGroup?.classList.remove("toolbar__group--open");
    
    clearHouseOptionActive();
    clearEnergyOptionActive();
    clearEntertainmentOptionActive();
    clearStoreOptionActive();
    clearFacilitiesOptionActive();
    clearFactoryOptionActive();
    
    removePreviewHouse(scene);
    removePreviewEnergy(scene);
    removePreviewEntertainment(scene);
    removePreviewStore(scene);
    removePreviewFacilities(scene);
    removePreviewFactory(scene);
    
    clearHouseSelection(scene);
    clearEnergySelection(scene);
    clearEntertainmentSelection(scene);
    clearStoreSelection(scene);
    clearFacilitiesSelection(scene);
    clearFactorySelection(scene);
  }

  if (buildRoadButton) {
    buildRoadButton.addEventListener("click", () => {
      const newMode = !State.isBuildRoadMode;
      State.setBuildRoadMode(newMode);

      if (newMode) {
        clearAllOtherModes();
        State.setBuildRoadMode(true);
        buildRoadButton.classList.add("toolbar__button--active");
      } else {
        buildRoadButton.classList.remove("toolbar__button--active");
      }
    });
  }

  if (undoRoadButton) {
    undoRoadButton.addEventListener("click", () => {
      undoAction(scene);
    });
  }

  if (buildHouseButton) {
    buildHouseButton.addEventListener("click", () => {
      const newMode = !State.isBuildHouseMode;
      State.setBuildHouseMode(newMode);
      if (newMode) {
        clearAllOtherModes();
        State.setBuildHouseMode(true);
        buildHouseButton.classList.add("toolbar__button--active");
        buildHouseGroup?.classList.add("toolbar__group--open");
        
        if (!houseOptionButtons.length) return;
        if (
          !Array.from(houseOptionButtons).some((btn) =>
            btn.classList.contains("toolbar__submenu-button--active")
          )
        ) {
          const first = houseOptionButtons[0];
          first.classList.add("toolbar__submenu-button--active");
          State.setCurrentHouseHeight(parseInt(
            first.getAttribute("data-house-height") || "1",
            10
          ));
        }
      } else {
        buildHouseButton.classList.remove("toolbar__button--active");
        buildHouseGroup?.classList.remove("toolbar__group--open");
        removePreviewHouse(scene);
        clearHouseSelection(scene);
        resetRotation();
      }
    });
  }

  houseOptionButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const height = parseInt(btn.getAttribute("data-house-height") || "1", 10);
      State.setCurrentHouseHeight(height);
      State.setBuildHouseMode(true);
      clearAllOtherModes();
      State.setBuildHouseMode(true);
      buildHouseButton?.classList.add("toolbar__button--active");
      buildHouseGroup?.classList.add("toolbar__group--open");

      clearHouseOptionActive();
      btn.classList.add("toolbar__submenu-button--active");
      clearHouseSelection(scene);
      
      if (State.currentHouseHeight === 3) {
        const currentRot = getRotation();
        if (currentRot !== 0 && currentRot !== 90) {
          setRotation(0);
        }
      } else {
        resetRotation();
      }
    });
  });

  if (buildEnergyButton) {
    buildEnergyButton.addEventListener("click", () => {
      const newMode = !State.isBuildEnergyMode;
      State.setBuildEnergyMode(newMode);
      if (newMode) {
        clearAllOtherModes();
        State.setBuildEnergyMode(true);
        buildEnergyButton.classList.add("toolbar__button--active");
        buildEnergyGroup?.classList.add("toolbar__group--open");
        
        if (!energyOptionButtons.length) return;
        if (
          !Array.from(energyOptionButtons).some((btn) =>
            btn.classList.contains("toolbar__submenu-button--active")
          )
        ) {
          const first = energyOptionButtons[0];
          first.classList.add("toolbar__submenu-button--active");
          State.setCurrentEnergyType(parseInt(
            first.getAttribute("data-energy-type") || "1",
            10
          ));
        }
      } else {
        buildEnergyButton.classList.remove("toolbar__button--active");
        buildEnergyGroup?.classList.remove("toolbar__group--open");
        removePreviewEnergy(scene);
        clearEnergySelection(scene);
        resetRotation();
      }
    });
  }

  energyOptionButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const type = parseInt(btn.getAttribute("data-energy-type") || "1", 10);
      State.setCurrentEnergyType(type);
      State.setBuildEnergyMode(true);
      clearAllOtherModes();
      State.setBuildEnergyMode(true);
      buildEnergyButton?.classList.add("toolbar__button--active");
      buildEnergyGroup?.classList.add("toolbar__group--open");

      clearEnergyOptionActive();
      btn.classList.add("toolbar__submenu-button--active");
      clearEnergySelection(scene);
      
      if (State.currentEnergyType === 1 || State.currentEnergyType === 2) {
        const currentRot = getRotation();
        if (currentRot !== 0 && currentRot !== 90) {
          setRotation(0);
        }
      } else {
        resetRotation();
      }
    });
  });

  if (buildEntertainmentButton) {
    buildEntertainmentButton.addEventListener("click", () => {
      const newMode = !State.isBuildEntertainmentMode;
      State.setBuildEntertainmentMode(newMode);
      if (newMode) {
        clearAllOtherModes();
        State.setBuildEntertainmentMode(true);
        buildEntertainmentButton.classList.add("toolbar__button--active");
        buildEntertainmentGroup?.classList.add("toolbar__group--open");
        
        if (!entertainmentOptionButtons.length) return;
        if (
          !Array.from(entertainmentOptionButtons).some((btn) =>
            btn.classList.contains("toolbar__submenu-button--active")
          )
        ) {
          const first = entertainmentOptionButtons[0];
          first.classList.add("toolbar__submenu-button--active");
          State.setCurrentEntertainmentType(parseInt(
            first.getAttribute("data-entertainment-type") || "1",
            10
          ));
        }
      } else {
        buildEntertainmentButton.classList.remove("toolbar__button--active");
        buildEntertainmentGroup?.classList.remove("toolbar__group--open");
        removePreviewEntertainment(scene);
        clearEntertainmentSelection(scene);
        resetRotation();
      }
    });
  }

  entertainmentOptionButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const type = parseInt(btn.getAttribute("data-entertainment-type") || "1", 10);
      State.setCurrentEntertainmentType(type);
      State.setBuildEntertainmentMode(true);
      clearAllOtherModes();
      State.setBuildEntertainmentMode(true);
      buildEntertainmentButton?.classList.add("toolbar__button--active");
      buildEntertainmentGroup?.classList.add("toolbar__group--open");

      clearEntertainmentOptionActive();
      btn.classList.add("toolbar__submenu-button--active");
      clearEntertainmentSelection(scene);
      resetRotation();
    });
  });

  if (buildStoreButton) {
    buildStoreButton.addEventListener("click", () => {
      const newMode = !State.isBuildStoreMode;
      State.setBuildStoreMode(newMode);
      if (newMode) {
        clearAllOtherModes();
        State.setBuildStoreMode(true);
        buildStoreButton.classList.add("toolbar__button--active");
        buildStoreGroup?.classList.add("toolbar__group--open");
        
        if (!storeOptionButtons.length) return;
        if (
          !Array.from(storeOptionButtons).some((btn) =>
            btn.classList.contains("toolbar__submenu-button--active")
          )
        ) {
          const first = storeOptionButtons[0];
          first.classList.add("toolbar__submenu-button--active");
          State.setCurrentStoreType(parseInt(
            first.getAttribute("data-store-type") || "1",
            10
          ));
        }
      } else {
        buildStoreButton.classList.remove("toolbar__button--active");
        buildStoreGroup?.classList.remove("toolbar__group--open");
        removePreviewStore(scene);
        clearStoreSelection(scene);
        resetRotation();
      }
    });
  }

  storeOptionButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const type = parseInt(btn.getAttribute("data-store-type") || "1", 10);
      State.setCurrentStoreType(type);
      State.setBuildStoreMode(true);
      clearAllOtherModes();
      State.setBuildStoreMode(true);
      buildStoreButton?.classList.add("toolbar__button--active");
      buildStoreGroup?.classList.add("toolbar__group--open");

      clearStoreOptionActive();
      btn.classList.add("toolbar__submenu-button--active");
      clearStoreSelection(scene);
      resetRotation();
    });
  });

  if (buildFacilitiesButton) {
    buildFacilitiesButton.addEventListener("click", () => {
      const newMode = !State.isBuildFacilitiesMode;
      State.setBuildFacilitiesMode(newMode);
      if (newMode) {
        clearAllOtherModes();
        State.setBuildFacilitiesMode(true);
        buildFacilitiesButton.classList.add("toolbar__button--active");
        buildFacilitiesGroup?.classList.add("toolbar__group--open");
        
        if (!facilitiesOptionButtons.length) return;
        if (
          !Array.from(facilitiesOptionButtons).some((btn) =>
            btn.classList.contains("toolbar__submenu-button--active")
          )
        ) {
          const first = facilitiesOptionButtons[0];
          first.classList.add("toolbar__submenu-button--active");
          State.setCurrentFacilitiesType(parseInt(
            first.getAttribute("data-facilities-type") || "1",
            10
          ));
        }
      } else {
        buildFacilitiesButton.classList.remove("toolbar__button--active");
        buildFacilitiesGroup?.classList.remove("toolbar__group--open");
        removePreviewFacilities(scene);
        clearFacilitiesSelection(scene);
        resetRotation();
      }
    });
  }

  facilitiesOptionButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const type = parseInt(btn.getAttribute("data-facilities-type") || "1", 10);
      State.setCurrentFacilitiesType(type);
      State.setBuildFacilitiesMode(true);
      clearAllOtherModes();
      State.setBuildFacilitiesMode(true);
      buildFacilitiesButton?.classList.add("toolbar__button--active");
      buildFacilitiesGroup?.classList.add("toolbar__group--open");

      clearFacilitiesOptionActive();
      btn.classList.add("toolbar__submenu-button--active");
      clearFacilitiesSelection(scene);
      resetRotation();
    });
  });

  if (buildFactoryButton) {
    buildFactoryButton.addEventListener("click", () => {
      const newMode = !State.isBuildFactoryMode;
      State.setBuildFactoryMode(newMode);
      if (newMode) {
        clearAllOtherModes();
        State.setBuildFactoryMode(true);
        buildFactoryButton.classList.add("toolbar__button--active");
        buildFactoryGroup?.classList.add("toolbar__group--open");
        
        if (!factoryOptionButtons.length) return;
        if (
          !Array.from(factoryOptionButtons).some((btn) =>
            btn.classList.contains("toolbar__submenu-button--active")
          )
        ) {
          const first = factoryOptionButtons[0];
          first.classList.add("toolbar__submenu-button--active");
          State.setCurrentFactoryType(parseInt(
            first.getAttribute("data-factory-type") || "1",
            10
          ));
        }
      } else {
        buildFactoryButton.classList.remove("toolbar__button--active");
        buildFactoryGroup?.classList.remove("toolbar__group--open");
        removePreviewFactory(scene);
        clearFactorySelection(scene);
        resetRotation();
      }
    });
  }

  factoryOptionButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const type = parseInt(btn.getAttribute("data-factory-type") || "1", 10);
      State.setCurrentFactoryType(type);
      State.setBuildFactoryMode(true);
      clearAllOtherModes();
      State.setBuildFactoryMode(true);
      buildFactoryButton?.classList.add("toolbar__button--active");
      buildFactoryGroup?.classList.add("toolbar__group--open");

      clearFactoryOptionActive();
      btn.classList.add("toolbar__submenu-button--active");
      clearFactorySelection(scene);
      resetRotation();
    });
  });
}

