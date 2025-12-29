export function setupCameraButton(setCameraViewMode, getCameraViewMode) {
  const cameraButton = document.getElementById("camera-toggle");
  if (cameraButton) {
    cameraButton.addEventListener("click", () => {
      const nextState = !getCameraViewMode();
      setCameraViewMode(nextState);

      if (nextState) {
        cameraButton.classList.add("toolbar__button--active");
      } else {
        cameraButton.classList.remove("toolbar__button--active");
      }
    });
  }
}

export function clearHouseOptionActive() {
  const houseOptionButtons = document.querySelectorAll("[data-house-height]");
  houseOptionButtons.forEach((btn) =>
    btn.classList.remove("toolbar__submenu-button--active")
  );
}

export function clearEnergyOptionActive() {
  const energyOptionButtons = document.querySelectorAll("[data-energy-type]");
  energyOptionButtons.forEach((btn) =>
    btn.classList.remove("toolbar__submenu-button--active")
  );
}

export function clearEntertainmentOptionActive() {
  const entertainmentOptionButtons = document.querySelectorAll("[data-entertainment-type]");
  entertainmentOptionButtons.forEach((btn) =>
    btn.classList.remove("toolbar__submenu-button--active")
  );
}

export function clearStoreOptionActive() {
  const storeOptionButtons = document.querySelectorAll("[data-store-type]");
  storeOptionButtons.forEach((btn) =>
    btn.classList.remove("toolbar__submenu-button--active")
  );
}

export function clearFacilitiesOptionActive() {
  const facilitiesOptionButtons = document.querySelectorAll("[data-facilities-type]");
  facilitiesOptionButtons.forEach((btn) =>
    btn.classList.remove("toolbar__submenu-button--active")
  );
}

export function clearFactoryOptionActive() {
  const factoryOptionButtons = document.querySelectorAll("[data-factory-type]");
  factoryOptionButtons.forEach((btn) =>
    btn.classList.remove("toolbar__submenu-button--active")
  );
}

export function getUIElements() {
  return {
    buildRoadButton: document.getElementById("build-road-toggle"),
    undoRoadButton: document.getElementById("undo-road"),
    buildHouseButton: document.getElementById("build-house-toggle"),
    buildHouseGroup: document.getElementById("build-house-toggle")?.closest(".toolbar__group"),
    houseOptionButtons: document.querySelectorAll("[data-house-height]"),
    buildEnergyButton: document.getElementById("build-energy-toggle"),
    buildEnergyGroup: document.getElementById("build-energy-toggle")?.closest(".toolbar__group"),
    energyOptionButtons: document.querySelectorAll("[data-energy-type]"),
    buildEntertainmentButton: document.getElementById("build-entertainment-toggle"),
    buildEntertainmentGroup: document.getElementById("build-entertainment-toggle")?.closest(".toolbar__group"),
    entertainmentOptionButtons: document.querySelectorAll("[data-entertainment-type]"),
    buildStoreButton: document.getElementById("build-store-toggle"),
    buildStoreGroup: document.getElementById("build-store-toggle")?.closest(".toolbar__group"),
    storeOptionButtons: document.querySelectorAll("[data-store-type]"),
    buildFacilitiesButton: document.getElementById("build-facilities-toggle"),
    buildFacilitiesGroup: document.getElementById("build-facilities-toggle")?.closest(".toolbar__group"),
    facilitiesOptionButtons: document.querySelectorAll("[data-facilities-type]"),
    buildFactoryButton: document.getElementById("build-factory-toggle"),
    buildFactoryGroup: document.getElementById("build-factory-toggle")?.closest(".toolbar__group"),
    factoryOptionButtons: document.querySelectorAll("[data-factory-type]"),
  };
}

