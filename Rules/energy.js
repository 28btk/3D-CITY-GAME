import { ENERGY_TYPES } from '../city/utils/constants.js';
import { addElectricityProduction, removeElectricityProduction } from './cityStats.js';
import { getElectricityDeficitPercent } from './cityStats.js';

const ENERGY_PRODUCTION = {
  [ENERGY_TYPES.NUCLEAR]: 100000000,
  [ENERGY_TYPES.THERMAL]: 1000000,
  [ENERGY_TYPES.WIND]: 50000,
};

const energyBuildings = new Map();

export function initializeEnergy(energy, energyType) {
  const production = ENERGY_PRODUCTION[energyType];
  energyBuildings.set(energy, {
    energyType,
    production,
  });
  
  energy.userData.energyData = energyBuildings.get(energy);
  addElectricityProduction(production);
}

export function removeEnergy(energy) {
  const data = energyBuildings.get(energy);
  if (data) {
    removeElectricityProduction(data.production);
    energyBuildings.delete(energy);
  }
}

export function getElectricityDeficitHappinessReduction() {
  return getElectricityDeficitPercent();
}

export function getAllEnergyBuildings() {
  return Array.from(energyBuildings.keys());
}

