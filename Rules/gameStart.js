import { setCityMoney, setCreativeMode, resetMoney } from './currency.js';
import { resetStats } from './cityStats.js';
import { initializeMoneyDisplay } from './currency.js';
import { initializeStatsDisplay } from './cityStats.js';
import { initializePriceDisplays } from './buildingPrices.js';
import { setupDayCompleteCallback, resetGameDay } from './integration.js';

let gameStarted = false;
let gameInitialized = false;

export function initializeGameStartUI() {
  if (gameInitialized) return;
  gameInitialized = true;
  
  const existingMenu = document.getElementById('game-start-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  const startMenu = document.createElement('div');
  startMenu.id = 'game-start-menu';
  startMenu.className = 'game-start-menu';
  startMenu.style.display = 'flex';
  startMenu.innerHTML = `
    <div class="game-start-content">
      <h1>City Builder</h1>
      <div class="game-start-buttons">
        <button id="new-game-btn" class="game-start-button">New Game</button>
        <button id="creative-mode-btn" class="game-start-button">Creative Mode</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(startMenu);
  
  const newGameBtn = document.getElementById('new-game-btn');
  const creativeModeBtn = document.getElementById('creative-mode-btn');
  
  newGameBtn.addEventListener('click', () => {
    startNewGame();
  });
  
  creativeModeBtn.addEventListener('click', () => {
    startCreativeMode();
  });
  
}

function startNewGame() {
  resetMoney();
  resetStats();
  setCreativeMode(false);
  resetGameDay();
  hideStartMenu();
  gameStarted = true;
  
  localStorage.removeItem('cityBuilderSave');
  
  initializeMoneyDisplay();
  initializeStatsDisplay();
  initializePriceDisplays();
  setupDayCompleteCallback();
}

function startCreativeMode() {
  resetMoney();
  resetStats();
  setCreativeMode(true);
  resetGameDay();
  hideStartMenu();
  gameStarted = true;
  
  localStorage.removeItem('cityBuilderSave');
  
  initializeMoneyDisplay();
  initializeStatsDisplay();
  initializePriceDisplays();
  setupDayCompleteCallback();
}

function hideStartMenu() {
  const startMenu = document.getElementById('game-start-menu');
  if (startMenu) {
    startMenu.style.display = 'none';
  }
}

export function isGameStarted() {
  return gameStarted;
}

