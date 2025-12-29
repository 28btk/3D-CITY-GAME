import { undoRoad } from "./city/road.js";
import { removeBuildingWithRules } from "./Rules/buildingIntegration.js";

const actionHistoryStack = [];

export function pushAction(action) {
  actionHistoryStack.push(action);
}

export function popAction() {
  return actionHistoryStack.pop();
}

export function undoAction(scene) {
  const last = popAction();
  if (!last) return;

  if (last.type === "road") {
    undoRoad(last.tile, last.prevData, scene);
  } else if (last.type === "house") {
    const { tile, tiles, previousHouses, previousHouse, newHouse } = last;
    
    const targetTiles = tiles || [tile];
    const prevHouses = previousHouses || (previousHouse ? [previousHouse] : []);

    if (newHouse) {
      removeBuildingWithRules(newHouse, 'house');
      scene.remove(newHouse);
      targetTiles.forEach((t) => {
        if (t && t.userData.house === newHouse) {
          t.userData.house = null;
        }
      });
    }

    prevHouses.forEach((prevHouse, index) => {
      if (prevHouse && targetTiles[index]) {
        scene.add(prevHouse);
        targetTiles[index].userData.house = prevHouse;
      }
    });
  } else if (last.type === "energy") {
    const { tile, tiles, previousEnergies, newEnergy } = last;
    
    const targetTiles = tiles || [tile];
    const prevEnergies = previousEnergies || [];

    if (newEnergy) {
      removeBuildingWithRules(newEnergy, 'energy');
      scene.remove(newEnergy);
      targetTiles.forEach((t) => {
        if (t && t.userData.energy === newEnergy) {
          t.userData.energy = null;
        }
      });
    }

    prevEnergies.forEach((prevEnergy, index) => {
      if (prevEnergy && targetTiles[index]) {
        scene.add(prevEnergy);
        targetTiles[index].userData.energy = prevEnergy;
      }
    });
  } else if (last.type === "entertainment") {
    const { tile, tiles, previousEntertainments, newEntertainment } = last;
    
    const targetTiles = tiles || [tile];
    const prevEntertainments = previousEntertainments || [];

    if (newEntertainment) {
      removeBuildingWithRules(newEntertainment, 'entertainment');
      scene.remove(newEntertainment);
      targetTiles.forEach((t) => {
        if (t && t.userData.entertainment === newEntertainment) {
          t.userData.entertainment = null;
        }
      });
    }

    prevEntertainments.forEach((prevEntertainment, index) => {
      if (prevEntertainment && targetTiles[index]) {
        scene.add(prevEntertainment);
        targetTiles[index].userData.entertainment = prevEntertainment;
      }
    });
  } else if (last.type === "store") {
    const { tile, tiles, previousStores, newStore } = last;
    
    const targetTiles = tiles || [tile];
    const prevStores = previousStores || [];

    if (newStore) {
      removeBuildingWithRules(newStore, 'store');
      scene.remove(newStore);
      targetTiles.forEach((t) => {
        if (t && t.userData.store === newStore) {
          t.userData.store = null;
        }
      });
    }

    prevStores.forEach((prevStore, index) => {
      if (prevStore && targetTiles[index]) {
        scene.add(prevStore);
        targetTiles[index].userData.store = prevStore;
      }
    });
  } else if (last.type === "facilities") {
    const { tile, tiles, previousFacilities, newFacilities } = last;
    
    const targetTiles = tiles || [tile];
    const prevFacilities = previousFacilities || [];

    if (newFacilities) {
      removeBuildingWithRules(newFacilities, 'facilities');
      scene.remove(newFacilities);
      targetTiles.forEach((t) => {
        if (t && t.userData.facilities === newFacilities) {
          t.userData.facilities = null;
        }
      });
    }

    prevFacilities.forEach((prevFacility, index) => {
      if (prevFacility && targetTiles[index]) {
        scene.add(prevFacility);
        targetTiles[index].userData.facilities = prevFacility;
      }
    });
  } else if (last.type === "factory") {
    const { tile, tiles, previousFactories, newFactory } = last;
    
    const targetTiles = tiles || [tile];
    const prevFactories = previousFactories || [];

    if (newFactory) {
      removeBuildingWithRules(newFactory, 'factory');
      scene.remove(newFactory);
      targetTiles.forEach((t) => {
        if (t && t.userData.factory === newFactory) {
          t.userData.factory = null;
        }
      });
    }

    prevFactories.forEach((prevFactory, index) => {
      if (prevFactory && targetTiles[index]) {
        scene.add(prevFactory);
        targetTiles[index].userData.factory = prevFactory;
      }
    });
  }
}

