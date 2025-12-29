import { ENERGY_TYPES, ENTERTAINMENT_TYPES, FACILITIES_TYPES, FACTORY_TYPES, HOUSE_TYPES, STORE_TYPES } from '../city/utils/constants.js';

const ENERGY_PRICES = {
  [ENERGY_TYPES.NUCLEAR]: 1000,
  [ENERGY_TYPES.THERMAL]: 200,
  [ENERGY_TYPES.WIND]: 10,
};

const ENTERTAINMENT_PRICES = {
  [ENTERTAINMENT_TYPES.SMALL_PARK]: 10,
  [ENTERTAINMENT_TYPES.STADIUM]: 500,
};

const FACILITIES_PRICES = {
  [FACILITIES_TYPES.BANK]: 500,
  [FACILITIES_TYPES.FIRE_STATION]: 100,
  [FACILITIES_TYPES.HOSPITAL]: 100,
  [FACILITIES_TYPES.POLICE_STATION]: 100,
  [FACILITIES_TYPES.SCHOOL]: 100,
};

const FACTORY_PRICES = {
  [FACTORY_TYPES.SMALL_FACTORY]: 100,
  [FACTORY_TYPES.BIG_FACTORY]: 300,
  [FACTORY_TYPES.INDUSTRY]: 900,
};

const HOUSE_PRICES = {
  [HOUSE_TYPES.AMERICAN]: 100,
  [HOUSE_TYPES.TWO_STORY]: 300,
  [HOUSE_TYPES.MODERN]: 700,
};

const STORE_PRICES = {
  [STORE_TYPES.CONVENIENT_STORE]: 200,
  [STORE_TYPES.KOREAN_BAKERY]: 100,
};

export const BUILDING_PRICES = {
  ...ENERGY_PRICES,
  ...ENTERTAINMENT_PRICES,
  ...FACILITIES_PRICES,
  ...FACTORY_PRICES,
  ...HOUSE_PRICES,
  ...STORE_PRICES,
};

export function getBuildingPrice(buildingType, buildingCategory) {
  if (buildingCategory === 'house') {
    return HOUSE_PRICES[buildingType] || 0;
  } else if (buildingCategory === 'energy') {
    return ENERGY_PRICES[buildingType] || 0;
  } else if (buildingCategory === 'entertainment') {
    return ENTERTAINMENT_PRICES[buildingType] || 0;
  } else if (buildingCategory === 'facilities') {
    return FACILITIES_PRICES[buildingType] || 0;
  } else if (buildingCategory === 'factory') {
    return FACTORY_PRICES[buildingType] || 0;
  } else if (buildingCategory === 'store') {
    return STORE_PRICES[buildingType] || 0;
  }
  return 0;
}

export function initializePriceDisplays() {
  const houseButtons = document.querySelectorAll('[data-house-height]');
  houseButtons.forEach(button => {
    const height = parseInt(button.getAttribute('data-house-height'));
    const price = HOUSE_PRICES[height];
    if (price !== undefined) {
      const priceSpan = document.createElement('span');
      priceSpan.className = 'building-price';
      priceSpan.textContent = `$${price}`;
      button.appendChild(priceSpan);
    }
  });

  const energyButtons = document.querySelectorAll('[data-energy-type]');
  energyButtons.forEach(button => {
    const type = parseInt(button.getAttribute('data-energy-type'));
    const price = ENERGY_PRICES[type];
    if (price !== undefined) {
      const priceSpan = document.createElement('span');
      priceSpan.className = 'building-price';
      priceSpan.textContent = `$${price}`;
      button.appendChild(priceSpan);
    }
  });

  const entertainmentButtons = document.querySelectorAll('[data-entertainment-type]');
  entertainmentButtons.forEach(button => {
    const type = parseInt(button.getAttribute('data-entertainment-type'));
    const price = ENTERTAINMENT_PRICES[type];
    if (price !== undefined) {
      const priceSpan = document.createElement('span');
      priceSpan.className = 'building-price';
      priceSpan.textContent = `$${price}`;
      button.appendChild(priceSpan);
    }
  });

  const facilitiesButtons = document.querySelectorAll('[data-facilities-type]');
  facilitiesButtons.forEach(button => {
    const type = parseInt(button.getAttribute('data-facilities-type'));
    const price = FACILITIES_PRICES[type];
    if (price !== undefined) {
      const priceSpan = document.createElement('span');
      priceSpan.className = 'building-price';
      priceSpan.textContent = `$${price}`;
      button.appendChild(priceSpan);
    }
  });

  const factoryButtons = document.querySelectorAll('[data-factory-type]');
  factoryButtons.forEach(button => {
    const type = parseInt(button.getAttribute('data-factory-type'));
    const price = FACTORY_PRICES[type];
    if (price !== undefined) {
      const priceSpan = document.createElement('span');
      priceSpan.className = 'building-price';
      priceSpan.textContent = `$${price}`;
      button.appendChild(priceSpan);
    }
  });

  const storeButtons = document.querySelectorAll('[data-store-type]');
  storeButtons.forEach(button => {
    const type = parseInt(button.getAttribute('data-store-type'));
    const price = STORE_PRICES[type];
    if (price !== undefined) {
      const priceSpan = document.createElement('span');
      priceSpan.className = 'building-price';
      priceSpan.textContent = `$${price}`;
      button.appendChild(priceSpan);
    }
  });
}
