import { HOUSE_TYPES } from '../city/utils/constants.js';
import { addPopulation, removePopulation, addElectricityConsumption, removeElectricityConsumption } from './cityStats.js';
import { TILE_SIZE } from '../city/utils/constants.js';
import { getGrassTiles } from '../city/utils/grid.js';
import { updateAllFactoryCoverages } from './factory.js';
import { updateAllStoreCoverages } from './store.js';

const RESIDENT_CAPACITIES = {
  [HOUSE_TYPES.AMERICAN]: 6,
  [HOUSE_TYPES.TWO_STORY]: 15,
  [HOUSE_TYPES.MODERN]: 50,
};

const houseData = new Map();

export function initializeHouse(house, houseType, tiles) {
  const data = {
    houseType,
    civilians: 2,
    maxCapacity: RESIDENT_CAPACITIES[houseType],
    tiles: tiles,
    daysSinceBuild: 0, 
    factoryBonus: 0,
    storeBonus: 0,
  };
  
  houseData.set(house, data);
  house.userData.houseData = data;
  
  addPopulation(2);
  addElectricityConsumption(2 * 5000);
  
  updateAllFactoryCoverages();
  updateAllStoreCoverages();
}

export function removeHouse(house) {
  const data = houseData.get(house);
  if (data) {
    removePopulation(data.civilians);
    removeElectricityConsumption(data.civilians * 5000);
    houseData.delete(house);
  }
}

export function updateHousePopulation() {
  houseData.forEach((data, house) => {
    const targetCivilians = Math.min(2 + data.daysSinceBuild, data.maxCapacity);
    
    if (targetCivilians !== data.civilians) {
      const oldCivilians = data.civilians;
      data.civilians = targetCivilians;
      
      const diff = data.civilians - oldCivilians;
      if (diff > 0) {
        addPopulation(diff);
        addElectricityConsumption(diff * 5000);
      } else if (diff < 0) {
        removePopulation(-diff);
        removeElectricityConsumption(-diff * 5000);
      }
    }
  });
}

export function incrementHouseDays() {
  houseData.forEach((data) => {
    data.daysSinceBuild += 1;
  });
  updateHousePopulation();
}

export function setFactoryBonus(house, bonusPercent) {
  const data = houseData.get(house);
  if (data) {
    data.factoryBonus = bonusPercent;
  }
}

export function setStoreBonus(house, bonusPercent) {
  const data = houseData.get(house);
  if (data) {
    data.storeBonus = bonusPercent;
  }
}

export function getHouseData(house) {
  return houseData.get(house);
}

export function getHouseInfo(house) {
  const data = houseData.get(house);
  if (!data) return null;
  
  const baseCivilians = data.civilians;
  const bonusCivilians = Math.floor(baseCivilians * (data.storeBonus / 100));
  const totalCivilians = baseCivilians + bonusCivilians;
  
  const baseMoneyPerDay = totalCivilians * 5;
  const bonusMoney = Math.floor(baseMoneyPerDay * (data.factoryBonus / 100));
  const totalMoneyEarned = baseMoneyPerDay + bonusMoney;
  
  const electricityConsumption = totalCivilians * 5000;
  
  return {
    civilians: totalCivilians,
    bonusMoney,
    bonusCivilians,
    electricityConsumption,
    totalMoneyEarned,
    factoryBonus: data.factoryBonus,
    storeBonus: data.storeBonus,
  };
}

export function getAllHouses() {
  return Array.from(houseData.keys());
}

export function getHousesInTiles(tiles) {
  const houses = new Set();
  tiles.forEach(tile => {
    if (tile.userData.house) {
      houses.add(tile.userData.house);
    }
  });
  return Array.from(houses);
}

export function getCoverageTiles(centerTile, radius) {
  const grassTiles = getGrassTiles();
  const centerX = centerTile.position.x;
  const centerZ = centerTile.position.z;
  const coverageTiles = [];
  
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const chebyshevDistance = Math.max(Math.abs(dx), Math.abs(dz));
      if (chebyshevDistance <= radius) {
        const targetX = centerX + dx * TILE_SIZE;
        const targetZ = centerZ + dz * TILE_SIZE;
        
        const tile = grassTiles.find(t => 
          Math.abs(t.position.x - targetX) < 0.1 &&
          Math.abs(t.position.z - targetZ) < 0.1
        );
        
        if (tile) {
          coverageTiles.push(tile);
        }
      }
    }
  }
  
  return coverageTiles;
}

