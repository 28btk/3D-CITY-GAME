import { ROTATION, HOUSE_TYPES, ENERGY_TYPES, ENTERTAINMENT_TYPES, STORE_TYPES, FACILITIES_TYPES, FACTORY_TYPES } from "./constants.js";

let currentRotation = 0;

export function rotateObject(currentType, selectedTile, callbacks, category = "house") {
  if (category === "house") {
    if (currentType === HOUSE_TYPES.MODERN) {
      currentRotation = currentRotation === 0 ? 90 : 0;
    } else {
      currentRotation = (currentRotation + 90) % 360;
    }
  } else if (category === "energy") {
    if (currentType === ENERGY_TYPES.NUCLEAR || currentType === ENERGY_TYPES.THERMAL) {
      currentRotation = currentRotation === 0 ? 90 : 0;
    } else if (currentType === ENERGY_TYPES.WIND) {
      currentRotation = (currentRotation + 90) % 360;
    }
  } else if (category === "entertainment") {
    if (currentType === ENTERTAINMENT_TYPES.SMALL_PARK) {
      currentRotation = (currentRotation + 90) % 360;
    } else if (currentType === ENTERTAINMENT_TYPES.STADIUM) {
      currentRotation = (currentRotation + 90) % 360;
    }
  } else if (category === "store") {
    currentRotation = (currentRotation + 90) % 360;
  } else if (category === "facilities") {
    if (currentType === FACILITIES_TYPES.BANK) {
      currentRotation = (currentRotation + 90) % 360;
    } else if (currentType === FACILITIES_TYPES.FIRE_STATION || currentType === FACILITIES_TYPES.HOSPITAL || currentType === FACILITIES_TYPES.POLICE_STATION || currentType === FACILITIES_TYPES.SCHOOL) {
      currentRotation = currentRotation === 0 ? 90 : 0;
    }
  } else if (category === "factory") {
    if (currentType === FACTORY_TYPES.SMALL_FACTORY || currentType === FACTORY_TYPES.INDUSTRY) {
      currentRotation = (currentRotation + 90) % 360;
    } else if (currentType === FACTORY_TYPES.BIG_FACTORY) {
      currentRotation = currentRotation === 0 ? 90 : 0;
    }
  }
  
  if (callbacks && callbacks.onRotate) {
    callbacks.onRotate(currentRotation);
  }

  return currentRotation;
}

export function getRotation() {
  return currentRotation;
}

export function setRotation(rotation) {
  currentRotation = rotation;
}

export function resetRotation() {
  currentRotation = 0;
}

