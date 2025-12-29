import { getBuildingPrice, BUILDING_PRICES } from './buildingPrices.js';
import { canAfford, spendMoney } from './currency.js';
import { initializeHouse, removeHouse } from './resident.js';
import { initializeEnergy, removeEnergy } from './energy.js';
import { initializeEntertainment, removeEntertainment } from './entertainment.js';
import { initializeStore, removeStore } from './store.js';
import { initializeFacility, removeFacility } from './facilities.js';
import { initializeFactory, removeFactory } from './factory.js';
import { HOUSE_TYPES, ENERGY_TYPES, ENTERTAINMENT_TYPES, STORE_TYPES, FACILITIES_TYPES, FACTORY_TYPES } from '../city/utils/constants.js';

export function canBuildBuilding(buildingType, buildingCategory) {
  const price = getBuildingPrice(buildingType, buildingCategory);
  return canAfford(price);
}

export function buildBuildingWithRules(building, buildingType, buildingCategory, tiles, centerTile) {
  const price = getBuildingPrice(buildingType, buildingCategory);
  
  if (!spendMoney(price)) {
    return false;
  }
  
  if (buildingCategory === 'house') {
    initializeHouse(building, buildingType, tiles);
  } else if (buildingCategory === 'energy') {
    initializeEnergy(building, buildingType);
  } else if (buildingCategory === 'entertainment') {
    initializeEntertainment(building, buildingType);
  } else if (buildingCategory === 'store') {
    initializeStore(building, buildingType, centerTile || tiles[0]);
  } else if (buildingCategory === 'facilities') {
    initializeFacility(building, buildingType);
  } else if (buildingCategory === 'factory') {
    initializeFactory(building, buildingType, centerTile || tiles[0]);
  }
  
  return true;
}

export function removeBuildingWithRules(building, buildingCategory) {
  if (buildingCategory === 'house') {
    removeHouse(building);
  } else if (buildingCategory === 'energy') {
    removeEnergy(building);
  } else if (buildingCategory === 'entertainment') {
    removeEntertainment(building);
  } else if (buildingCategory === 'store') {
    removeStore(building);
  } else if (buildingCategory === 'facilities') {
    removeFacility(building);
  } else if (buildingCategory === 'factory') {
    removeFactory(building);
  }
}

