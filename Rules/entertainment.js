import { ENTERTAINMENT_TYPES } from '../city/utils/constants.js';
import { addHappiness, removeHappiness } from './cityStats.js';

const ENTERTAINMENT_HAPPINESS = {
  [ENTERTAINMENT_TYPES.SMALL_PARK]: 100,
  [ENTERTAINMENT_TYPES.STADIUM]: 10000,
};

const entertainmentBuildings = new Map();

export function initializeEntertainment(entertainment, entertainmentType) {
  const happiness = ENTERTAINMENT_HAPPINESS[entertainmentType];
  entertainmentBuildings.set(entertainment, {
    entertainmentType,
    happiness,
  });
  
  entertainment.userData.entertainmentData = entertainmentBuildings.get(entertainment);
  addHappiness(happiness);
}

export function removeEntertainment(entertainment) {
  const data = entertainmentBuildings.get(entertainment);
  if (data) {
    removeHappiness(data.happiness);
    entertainmentBuildings.delete(entertainment);
  }
}

export function getAllEntertainmentBuildings() {
  return Array.from(entertainmentBuildings.keys());
}

