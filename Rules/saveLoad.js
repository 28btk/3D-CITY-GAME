import { setCityMoney, getCityMoney, isCreativeMode } from './currency.js';
import { 
  getTotalElectricityProduction, 
  getTotalElectricityConsumption,
  getTotalPopulation,
  getTotalHappiness,
  getTotalHappinessNeeded,
  getTotalSafeness,
  getTotalSafenessNeeded,
  setTotalElectricityProduction,
  setTotalElectricityConsumption,
  setTotalPopulation,
  setTotalHappiness,
  setTotalHappinessNeeded,
  setTotalSafeness,
  setTotalSafenessNeeded,
} from './cityStats.js';

export function saveGameState() {
  if (isCreativeMode()) {
    return null;
  }
  
  const gameState = {
    money: getCityMoney(),
    electricityProduction: getTotalElectricityProduction(),
    electricityConsumption: getTotalElectricityConsumption(),
    population: getTotalPopulation(),
    happiness: getTotalHappiness(),
    happinessNeeded: getTotalHappinessNeeded(),
    safeness: getTotalSafeness(),
    safenessNeeded: getTotalSafenessNeeded(),
    timestamp: Date.now(),
    version: '1.0',
  };
  
  return JSON.stringify(gameState, null, 2);
}

export function downloadSaveFile() {
  if (isCreativeMode()) {
    alert('Cannot save in Creative Mode!');
    return;
  }
  
  const gameStateJson = saveGameState();
  if (!gameStateJson) {
    alert('Failed to save game!');
    return;
  }
  
  try {
    const blob = new Blob([gameStateJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `city-builder-save-${Date.now()}.json`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    
    alert('Game saved! Check your downloads folder for the save file.');
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Error downloading file. Check console for details.');
  }
}

export function loadGameState(gameStateJson) {
  if (!gameStateJson) {
    return false;
  }
  
  try {
    const gameState = typeof gameStateJson === 'string' ? JSON.parse(gameStateJson) : gameStateJson;
    
    setCityMoney(gameState.money || 1000);
    setTotalElectricityProduction(gameState.electricityProduction || 0);
    setTotalElectricityConsumption(gameState.electricityConsumption || 0);
    setTotalPopulation(gameState.population || 0);
    setTotalHappiness(gameState.happiness || 0);
    setTotalHappinessNeeded(gameState.happinessNeeded || 0);
    setTotalSafeness(gameState.safeness || 0);
    setTotalSafenessNeeded(gameState.safenessNeeded || 0);
    
    return true;
  } catch (error) {
    console.error('Error loading game state:', error);
    alert('Error loading game file! Please check the file format.');
    return false;
  }
}

