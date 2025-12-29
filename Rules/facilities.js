import { FACILITIES_TYPES } from '../city/utils/constants.js';
import { addSafeness, removeSafeness, setTotalSafenessNeeded, setTotalSafeness } from './cityStats.js';
import { getTotalPopulation } from './cityStats.js';

const FACILITIES_SAFENESS_PERCENT = 25;
const FACILITIES_COVERAGE = 500;

const facilitiesBuildings = new Map();
const bankDeposits = new Map();

export function initializeFacility(facility, facilityType) {
  facilitiesBuildings.set(facility, {
    facilityType,
  });
  
  facility.userData.facilityData = facilitiesBuildings.get(facility);
  
  if (facilityType !== FACILITIES_TYPES.BANK) {
    updateSafeness();
  }
}

export function removeFacility(facility) {
  const data = facilitiesBuildings.get(facility);
  if (data && data.facilityType !== FACILITIES_TYPES.BANK) {
    facilitiesBuildings.delete(facility);
    updateSafeness();
  } else {
    facilitiesBuildings.delete(facility);
  }
}

function updateSafeness() {
  updateTotalSafeness();
  
  const totalPopulation = getTotalPopulation();
  const neededSafeness = Math.ceil(totalPopulation / FACILITIES_COVERAGE) * 100;
  setTotalSafenessNeeded(neededSafeness);
}

function updateTotalSafeness() {
  const nonBankFacilities = Array.from(facilitiesBuildings.values())
    .filter(f => f.facilityType !== FACILITIES_TYPES.BANK);
  
  const totalSafeness = nonBankFacilities.length * FACILITIES_SAFENESS_PERCENT;
  setTotalSafeness(totalSafeness);
}

export function openBankDialog(facility) {
  const dialog = document.createElement('div');
  dialog.className = 'bank-dialog';
  dialog.innerHTML = `
    <div class="bank-dialog-content">
      <h3>Bank Deposit</h3>
      <p>Monthly Interest: 30%</p>
      <label>
        Deposit Amount:
        <input type="number" id="bank-deposit-amount" min="1" value="0" />
      </label>
      <div id="bank-total-display">Total after 30 days: $0</div>
      <div class="bank-dialog-buttons">
        <button id="bank-deposit-submit">Deposit</button>
        <button id="bank-deposit-cancel">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  const amountInput = document.getElementById('bank-deposit-amount');
  const totalDisplay = document.getElementById('bank-total-display');
  const submitBtn = document.getElementById('bank-deposit-submit');
  const cancelBtn = document.getElementById('bank-deposit-cancel');
  
  amountInput.addEventListener('input', () => {
    const amount = parseFloat(amountInput.value) || 0;
    const total = amount * 1.3;
    totalDisplay.textContent = `Total after 30 days: $${total.toLocaleString()}`;
  });
  
  submitBtn.addEventListener('click', () => {
    const amount = parseFloat(amountInput.value) || 0;
    if (amount > 0) {
      createBankDeposit(facility, amount);
      document.body.removeChild(dialog);
    }
  });
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(dialog);
  });
}

function createBankDeposit(facility, amount) {
  import('./currency.js').then(({ spendMoney, addMoney }) => {
    if (spendMoney(amount)) {
      const deposit = {
        facility,
        amount,
        total: amount * 1.3,
        startDate: Date.now(),
        daysRemaining: 30,
      };
      
      bankDeposits.set(facility, deposit);
      facility.userData.bankDeposit = deposit;
      
      startDepositCountdown(facility, deposit);
    } else {
      alert('Not enough money!');
    }
  });
}

function startDepositCountdown(facility, deposit) {
  const countdownInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - deposit.startDate;
    const daysElapsed = Math.floor(elapsed / (24 * 60 * 60 * 1000));
    deposit.daysRemaining = Math.max(0, 30 - daysElapsed);
    
    if (deposit.daysRemaining <= 0) {
      clearInterval(countdownInterval);
      completeDeposit(facility, deposit);
    }
  }, 1000);
  
  deposit.countdownInterval = countdownInterval;
}

function completeDeposit(facility, deposit) {
  import('./currency.js').then(({ addMoney }) => {
    addMoney(deposit.total);
    bankDeposits.delete(facility);
    if (facility.userData) {
      delete facility.userData.bankDeposit;
    }
  });
}

export function getBankDeposit(facility) {
  return bankDeposits.get(facility);
}

export function getSafenessDeficitPercent() {
  import('./cityStats.js').then(({ getSafenessDeficitPercent }) => {
    return getSafenessDeficitPercent();
  });
}

export function getAllFacilities() {
  return Array.from(facilitiesBuildings.keys());
}

