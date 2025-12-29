import { STORE_TYPES } from '../city/utils/constants.js';
import { getCoverageTiles, getAllHouses, setStoreBonus } from './resident.js';
import { clearTileHighlights } from '../city/utils/highlight.js';

const STORE_COVERAGE = {
  [STORE_TYPES.CONVENIENT_STORE]: 3,
  [STORE_TYPES.KOREAN_BAKERY]: 1,
};

const STORE_BONUS = 20;

const storeBuildings = new Map();

export function initializeStore(store, storeType, centerTile) {
  const coverage = STORE_COVERAGE[storeType];
  storeBuildings.set(store, {
    storeType,
    coverage,
    centerTile,
    bonusPercent: STORE_BONUS,
  });
  
  store.userData.storeData = storeBuildings.get(store);
  updateStoreCoverage(store);
}

export function removeStore(store) {
  const data = storeBuildings.get(store);
  if (data) {
    clearStoreCoverage(store);
    storeBuildings.delete(store);
  }
}

function updateStoreCoverage(store) {
  const data = storeBuildings.get(store);
  if (!data) return;
  
  const coverageTiles = getCoverageTiles(data.centerTile, data.coverage);
  const houses = getAllHouses();
  
  houses.forEach(house => {
    const houseData = house.userData.houseData;
    if (!houseData) return;
    
    const houseTiles = houseData.tiles || [];
    const isCovered = houseTiles.some(tile => coverageTiles.includes(tile));
    
    if (isCovered) {
      const currentBonus = houseData.storeBonus || 0;
      houseData.storeBonus = currentBonus + STORE_BONUS;
      setStoreBonus(house, houseData.storeBonus);
    }
  });
}

function clearStoreCoverage(store) {
  const data = storeBuildings.get(store);
  if (!data) return;
  
  const coverageTiles = getCoverageTiles(data.centerTile, data.coverage);
  const houses = getAllHouses();
  
  houses.forEach(house => {
    const houseData = house.userData.houseData;
    if (!houseData) return;
    
    const houseTiles = houseData.tiles || [];
    const isCovered = houseTiles.some(tile => coverageTiles.includes(tile));
    
    if (isCovered) {
      houseData.storeBonus = Math.max(0, (houseData.storeBonus || 0) - STORE_BONUS);
      setStoreBonus(house, houseData.storeBonus);
    }
  });
}

export function showStoreCoverage(store, scene, clickedTile = null) {
}

export function hideStoreCoverage(scene) {
  clearTileHighlights(scene);
}

export function getAllStores() {
  return Array.from(storeBuildings.keys());
}

export function updateAllStoreCoverages() {
  storeBuildings.forEach((data, store) => {
    updateStoreCoverage(store);
  });
}

export function getStoreInfo(store) {
  const data = storeBuildings.get(store);
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
    storeType: data.storeType,
    coverage: data.coverage,
    bonusPercent: STORE_BONUS,
    coveredHouses: coveredHouses,
  };
}

