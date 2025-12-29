import { getCityMoney } from './currency.js';

let totalElectricityProduction = 0;
let totalElectricityConsumption = 0;
let totalPopulation = 0;
let totalHappiness = 0;
let totalHappinessNeeded = 0;
let totalSafeness = 0;
let totalSafenessNeeded = 0;
let currentGameDay = 0;

export function setGameDay(day) {
  currentGameDay = day;
}

export function addHappiness(amount) {
  totalHappiness += amount;
  updateStatsDisplay();
}

export function removeHappiness(amount) {
  totalHappiness = Math.max(0, totalHappiness - amount);
  updateStatsDisplay();
}

export function addSafeness(amount) {
  totalSafeness += amount;
  updateStatsDisplay();
}

export function removeSafeness(amount) {
  totalSafeness = Math.max(0, totalSafeness - amount);
  updateStatsDisplay();
}

export function setTotalSafeness(amount) {
  totalSafeness = amount;
  updateStatsDisplay();
}

export function getTotalElectricityProduction() {
  return totalElectricityProduction;
}

export function getTotalElectricityConsumption() {
  return totalElectricityConsumption;
}

export function getTotalPopulation() {
  return totalPopulation;
}

export function getTotalHappiness() {
  return totalHappiness;
}

export function getTotalHappinessNeeded() {
  return totalHappinessNeeded;
}

export function getTotalSafeness() {
  return totalSafeness;
}

export function getTotalSafenessNeeded() {
  return totalSafenessNeeded;
}

export function addElectricityProduction(amount) {
  totalElectricityProduction += amount;
  updateStatsDisplay();
}

export function removeElectricityProduction(amount) {
  totalElectricityProduction = Math.max(0, totalElectricityProduction - amount);
  updateStatsDisplay();
}

export function addElectricityConsumption(amount) {
  totalElectricityConsumption += amount;
  updateStatsDisplay();
}

export function removeElectricityConsumption(amount) {
  totalElectricityConsumption = Math.max(0, totalElectricityConsumption - amount);
  updateStatsDisplay();
}

export function addPopulation(amount) {
  totalPopulation += amount;
  updateStatsDisplay();
}

export function removePopulation(amount) {
  totalPopulation = Math.max(0, totalPopulation - amount);
  updateStatsDisplay();
}

export function setTotalHappiness(amount) {
  totalHappiness = amount;
  updateStatsDisplay();
}

export function setTotalHappinessNeeded(amount) {
  totalHappinessNeeded = amount;
  updateStatsDisplay();
}

export function setTotalSafenessNeeded(amount) {
  totalSafenessNeeded = amount;
  updateStatsDisplay();
}

export function getElectricityDeficitPercent() {
  if (totalElectricityConsumption === 0) return 0;
  if (totalElectricityProduction >= totalElectricityConsumption) return 0;
  const deficit = totalElectricityConsumption - totalElectricityProduction;
  return (deficit / totalElectricityConsumption) * 100;
}

export function getHappinessDeficitPercent() {
  if (totalHappinessNeeded === 0) return 0;
  if (totalHappiness >= totalHappinessNeeded) return 0;
  const deficit = totalHappinessNeeded - totalHappiness;
  return (deficit / totalHappinessNeeded) * 100;
}

export function getSafenessDeficitPercent() {
  if (totalSafenessNeeded === 0) return 0;
  if (totalSafeness >= totalSafenessNeeded) return 0;
  const deficit = totalSafenessNeeded - totalSafeness;
  return (deficit / totalSafenessNeeded) * 100;
}

function updateStatsDisplay() {
  const electricityDisplay = document.getElementById('city-electricity-display');
  const populationDisplay = document.getElementById('city-population-display');
  const happinessDisplay = document.getElementById('city-happiness-display');
  const safenessDisplay = document.getElementById('city-safeness-display');

  if (electricityDisplay) {
    electricityDisplay.textContent = `Electricity (kwh): ${totalElectricityProduction.toLocaleString()}/${totalElectricityConsumption.toLocaleString()}`;
  }

  if (populationDisplay) {
    populationDisplay.textContent = `Population: ${totalPopulation}`;
  }

  if (happinessDisplay) {
    if (currentGameDay < 30) {
      happinessDisplay.textContent = `Happiness: 0/0 (N/A)`;
    } else {
      const happinessPercent = totalHappinessNeeded > 0 
        ? Math.min(100, (totalHappiness / totalHappinessNeeded) * 100).toFixed(0)
        : 100;
      happinessDisplay.textContent = `Happiness: ${totalHappiness.toLocaleString()}/${totalHappinessNeeded.toLocaleString()} (${happinessPercent}%)`;
    }
  }

  if (safenessDisplay) {
    if (currentGameDay < 30) {
      safenessDisplay.textContent = `Safeness: 0/0 (N/A)`;
    } else {
      const safenessPercent = totalSafenessNeeded > 0
        ? Math.min(100, (totalSafeness / totalSafenessNeeded) * 100).toFixed(0)
        : 100;
      safenessDisplay.textContent = `Safeness: ${totalSafeness.toLocaleString()}/${totalSafenessNeeded.toLocaleString()} (${safenessPercent}%)`;
    }
  }
}

export function initializeStatsDisplay() {
  const statsPanel = document.getElementById('city-stats-panel');
  if (!statsPanel) return;

  const electricityContainer = document.createElement('div');
  electricityContainer.className = 'city-stat-item';
  
  const electricityIcon = document.createElement('img');
  electricityIcon.src = './Icon/Energy.png';
  electricityIcon.className = 'city-stat-icon';
  electricityIcon.alt = 'Electricity';
  electricityIcon.style.width = '20px';
  electricityIcon.style.height = '20px';
  
  const electricityDisplay = document.createElement('span');
  electricityDisplay.id = 'city-electricity-display';
  electricityDisplay.className = 'city-stat-value';
  
  electricityContainer.appendChild(electricityIcon);
  electricityContainer.appendChild(electricityDisplay);
  statsPanel.appendChild(electricityContainer);

  const populationContainer = document.createElement('div');
  populationContainer.className = 'city-stat-item';
  
  const populationIcon = document.createElement('img');
  populationIcon.src = './Icon/Resident.png';
  populationIcon.className = 'city-stat-icon';
  populationIcon.alt = 'Population';
  populationIcon.style.width = '20px';
  populationIcon.style.height = '20px';
  
  const populationDisplay = document.createElement('span');
  populationDisplay.id = 'city-population-display';
  populationDisplay.className = 'city-stat-value';
  
  populationContainer.appendChild(populationIcon);
  populationContainer.appendChild(populationDisplay);
  statsPanel.appendChild(populationContainer);

  const happinessContainer = document.createElement('div');
  happinessContainer.className = 'city-stat-item';
  
  const happinessIcon = document.createElement('img');
  happinessIcon.src = './Icon/Entertainment.png';
  happinessIcon.className = 'city-stat-icon';
  happinessIcon.alt = 'Happiness';
  happinessIcon.style.width = '20px';
  happinessIcon.style.height = '20px';
  
  const happinessDisplay = document.createElement('span');
  happinessDisplay.id = 'city-happiness-display';
  happinessDisplay.className = 'city-stat-value';
  
  happinessContainer.appendChild(happinessIcon);
  happinessContainer.appendChild(happinessDisplay);
  statsPanel.appendChild(happinessContainer);

  const safenessContainer = document.createElement('div');
  safenessContainer.className = 'city-stat-item';
  
  const safenessIcon = document.createElement('img');
  safenessIcon.src = './Icon/Facilities.png';
  safenessIcon.className = 'city-stat-icon';
  safenessIcon.alt = 'Safeness';
  safenessIcon.style.width = '20px';
  safenessIcon.style.height = '20px';
  
  const safenessDisplay = document.createElement('span');
  safenessDisplay.id = 'city-safeness-display';
  safenessDisplay.className = 'city-stat-value';
  
  safenessContainer.appendChild(safenessIcon);
  safenessContainer.appendChild(safenessDisplay);
  statsPanel.appendChild(safenessContainer);

  updateStatsDisplay();
}

export function setTotalElectricityProduction(amount) {
  totalElectricityProduction = amount;
  updateStatsDisplay();
}

export function setTotalElectricityConsumption(amount) {
  totalElectricityConsumption = amount;
  updateStatsDisplay();
}

export function setTotalPopulation(amount) {
  totalPopulation = amount;
  updateStatsDisplay();
}

export function resetStats() {
  totalElectricityProduction = 0;
  totalElectricityConsumption = 0;
  totalPopulation = 0;
  totalHappiness = 0;
  totalHappinessNeeded = 0;
  totalSafeness = 0;
  totalSafenessNeeded = 0;
  updateStatsDisplay();
}

