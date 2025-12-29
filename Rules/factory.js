import { FACTORY_TYPES } from '../city/utils/constants.js';
import { getCoverageTiles, getAllHouses, setFactoryBonus } from './resident.js';
import { clearTileHighlights } from '../city/utils/highlight.js';

const FACTORY_COVERAGE = {
  [FACTORY_TYPES.SMALL_FACTORY]: 1,
  [FACTORY_TYPES.BIG_FACTORY]: 3,
  [FACTORY_TYPES.INDUSTRY]: 7,
};

const FACTORY_BONUS = 50;

const factoryBuildings = new Map();

export function initializeFactory(factory, factoryType, centerTile) {
  const coverage = FACTORY_COVERAGE[factoryType];
  factoryBuildings.set(factory, {
    factoryType,
    coverage,
    centerTile,
    bonusPercent: FACTORY_BONUS,
  });
  
  factory.userData.factoryData = factoryBuildings.get(factory);
  updateFactoryCoverage(factory);
}

export function removeFactory(factory) {
  const data = factoryBuildings.get(factory);
  if (data) {
    clearFactoryCoverage(factory);
    factoryBuildings.delete(factory);
  }
}

function updateFactoryCoverage(factory) {
  const data = factoryBuildings.get(factory);
  if (!data) return;
  
  const coverageTiles = getCoverageTiles(data.centerTile, data.coverage);
  const houses = getAllHouses();
  
  houses.forEach(house => {
    const houseData = house.userData.houseData;
    if (!houseData) return;
    
    const houseTiles = houseData.tiles || [];
    const isCovered = houseTiles.some(tile => coverageTiles.includes(tile));
    
    if (isCovered) {
      const currentBonus = houseData.factoryBonus || 0;
      houseData.factoryBonus = currentBonus + FACTORY_BONUS;
      setFactoryBonus(house, houseData.factoryBonus);
    }
  });
}

function clearFactoryCoverage(factory) {
  const data = factoryBuildings.get(factory);
  if (!data) return;
  
  const coverageTiles = getCoverageTiles(data.centerTile, data.coverage);
  const houses = getAllHouses();
  
  houses.forEach(house => {
    const houseData = house.userData.houseData;
    if (!houseData) return;
    
    const houseTiles = houseData.tiles || [];
    const isCovered = houseTiles.some(tile => coverageTiles.includes(tile));
    
    if (isCovered) {
      houseData.factoryBonus = Math.max(0, (houseData.factoryBonus || 0) - FACTORY_BONUS);
      setFactoryBonus(house, houseData.factoryBonus);
    }
  });
}

export function showFactoryCoverage(factory, scene, clickedTile = null) {
}

export function hideFactoryCoverage(scene) {
  clearTileHighlights(scene);
}

export function getAllFactories() {
  return Array.from(factoryBuildings.keys());
}

export function updateAllFactoryCoverages() {
  factoryBuildings.forEach((data, factory) => {
    updateFactoryCoverage(factory);
  });
}

export function getFactoryInfo(factory) {
  const data = factoryBuildings.get(factory);
  if (!data) return null;
  
  const coverageTiles = getCoverageTiles(data.centerTile, data.coverage);
  const houses = getAllHouses();
  let coveredHouses = 0;
  
  houses.forEach(house => {
    const houseData = house.userData.houseData;
    if (!houseData) return;
    
    const houseTiles = houseData.tiles || [];
    const isCovered = houseTiles.some(tile => coverageTiles.includes(tile));
    
    if (isCovered) {
      coveredHouses++;
    }
  });
  
  return {
    factoryType: data.factoryType,
    coverage: data.coverage,
    bonusPercent: FACTORY_BONUS,
    coveredHouses: coveredHouses,
  };
}

