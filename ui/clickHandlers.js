import * as THREE from "three";
import { getTargetTiles } from "../city/utils/grid.js";
import { 
  createPreviewHouse, removePreviewHouse, clearSelection as clearHouseSelection,
  setSelectedTile as setHouseSelectedTile, getSelectedTile as getHouseSelectedTile,
  getSelectedTiles as getHouseSelectedTiles, getCurrentHoveredTile as getHouseCurrentHoveredTile,
  buildHouse
} from "../city/house.js";
import {
  createPreviewEnergy, removePreviewEnergy, clearSelection as clearEnergySelection,
  setSelectedTile as setEnergySelectedTile, getSelectedTile as getEnergySelectedTile,
  getSelectedTiles as getEnergySelectedTiles, getCurrentHoveredTile as getEnergyCurrentHoveredTile,
  buildEnergy
} from "../city/energy.js";
import {
  createPreviewEntertainment, removePreviewEntertainment, clearSelection as clearEntertainmentSelection,
  setSelectedTile as setEntertainmentSelectedTile, getSelectedTile as getEntertainmentSelectedTile,
  getSelectedTiles as getEntertainmentSelectedTiles, getCurrentHoveredTile as getEntertainmentCurrentHoveredTile,
  buildEntertainment
} from "../city/entertainment.js";
import {
  createPreviewStore, removePreviewStore, clearSelection as clearStoreSelection,
  setSelectedTile as setStoreSelectedTile, getSelectedTile as getStoreSelectedTile,
  getSelectedTiles as getStoreSelectedTiles, getCurrentHoveredTile as getStoreCurrentHoveredTile,
  buildStore
} from "../city/store.js";
import {
  createPreviewFacilities, removePreviewFacilities, clearSelection as clearFacilitiesSelection,
  setSelectedTile as setFacilitiesSelectedTile, getSelectedTile as getFacilitiesSelectedTile,
  getSelectedTiles as getFacilitiesSelectedTiles, getCurrentHoveredTile as getFacilitiesCurrentHoveredTile,
  buildFacilities
} from "../city/facilities.js";
import {
  createPreviewFactory, removePreviewFactory, clearSelection as clearFactorySelection,
  setSelectedTile as setFactorySelectedTile, getSelectedTile as getFactorySelectedTile,
  getSelectedTiles as getFactorySelectedTiles, getCurrentHoveredTile as getFactoryCurrentHoveredTile,
  buildFactory
} from "../city/factory.js";
import { buildRoad } from "../city/road.js";
import { pushAction } from "../undo.js";
import { rotateObject, getRotation, setRotation } from "../city/utils/rotation.js";
import * as State from "../game/state.js";
import { canBuildBuilding, buildBuildingWithRules, removeBuildingWithRules } from "../Rules/buildingIntegration.js";
import { getHouseInfo } from "../Rules/resident.js";
import { showFactoryCoverage, hideFactoryCoverage } from "../Rules/factory.js";
import { showStoreCoverage, hideStoreCoverage } from "../Rules/store.js";
import { openBankDialog } from "../Rules/facilities.js";
import { FACILITIES_TYPES } from "../city/utils/constants.js";

function isRoadTile(tile) {
  return tile.userData.road !== undefined && tile.userData.road !== null;
}

export function setupClickHandlers(scene, renderer, camera, grassTiles) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!State.isBuildHouseMode && !State.isBuildEnergyMode && !State.isBuildEntertainmentMode && 
        !State.isBuildStoreMode && !State.isBuildFacilitiesMode && !State.isBuildFactoryMode) {
      removePreviewHouse(scene);
      removePreviewEnergy(scene);
      removePreviewEntertainment(scene);
      removePreviewStore(scene);
      removePreviewFacilities(scene);
      removePreviewFactory(scene);
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(grassTiles);
    
    if (State.isBuildHouseMode) {
      if (getHouseSelectedTile()) {
        return;
      }
      
      if (intersects.length > 0) {
        const tile = intersects[0].object;
        createPreviewHouse(tile, getRotation(), State.currentHouseHeight, State.isBuildHouseMode, scene);
      } else {
        removePreviewHouse(scene);
      }
    } else if (State.isBuildEnergyMode) {
      if (getEnergySelectedTile()) {
        return;
      }
      
      if (intersects.length > 0) {
        const tile = intersects[0].object;
        createPreviewEnergy(tile, getRotation(), State.currentEnergyType, State.isBuildEnergyMode, scene);
      } else {
        removePreviewEnergy(scene);
      }
    } else if (State.isBuildEntertainmentMode) {
      if (getEntertainmentSelectedTile()) {
        return;
      }
      
      if (intersects.length > 0) {
        const tile = intersects[0].object;
        createPreviewEntertainment(tile, getRotation(), State.currentEntertainmentType, State.isBuildEntertainmentMode, scene);
      } else {
        removePreviewEntertainment(scene);
      }
    } else if (State.isBuildStoreMode) {
      if (getStoreSelectedTile()) {
        return;
      }
      
      if (intersects.length > 0) {
        const tile = intersects[0].object;
        createPreviewStore(tile, getRotation(), State.currentStoreType, State.isBuildStoreMode, scene);
      } else {
        removePreviewStore(scene);
      }
    } else if (State.isBuildFacilitiesMode) {
      if (getFacilitiesSelectedTile()) {
        return;
      }
      
      if (intersects.length > 0) {
        const tile = intersects[0].object;
        createPreviewFacilities(tile, getRotation(), State.currentFacilitiesType, State.isBuildFacilitiesMode, scene);
      } else {
        removePreviewFacilities(scene);
      }
    } else if (State.isBuildFactoryMode) {
      if (getFactorySelectedTile()) {
        return;
      }
      
      if (intersects.length > 0) {
        const tile = intersects[0].object;
        createPreviewFactory(tile, getRotation(), State.currentFactoryType, State.isBuildFactoryMode, scene);
      } else {
        removePreviewFactory(scene);
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r") {
      if (State.isBuildHouseMode) {
        const selectedTile = getHouseSelectedTile();
        const newRotation = rotateObject(State.currentHouseHeight, selectedTile, {
          onRotate: (rotation) => {
            if (selectedTile) {
              setHouseSelectedTile(selectedTile, rotation, State.currentHouseHeight, scene);
              createPreviewHouse(selectedTile, rotation, State.currentHouseHeight, State.isBuildHouseMode, scene);
            } else {
              const hoveredTile = getHouseCurrentHoveredTile();
              if (hoveredTile) {
                createPreviewHouse(hoveredTile, rotation, State.currentHouseHeight, State.isBuildHouseMode, scene);
              }
            }
          },
        }, "house");
        setRotation(newRotation);
      } else if (State.isBuildEnergyMode) {
        const selectedTile = getEnergySelectedTile();
        const newRotation = rotateObject(State.currentEnergyType, selectedTile, {
          onRotate: (rotation) => {
            if (selectedTile) {
              setEnergySelectedTile(selectedTile, rotation, State.currentEnergyType, scene);
              createPreviewEnergy(selectedTile, rotation, State.currentEnergyType, State.isBuildEnergyMode, scene);
            } else {
              const hoveredTile = getEnergyCurrentHoveredTile();
              if (hoveredTile) {
                createPreviewEnergy(hoveredTile, rotation, State.currentEnergyType, State.isBuildEnergyMode, scene);
              }
            }
          },
        }, "energy");
        setRotation(newRotation);
      } else if (State.isBuildEntertainmentMode) {
        const selectedTile = getEntertainmentSelectedTile();
        const newRotation = rotateObject(State.currentEntertainmentType, selectedTile, {
          onRotate: (rotation) => {
            if (selectedTile) {
              setEntertainmentSelectedTile(selectedTile, rotation, State.currentEntertainmentType, scene);
              createPreviewEntertainment(selectedTile, rotation, State.currentEntertainmentType, State.isBuildEntertainmentMode, scene);
            } else {
              const hoveredTile = getEntertainmentCurrentHoveredTile();
              if (hoveredTile) {
                createPreviewEntertainment(hoveredTile, rotation, State.currentEntertainmentType, State.isBuildEntertainmentMode, scene);
              }
            }
          },
        }, "entertainment");
        setRotation(newRotation);
      } else if (State.isBuildStoreMode) {
        const selectedTile = getStoreSelectedTile();
        const newRotation = rotateObject(State.currentStoreType, selectedTile, {
          onRotate: (rotation) => {
            if (selectedTile) {
              setStoreSelectedTile(selectedTile, rotation, State.currentStoreType, scene);
              createPreviewStore(selectedTile, rotation, State.currentStoreType, State.isBuildStoreMode, scene);
            } else {
              const hoveredTile = getStoreCurrentHoveredTile();
              if (hoveredTile) {
                createPreviewStore(hoveredTile, rotation, State.currentStoreType, State.isBuildStoreMode, scene);
              }
            }
          },
        }, "store");
        setRotation(newRotation);
      } else if (State.isBuildFacilitiesMode) {
        const selectedTile = getFacilitiesSelectedTile();
        const newRotation = rotateObject(State.currentFacilitiesType, selectedTile, {
          onRotate: (rotation) => {
            if (selectedTile) {
              setFacilitiesSelectedTile(selectedTile, rotation, State.currentFacilitiesType, scene);
              createPreviewFacilities(selectedTile, rotation, State.currentFacilitiesType, State.isBuildFacilitiesMode, scene);
            } else {
              const hoveredTile = getFacilitiesCurrentHoveredTile();
              if (hoveredTile) {
                createPreviewFacilities(hoveredTile, rotation, State.currentFacilitiesType, State.isBuildFacilitiesMode, scene);
              }
            }
          },
        }, "facilities");
        setRotation(newRotation);
      } else if (State.isBuildFactoryMode) {
        const selectedTile = getFactorySelectedTile();
        const newRotation = rotateObject(State.currentFactoryType, selectedTile, {
          onRotate: (rotation) => {
            if (selectedTile) {
              setFactorySelectedTile(selectedTile, rotation, State.currentFactoryType, scene);
              createPreviewFactory(selectedTile, rotation, State.currentFactoryType, State.isBuildFactoryMode, scene);
            } else {
              const hoveredTile = getFactoryCurrentHoveredTile();
              if (hoveredTile) {
                createPreviewFactory(hoveredTile, rotation, State.currentFactoryType, State.isBuildFactoryMode, scene);
              }
            }
          },
        }, "factory");
        setRotation(newRotation);
      }
    }
  });

  renderer.domElement.addEventListener("contextmenu", (event) => {
    if (State.isBuildHouseMode) {
      event.preventDefault();
      const selectedTile = getHouseSelectedTile();
      const newRotation = rotateObject(State.currentHouseHeight, selectedTile, {
        onRotate: (rotation) => {
          if (selectedTile) {
            setHouseSelectedTile(selectedTile, rotation, State.currentHouseHeight, scene);
            createPreviewHouse(selectedTile, rotation, State.currentHouseHeight, State.isBuildHouseMode, scene);
          } else {
            const hoveredTile = getHouseCurrentHoveredTile();
            if (hoveredTile) {
              createPreviewHouse(hoveredTile, rotation, State.currentHouseHeight, State.isBuildHouseMode, scene);
            }
          }
        },
      }, "house");
      setRotation(newRotation);
    } else if (State.isBuildEnergyMode) {
      event.preventDefault();
      const selectedTile = getEnergySelectedTile();
      const newRotation = rotateObject(State.currentEnergyType, selectedTile, {
        onRotate: (rotation) => {
          if (selectedTile) {
            setEnergySelectedTile(selectedTile, rotation, State.currentEnergyType, scene);
            createPreviewEnergy(selectedTile, rotation, State.currentEnergyType, State.isBuildEnergyMode, scene);
          } else {
            const hoveredTile = getEnergyCurrentHoveredTile();
            if (hoveredTile) {
              createPreviewEnergy(hoveredTile, rotation, State.currentEnergyType, State.isBuildEnergyMode, scene);
            }
          }
        },
      }, "energy");
      setRotation(newRotation);
    } else if (State.isBuildEntertainmentMode) {
      event.preventDefault();
      const selectedTile = getEntertainmentSelectedTile();
      const newRotation = rotateObject(State.currentEntertainmentType, selectedTile, {
        onRotate: (rotation) => {
          if (selectedTile) {
            setEntertainmentSelectedTile(selectedTile, rotation, State.currentEntertainmentType, scene);
            createPreviewEntertainment(selectedTile, rotation, State.currentEntertainmentType, State.isBuildEntertainmentMode, scene);
          } else {
            const hoveredTile = getEntertainmentCurrentHoveredTile();
            if (hoveredTile) {
              createPreviewEntertainment(hoveredTile, rotation, State.currentEntertainmentType, State.isBuildEntertainmentMode, scene);
            }
          }
        },
      }, "entertainment");
      setRotation(newRotation);
    } else if (State.isBuildStoreMode) {
      event.preventDefault();
      const selectedTile = getStoreSelectedTile();
      const newRotation = rotateObject(State.currentStoreType, selectedTile, {
        onRotate: (rotation) => {
          if (selectedTile) {
            setStoreSelectedTile(selectedTile, rotation, State.currentStoreType, scene);
            createPreviewStore(selectedTile, rotation, State.currentStoreType, State.isBuildStoreMode, scene);
          } else {
            const hoveredTile = getStoreCurrentHoveredTile();
            if (hoveredTile) {
              createPreviewStore(hoveredTile, rotation, State.currentStoreType, State.isBuildStoreMode, scene);
            }
          }
        },
      }, "store");
      setRotation(newRotation);
    } else if (State.isBuildFacilitiesMode) {
      event.preventDefault();
      const selectedTile = getFacilitiesSelectedTile();
      const newRotation = rotateObject(State.currentFacilitiesType, selectedTile, {
        onRotate: (rotation) => {
          if (selectedTile) {
            setFacilitiesSelectedTile(selectedTile, rotation, State.currentFacilitiesType, scene);
            createPreviewFacilities(selectedTile, rotation, State.currentFacilitiesType, State.isBuildFacilitiesMode, scene);
          } else {
            const hoveredTile = getFacilitiesCurrentHoveredTile();
            if (hoveredTile) {
              createPreviewFacilities(hoveredTile, rotation, State.currentFacilitiesType, State.isBuildFacilitiesMode, scene);
            }
          }
        },
      }, "facilities");
      setRotation(newRotation);
    }
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (!State.isBuildRoadMode && !State.isBuildHouseMode && !State.isBuildEnergyMode && 
        !State.isBuildEntertainmentMode && !State.isBuildStoreMode && !State.isBuildFacilitiesMode && !State.isBuildFactoryMode) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(grassTiles);
    
    if (intersects.length > 0) {
      const tile = intersects[0].object;
      
      if (State.isBuildRoadMode) {
        const prevData = buildRoad(tile, scene);
        pushAction({
          type: "road",
          tile,
          prevData: prevData,
        });
      } else if (State.isBuildHouseMode) {
        const selectedTile = getHouseSelectedTile();
        
        if (!selectedTile) {
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentHouseHeight, "house");
          const hasRoad = targetTiles.some((t) => isRoadTile(t));
          const hasConflict = targetTiles.some((t) => t.userData.house || t.userData.energy);
          const canPlace = !hasRoad && (!hasConflict || State.currentHouseHeight === 1);
          
          setHouseSelectedTile(tile, getRotation(), State.currentHouseHeight, scene);
          createPreviewHouse(tile, getRotation(), State.currentHouseHeight, State.isBuildHouseMode, scene);
          
          if (!canPlace) {
            return;
          }
          return;
        }
        
        const selectedTiles = getHouseSelectedTiles();
        const isInSelectedTiles = selectedTiles.some((t) => 
          Math.abs(t.position.x - tile.position.x) < 0.1 && 
          Math.abs(t.position.z - tile.position.z) < 0.1
        );
        if (!isInSelectedTiles) {
          clearHouseSelection(scene);
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentHouseHeight, "house");
          const hasRoad = targetTiles.some((t) => isRoadTile(t));
          const hasConflict = targetTiles.some((t) => t.userData.house || t.userData.energy);
          const canPlace = !hasRoad && (!hasConflict || State.currentHouseHeight === 1);
          
          setHouseSelectedTile(tile, getRotation(), State.currentHouseHeight, scene);
          createPreviewHouse(tile, getRotation(), State.currentHouseHeight, State.isBuildHouseMode, scene);
          
          if (!canPlace) {
            return;
          }
          return;
        }
        
        const targetTiles = selectedTiles;
        const hasExistingHouse = targetTiles.some((t) => t.userData.house);
        if (hasExistingHouse && State.currentHouseHeight !== 1) {
          clearHouseSelection(scene);
          return;
        }

        const previousHouses = targetTiles.map((t) => t.userData.house || null);

        targetTiles.forEach((t) => {
          if (t.userData.house) {
            scene.remove(t.userData.house);
            t.userData.house = null;
          }
        });

        if (!canBuildBuilding(State.currentHouseHeight, 'house')) {
          alert('Not enough money!');
          clearHouseSelection(scene);
          return;
        }

        const house = buildHouse(tile, State.currentHouseHeight, getRotation(), targetTiles, scene);
        
        if (house && buildBuildingWithRules(house, State.currentHouseHeight, 'house', targetTiles)) {
          clearHouseSelection(scene);
          removePreviewHouse(scene);
          
          pushAction({
            type: "house",
            tile: targetTiles[0],
            tiles: targetTiles,
            previousHouses,
            newHouse: house,
          });
        } else {
          scene.remove(house);
          clearHouseSelection(scene);
        }
      } else if (State.isBuildEnergyMode) {
        const selectedTile = getEnergySelectedTile();
        
        if (!selectedTile) {
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentEnergyType, "energy");
          const canPlace = !targetTiles.some((t) => t.userData.energy || t.userData.house || isRoadTile(t));
          
          setEnergySelectedTile(tile, getRotation(), State.currentEnergyType, scene);
          createPreviewEnergy(tile, getRotation(), State.currentEnergyType, State.isBuildEnergyMode, scene);
          
          if (!canPlace) {
            return;
          }
          return;
        }
        
        const selectedTiles = getEnergySelectedTiles();
        const isInSelectedTiles = selectedTiles.some((t) => 
          Math.abs(t.position.x - tile.position.x) < 0.1 && 
          Math.abs(t.position.z - tile.position.z) < 0.1
        );
        if (!isInSelectedTiles) {
          clearEnergySelection(scene);
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentEnergyType, "energy");
          const canPlace = !targetTiles.some((t) => t.userData.energy || t.userData.house || isRoadTile(t));
          if (canPlace) {
            setEnergySelectedTile(tile, getRotation(), State.currentEnergyType, scene);
            createPreviewEnergy(tile, getRotation(), State.currentEnergyType, State.isBuildEnergyMode, scene);
          }
          return;
        }
        
        const targetTiles = selectedTiles;
        const hasExistingEnergy = targetTiles.some((t) => t.userData.energy);
        if (hasExistingEnergy) {
          clearEnergySelection(scene);
          return;
        }

        const previousEnergies = targetTiles.map((t) => t.userData.energy || null);

        targetTiles.forEach((t) => {
          if (t.userData.energy) {
            scene.remove(t.userData.energy);
            t.userData.energy = null;
          }
        });

        if (!canBuildBuilding(State.currentEnergyType, 'energy')) {
          alert('Not enough money!');
          clearEnergySelection(scene);
          return;
        }

        const energy = buildEnergy(tile, State.currentEnergyType, getRotation(), targetTiles, scene);
        
        if (energy && buildBuildingWithRules(energy, State.currentEnergyType, 'energy', targetTiles)) {
          removePreviewEnergy(scene);
          clearEnergySelection(scene);

          pushAction({
            type: "energy",
            tile: targetTiles[0],
            tiles: targetTiles,
            previousEnergies,
            newEnergy: energy,
          });
        } else {
          scene.remove(energy);
          clearEnergySelection(scene);
        }
      } else if (State.isBuildEntertainmentMode) {
        const selectedTile = getEntertainmentSelectedTile();
        
        if (!selectedTile) {
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentEntertainmentType, "entertainment");
          const canPlace = !targetTiles.some((t) => t.userData.entertainment || t.userData.house || t.userData.energy || isRoadTile(t));
          
          setEntertainmentSelectedTile(tile, getRotation(), State.currentEntertainmentType, scene);
          createPreviewEntertainment(tile, getRotation(), State.currentEntertainmentType, State.isBuildEntertainmentMode, scene);
          
          if (!canPlace) {
            return;
          }
          return;
        }
        
        const selectedTiles = getEntertainmentSelectedTiles();
        const isInSelectedTiles = selectedTiles.some((t) => 
          Math.abs(t.position.x - tile.position.x) < 0.1 && 
          Math.abs(t.position.z - tile.position.z) < 0.1
        );
        if (!isInSelectedTiles) {
          clearEntertainmentSelection(scene);
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentEntertainmentType, "entertainment");
          const canPlace = !targetTiles.some((t) => t.userData.entertainment || t.userData.house || t.userData.energy || isRoadTile(t));
          if (canPlace) {
            setEntertainmentSelectedTile(tile, getRotation(), State.currentEntertainmentType, scene);
            createPreviewEntertainment(tile, getRotation(), State.currentEntertainmentType, State.isBuildEntertainmentMode, scene);
          }
          return;
        }
        
        const targetTiles = selectedTiles;
        const hasExistingEntertainment = targetTiles.some((t) => t.userData.entertainment);
        if (hasExistingEntertainment) {
          clearEntertainmentSelection(scene);
          return;
        }

        const previousEntertainments = targetTiles.map((t) => t.userData.entertainment || null);

        targetTiles.forEach((t) => {
          if (t.userData.entertainment) {
            scene.remove(t.userData.entertainment);
            t.userData.entertainment = null;
          }
        });

        if (!canBuildBuilding(State.currentEntertainmentType, 'entertainment')) {
          alert('Not enough money!');
          clearEntertainmentSelection(scene);
          return;
        }

        const entertainment = buildEntertainment(tile, State.currentEntertainmentType, getRotation(), targetTiles, scene);
        
        if (entertainment && buildBuildingWithRules(entertainment, State.currentEntertainmentType, 'entertainment', targetTiles)) {
          removePreviewEntertainment(scene);
          clearEntertainmentSelection(scene);

          pushAction({
            type: "entertainment",
            tile: targetTiles[0],
            tiles: targetTiles,
            previousEntertainments,
            newEntertainment: entertainment,
          });
        } else {
          scene.remove(entertainment);
          clearEntertainmentSelection(scene);
        }
      } else if (State.isBuildStoreMode) {
        const selectedTile = getStoreSelectedTile();
        
        if (!selectedTile) {
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentStoreType, "store");
          const canPlace = !targetTiles.some((t) => t.userData.store || t.userData.house || t.userData.energy || t.userData.entertainment || isRoadTile(t));
          
          setStoreSelectedTile(tile, getRotation(), State.currentStoreType, scene);
          createPreviewStore(tile, getRotation(), State.currentStoreType, State.isBuildStoreMode, scene);
          
          if (!canPlace) {
            return;
          }
          return;
        }
        
        const selectedTiles = getStoreSelectedTiles();
        const isInSelectedTiles = selectedTiles.some((t) => 
          Math.abs(t.position.x - tile.position.x) < 0.1 && 
          Math.abs(t.position.z - tile.position.z) < 0.1
        );
        if (!isInSelectedTiles) {
          clearStoreSelection(scene);
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentStoreType, "store");
          const canPlace = !targetTiles.some((t) => t.userData.store || t.userData.house || t.userData.energy || t.userData.entertainment || isRoadTile(t));
          if (canPlace) {
            setStoreSelectedTile(tile, getRotation(), State.currentStoreType, scene);
            createPreviewStore(tile, getRotation(), State.currentStoreType, State.isBuildStoreMode, scene);
          }
          return;
        }
        
        const targetTiles = selectedTiles;
        const hasExistingStore = targetTiles.some((t) => t.userData.store);
        if (hasExistingStore) {
          clearStoreSelection(scene);
          return;
        }

        const previousStores = targetTiles.map((t) => t.userData.store || null);

        targetTiles.forEach((t) => {
          if (t.userData.store) {
            scene.remove(t.userData.store);
            t.userData.store = null;
          }
        });

        if (!canBuildBuilding(State.currentStoreType, 'store')) {
          alert('Not enough money!');
          clearStoreSelection(scene);
          return;
        }

        const store = buildStore(tile, State.currentStoreType, getRotation(), targetTiles, scene);
        
        if (store && buildBuildingWithRules(store, State.currentStoreType, 'store', targetTiles, tile)) {
          removePreviewStore(scene);
          clearStoreSelection(scene);

          pushAction({
            type: "store",
            tile: targetTiles[0],
            tiles: targetTiles,
            previousStores,
            newStore: store,
          });
        } else {
          scene.remove(store);
          clearStoreSelection(scene);
        }
      } else if (State.isBuildFacilitiesMode) {
        const selectedTile = getFacilitiesSelectedTile();
        
        if (!selectedTile) {
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentFacilitiesType, "facilities");
          const canPlace = !targetTiles.some((t) => t.userData.facilities || t.userData.house || t.userData.energy || t.userData.entertainment || t.userData.store || isRoadTile(t));
          
          setFacilitiesSelectedTile(tile, getRotation(), State.currentFacilitiesType, scene);
          createPreviewFacilities(tile, getRotation(), State.currentFacilitiesType, State.isBuildFacilitiesMode, scene);
          
          if (!canPlace) {
            return;
          }
          return;
        }
        
        const selectedTiles = getFacilitiesSelectedTiles();
        const isInSelectedTiles = selectedTiles.some((t) => 
          Math.abs(t.position.x - tile.position.x) < 0.1 && 
          Math.abs(t.position.z - tile.position.z) < 0.1
        );
        if (!isInSelectedTiles) {
          clearFacilitiesSelection(scene);
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentFacilitiesType, "facilities");
          const canPlace = !targetTiles.some((t) => t.userData.facilities || t.userData.house || t.userData.energy || t.userData.entertainment || t.userData.store || isRoadTile(t));
          if (canPlace) {
            setFacilitiesSelectedTile(tile, getRotation(), State.currentFacilitiesType, scene);
            createPreviewFacilities(tile, getRotation(), State.currentFacilitiesType, State.isBuildFacilitiesMode, scene);
          }
          return;
        }
        
        const targetTiles = selectedTiles;
        const hasExistingFacilities = targetTiles.some((t) => t.userData.facilities);
        if (hasExistingFacilities) {
          clearFacilitiesSelection(scene);
          return;
        }

        const previousFacilities = targetTiles.map((t) => t.userData.facilities || null);

        targetTiles.forEach((t) => {
          if (t.userData.facilities) {
            scene.remove(t.userData.facilities);
            t.userData.facilities = null;
          }
        });

        if (!canBuildBuilding(State.currentFacilitiesType, 'facilities')) {
          alert('Not enough money!');
          clearFacilitiesSelection(scene);
          return;
        }

        const facilities = buildFacilities(tile, State.currentFacilitiesType, getRotation(), targetTiles, scene);
        
        if (facilities && buildBuildingWithRules(facilities, State.currentFacilitiesType, 'facilities', targetTiles, tile)) {
          removePreviewFacilities(scene);
          clearFacilitiesSelection(scene);

          pushAction({
            type: "facilities",
            tile: targetTiles[0],
            tiles: targetTiles,
            previousFacilities,
            newFacilities: facilities,
          });
        } else {
          scene.remove(facilities);
          clearFacilitiesSelection(scene);
        }
      } else if (State.isBuildFactoryMode) {
        const selectedTile = getFactorySelectedTile();
        
        if (!selectedTile) {
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentFactoryType, "factory");
          const canPlace = !targetTiles.some((t) => t.userData.factory || t.userData.house || t.userData.energy || t.userData.entertainment || t.userData.store || t.userData.facilities || isRoadTile(t));
          
          setFactorySelectedTile(tile, getRotation(), State.currentFactoryType, scene);
          createPreviewFactory(tile, getRotation(), State.currentFactoryType, State.isBuildFactoryMode, scene);
          
          if (!canPlace) {
            return;
          }
          return;
        }
        
        const selectedTiles = getFactorySelectedTiles();
        const isInSelectedTiles = selectedTiles.some((t) => 
          Math.abs(t.position.x - tile.position.x) < 0.1 && 
          Math.abs(t.position.z - tile.position.z) < 0.1
        );
        if (!isInSelectedTiles) {
          clearFactorySelection(scene);
          const targetTiles = getTargetTiles(tile, getRotation(), State.currentFactoryType, "factory");
          const canPlace = !targetTiles.some((t) => t.userData.factory || t.userData.house || t.userData.energy || t.userData.entertainment || t.userData.store || t.userData.facilities || isRoadTile(t));
          if (canPlace) {
            setFactorySelectedTile(tile, getRotation(), State.currentFactoryType, scene);
            createPreviewFactory(tile, getRotation(), State.currentFactoryType, State.isBuildFactoryMode, scene);
          }
          return;
        }
        
        const targetTiles = selectedTiles;
        const hasExistingFactory = targetTiles.some((t) => t.userData.factory);
        if (hasExistingFactory) {
          clearFactorySelection(scene);
          return;
        }

        const previousFactories = targetTiles.map((t) => t.userData.factory || null);

        targetTiles.forEach((t) => {
          if (t.userData.factory) {
            scene.remove(t.userData.factory);
            t.userData.factory = null;
          }
        });

        if (!canBuildBuilding(State.currentFactoryType, 'factory')) {
          alert('Not enough money!');
          clearFactorySelection(scene);
          return;
        }

        const factory = buildFactory(tile, State.currentFactoryType, getRotation(), targetTiles, scene);
        
        if (factory && buildBuildingWithRules(factory, State.currentFactoryType, 'factory', targetTiles, tile)) {
          removePreviewFactory(scene);
          clearFactorySelection(scene);

          pushAction({
            type: "factory",
            tile: targetTiles[0],
            tiles: targetTiles,
            previousFactories,
            newFactory: factory,
          });
        } else {
          scene.remove(factory);
          clearFactorySelection(scene);
        }
      }
    }
  });

  let houseInfoPanel = null;
  let selectedHouse = null;
  let selectedFactory = null;
  let selectedStore = null;

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    
    if (State.isBuildRoadMode || State.isBuildHouseMode || State.isBuildEnergyMode || 
        State.isBuildEntertainmentMode || State.isBuildStoreMode || State.isBuildFacilitiesMode || 
        State.isBuildFactoryMode) {
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(grassTiles);
    
    if (intersects.length > 0) {
      const tile = intersects[0].object;
      
      if (tile.userData.house) {
        const house = tile.userData.house;
        selectedHouse = house;
        showHouseInfo(house);
        hideFactoryCoverage(scene);
        hideStoreCoverage(scene);
        selectedFactory = null;
        selectedStore = null;
      } else if (tile.userData.factory) {
        const factory = tile.userData.factory;
        selectedFactory = factory;
        showFactoryCoverage(factory, scene, tile);
        hideHouseInfo();
        hideStoreCoverage(scene);
        selectedHouse = null;
        selectedStore = null;
      } else if (tile.userData.store) {
        const store = tile.userData.store;
        selectedStore = store;
        showStoreCoverage(store, scene, tile);
        hideHouseInfo();
        hideFactoryCoverage(scene);
        selectedHouse = null;
        selectedFactory = null;
      } else if (tile.userData.facilities) {
        const facility = tile.userData.facilities;
        if (facility.userData.facilityData?.facilityType === FACILITIES_TYPES.BANK) {
          openBankDialog(facility);
        }
        hideHouseInfo();
        hideFactoryCoverage(scene);
        hideStoreCoverage(scene);
        selectedHouse = null;
        selectedFactory = null;
        selectedStore = null;
      } else {
        hideHouseInfo();
        hideFactoryCoverage(scene);
        hideStoreCoverage(scene);
        selectedHouse = null;
        selectedFactory = null;
        selectedStore = null;
      }
    } else {
      hideHouseInfo();
      hideFactoryCoverage(scene);
      hideStoreCoverage(scene);
      selectedHouse = null;
      selectedFactory = null;
      selectedStore = null;
    }
  });

  function showHouseInfo(house) {
    hideHouseInfo();
    
    const info = getHouseInfo(house);
    if (!info) return;

    houseInfoPanel = document.createElement('div');
    houseInfoPanel.className = 'house-info-panel';
    houseInfoPanel.innerHTML = `
      <h3>House Information</h3>
      <div class="house-info-item">
        <span class="house-info-label">Civilians:</span>
        <span class="house-info-value">${info.civilians}</span>
      </div>
      <div class="house-info-item">
        <span class="house-info-label">Bonus Money:</span>
        <span class="house-info-value">$${info.bonusMoney}/day</span>
      </div>
      <div class="house-info-item">
        <span class="house-info-label">Bonus Civilians:</span>
        <span class="house-info-value">+${info.bonusCivilians} (${info.storeBonus}%)</span>
      </div>
      <div class="house-info-item">
        <span class="house-info-label">Electricity Consumption:</span>
        <span class="house-info-value">${info.electricityConsumption.toLocaleString()} kwh</span>
      </div>
      <div class="house-info-item">
        <span class="house-info-label">Total Money Earned:</span>
        <span class="house-info-value">$${info.totalMoneyEarned}/day</span>
      </div>
      <div class="house-info-item">
        <span class="house-info-label">Factory Bonus:</span>
        <span class="house-info-value">+${info.factoryBonus}%</span>
      </div>
    `;
    
    document.body.appendChild(houseInfoPanel);
  }

  function hideHouseInfo() {
    if (houseInfoPanel) {
      document.body.removeChild(houseInfoPanel);
      houseInfoPanel = null;
    }
  }

}

