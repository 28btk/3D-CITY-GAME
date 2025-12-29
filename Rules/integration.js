import { initializeMoneyDisplay, addMoney, isCreativeMode, getCityMoney } from './currency.js';
import { initializeStatsDisplay, setTotalHappinessNeeded, setGameDay } from './cityStats.js';
import { initializePriceDisplays } from './buildingPrices.js';
import { initializeGameStartUI, isGameStarted } from './gameStart.js';
import { getAllHouses, getHouseInfo, incrementHouseDays } from './resident.js';
import { getElectricityDeficitHappinessReduction } from './energy.js';
import { getHappinessDeficitPercent, getSafenessDeficitPercent } from './cityStats.js';

let gameDay = 0;

export function getGameDay() {
  return gameDay;
}

export function resetGameDay() {
  gameDay = 0;
  setGameDay(0);
}

export function initializeRules() {
  try {
    if (!isGameStarted()) {
      initializeGameStartUI();
    } else {
      initializeMoneyDisplay();
      initializeStatsDisplay();
      initializePriceDisplays();
      
      setupDayCompleteCallback();
      
      setInterval(() => {
        updateHappinessNeeded();
      }, 1000);
    }
  } catch (error) {
    console.error('Error initializing Rules:', error);
  }
}

function updateHappinessNeeded() {
  if (gameDay < 30) {
    setTotalHappinessNeeded(0);
    return;
  }
  
  const houses = getAllHouses();
  let totalNeeded = 0;
  
  houses.forEach(house => {
    const info = getHouseInfo(house);
    if (info) {
      totalNeeded += info.civilians * 10;
    }
  });
  
  setTotalHappinessNeeded(totalNeeded);
}

export function setupDayCompleteCallback() {
  import('../dayNight.js').then(({ setOnDayCompleteCallback }) => {
    setOnDayCompleteCallback(updateMoneyAfterDay);
  }).catch(error => {
    console.error('Error setting up day complete callback:', error);
  });
}

export function updateMoneyAfterDay() {
  if (isCreativeMode) {
    return;
  }
  
  gameDay += 1;
  setGameDay(gameDay);
  
  incrementHouseDays();
  
  updateHappinessNeeded();
  
  const houses = getAllHouses();
  
  let totalMoneyEarned = 0;
  
  houses.forEach((house) => {
    const moneyEarned = getHouseMoneyEarned(house);
    totalMoneyEarned += moneyEarned;
  });
  
  if (totalMoneyEarned > 0) {
    addMoney(totalMoneyEarned);
  }
}

export function getHouseMoneyEarned(house) {
  const info = getHouseInfo(house);
  if (!info) {
    return 0;
  }
  
  const electricityDeficit = getElectricityDeficitHappinessReduction() / 100;
  
  let happinessDeficit = 0;
  let safenessDeficit = 0;
  
  if (gameDay >= 30) {
    happinessDeficit = getHappinessDeficitPercent() / 100;
    safenessDeficit = getSafenessDeficitPercent() / 100;
  }
  
  let moneyEarned = info.totalMoneyEarned;
  
  if (electricityDeficit > 0) {
    moneyEarned *= (1 - electricityDeficit);
  }
  
  if (gameDay >= 30 && happinessDeficit > 0) {
    moneyEarned *= (1 - happinessDeficit);
  }
  
  if (gameDay >= 30 && safenessDeficit > 0) {
    moneyEarned *= (1 - safenessDeficit);
  }
  
  return Math.max(0, moneyEarned);
}

