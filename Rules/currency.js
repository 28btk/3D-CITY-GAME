export let cityMoney = 1000;
export let isCreativeMode = false;

export function getCityMoney() {
  if (isCreativeMode) {
    return Infinity;
  }
  return cityMoney;
}

export function setCityMoney(amount) {
  if (isCreativeMode) {
    return;
  }
  cityMoney = Math.max(0, amount);
  updateMoneyDisplay();
}

export function addMoney(amount) {
  if (isCreativeMode) {
    return;
  }
  cityMoney += amount;
  updateMoneyDisplay();
}

export function spendMoney(amount) {
  if (isCreativeMode) {
    return true;
  }
  if (cityMoney >= amount) {
    cityMoney -= amount;
    updateMoneyDisplay();
    return true;
  }
  return false;
}

export function canAfford(amount) {
  if (isCreativeMode) {
    return true;
  }
  return cityMoney >= amount;
}

export function setCreativeMode(enabled) {
  isCreativeMode = enabled;
  updateMoneyDisplay();
}

export function resetMoney() {
  cityMoney = 1000;
  updateMoneyDisplay();
}

function updateMoneyDisplay() {
  const moneyDisplay = document.getElementById('city-money-display');
  if (moneyDisplay) {
    if (isCreativeMode) {
      moneyDisplay.textContent = 'Money: ∞';
    } else {
      moneyDisplay.textContent = `Money: $${cityMoney.toLocaleString()}`;
    }
  }
}

export function initializeMoneyDisplay() {
  const statsPanel = document.getElementById('city-stats-panel');
  if (!statsPanel) return;

  const moneyContainer = document.createElement('div');
  moneyContainer.className = 'city-stat-item';
  moneyContainer.id = 'city-money-container';
  
  const moneyIcon = document.createElement('img');
  moneyIcon.src = './Icon/Energy.png';
  moneyIcon.className = 'city-stat-icon';
  moneyIcon.alt = 'Money';
  moneyIcon.style.width = '20px';
  moneyIcon.style.height = '20px';
  
  const moneyDisplay = document.createElement('span');
  moneyDisplay.id = 'city-money-display';
  moneyDisplay.className = 'city-stat-value';
  
  moneyContainer.appendChild(moneyIcon);
  moneyContainer.appendChild(moneyDisplay);
  statsPanel.appendChild(moneyContainer);
  
  updateMoneyDisplay();
}

