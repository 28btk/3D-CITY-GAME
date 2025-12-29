
import * as THREE from "three";

let sun = null;
let moon = null;
let sunLight = null;
let ambientLight = null;
let sceneRef = null;
let isDayMode = true;
let isAnimating = false;

function createSun(scene) {
  const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sunMaterial = new THREE.MeshStandardMaterial({
    color: 0xffeb3b, 
    emissive: 0xffeb3b,
    emissiveIntensity: 1.0,
  });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(0, -20, 0); 
  sun.visible = false;
  scene.add(sun);

  sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  sunLight.position.set(0, 20, 0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 100;
  sunLight.shadow.camera.left = -30;
  sunLight.shadow.camera.right = 30;
  sunLight.shadow.camera.top = 30;
  sunLight.shadow.camera.bottom = -30;
  sunLight.visible = false;
  scene.add(sunLight);
}

function createMoon(scene) {
  const moonGeometry = new THREE.SphereGeometry(1.5, 32, 32);
  const moonMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    emissive: 0x888888,
    emissiveIntensity: 0.3,
  });
  moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(0, 20, 0); 
  moon.visible = false;
  scene.add(moon);
}


function animateRise(object, startPos, endPos, centerPos, duration = 5000, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const { onUpdate, onComplete } = options;

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); 
      
      const angle = easeProgress * Math.PI;
      const t = easeProgress;
      
      const currentPos = new THREE.Vector3();
      currentPos.x = startPos.x + (endPos.x - startPos.x) * t;
      currentPos.y = centerPos.y + Math.sin(angle) * (endPos.y - centerPos.y);
      currentPos.z = startPos.z + (endPos.z - startPos.z) * t;

      object.position.copy(currentPos);
      
      if (onUpdate) {
        onUpdate(currentPos, easeProgress, progress);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
        resolve();
      }
    }

    animate();
  });
}

function animateSet(object, startPos, endPos, centerPos, duration = 5000, speedMultiplier = 1) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const adjustedProgress = Math.min(progress * speedMultiplier, 1);
      const easeProgress = Math.pow(adjustedProgress, 2); 
      

      const angle = (1 - easeProgress) * Math.PI;
      const t = easeProgress;
      
      const currentPos = new THREE.Vector3();
      currentPos.x = startPos.x + (endPos.x - startPos.x) * t;

      const baseY = startPos.y + (endPos.y - startPos.y) * t;
      const arcOffset = -Math.sin(angle) * (centerPos.y - startPos.y);
      currentPos.y = baseY + arcOffset;
      currentPos.z = startPos.z + (endPos.z - startPos.z) * t;

      object.position.copy(currentPos);

      if (adjustedProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    animate();
  });
}

// Animation mặt trời mọc (5 giây) - di chuyển theo vòng cung từ trái sang phải
function animateSunrise(duration = 5000) {
  return new Promise(async (resolve) => {
    if (isAnimating) return;
    isAnimating = true;

    const skyColorStart = new THREE.Color(0x1a1a2e); // Màu đêm
    const skyColorEnd = new THREE.Color(0x87ceeb); // Màu xanh nước biển

    // Mặt trời mọc từ trái sang phải, đi lên
    const sunStartPos = new THREE.Vector3(-30, -20, 0);
    const sunEndPos = new THREE.Vector3(30, 50, 0);
    const sunCenterPos = new THREE.Vector3(0, 30, 0);

    // Mặt trăng lặn từ vị trí hiện tại đi xuống
    const moonWasVisible = moon.visible;
    let moonSetPromise = Promise.resolve();
    if (moonWasVisible) {
      const moonStartPos = moon.position.clone();
      const moonEndPos = new THREE.Vector3(moonStartPos.x, -20, moonStartPos.z);
      const moonCenterPos = new THREE.Vector3(
        (moonStartPos.x + moonEndPos.x) / 2,
        (moonStartPos.y + moonEndPos.y) / 2 + 20, // Điểm giữa với độ cao
        (moonStartPos.z + moonEndPos.z) / 2
      );
      moonSetPromise = animateSet(moon, moonStartPos, moonEndPos, moonCenterPos, duration, 2.5).then(() => {
        moon.visible = false;
      });
    }

    // Mặt trời mọc
    const sunColorStartRise = new THREE.Color(0xff9800); // Cam/đỏ (bình minh)
    const sunColorEndRise = new THREE.Color(0xffeb3b); // Vàng
    await Promise.all([
      animateRise(sun, sunStartPos, sunEndPos, sunCenterPos, duration, {
        onUpdate: (currentPos, easeProgress, progress) => {
          sunLight.position.set(currentPos.x, currentPos.y + 5, currentPos.z);
          
          if (currentPos.y > -10) {
            sun.visible = true;
            sunLight.visible = true;
          }
          
          // Đổi màu mặt trời từ cam/đỏ sang vàng (bình minh)
          if (progress < 0.7) {
            const colorProgress = progress / 0.7;
            sun.material.color.lerpColors(sunColorStartRise, sunColorEndRise, colorProgress);
          }
          
          sunLight.intensity = easeProgress * 1.5;
          if (ambientLight) {
            ambientLight.intensity = 0.3 + easeProgress * 0.4;
          }

          if (sceneRef) {
            const skyColor = new THREE.Color();
            skyColor.lerpColors(skyColorStart, skyColorEnd, easeProgress);
            sceneRef.background = skyColor;
          }
        }
      }),
      moonSetPromise
    ]);

    isAnimating = false;
    resolve();
  });
}

// Animation mặt trời lặn và mặt trăng mọc - di chuyển theo vòng cung từ trái sang phải
function animateSunset(duration = 5000) {
  return new Promise(async (resolve) => {
    if (isAnimating) return;
    isAnimating = true;

    const sunColorStart = new THREE.Color(0xffeb3b); // Vàng
    const sunColorEnd = new THREE.Color(0xff5722); // Cam đỏ (hoàng hôn)
    const skyColorStart = new THREE.Color(0x87ceeb); // Xanh nước biển
    const skyColorEnd = new THREE.Color(0x1a1a2e); // Màu đêm

    // Mặt trời lặn từ vị trí hiện tại đi xuống
    const sunStartPos = sun.position.clone();
    const sunEndPos = new THREE.Vector3(sunStartPos.x, -20, sunStartPos.z);
    const sunCenterPos = new THREE.Vector3(
      (sunStartPos.x + sunEndPos.x) / 2,
      (sunStartPos.y + sunEndPos.y) / 2 + 20, // Điểm giữa với độ cao
      (sunStartPos.z + sunEndPos.z) / 2
    );

    // Mặt trăng mọc từ trái sang phải, đi lên
    const moonStartPos = new THREE.Vector3(-30, -20, 0);
    const moonEndPos = new THREE.Vector3(30, 50, 0);
    const moonCenterPos = new THREE.Vector3(0, 30, 0);
    moon.visible = false;

    // Chạy cả hai animation cùng lúc
    await Promise.all([
      animateSet(sun, sunStartPos, sunEndPos, sunCenterPos, duration, 2.5).then(() => {
        sun.visible = false;
        sunLight.visible = false;
        sun.material.color.copy(sunColorStart);
      }),
      animateRise(moon, moonStartPos, moonEndPos, moonCenterPos, duration, {
        onUpdate: (currentPos, easeProgress, progress) => {
          if (currentPos.y > -10) {
            moon.visible = true;
          }

          // Đổi màu mặt trời từ vàng sang cam
          if (progress < 0.7) {
            const colorProgress = progress / 0.7;
            sun.material.color.lerpColors(sunColorStart, sunColorEnd, colorProgress);
          }

          // Đổi màu bầu trời từ xanh sang đêm
          if (sceneRef) {
            const skyColor = new THREE.Color();
            skyColor.lerpColors(skyColorStart, skyColorEnd, easeProgress);
            sceneRef.background = skyColor;
          }

          // Tắt ánh sáng dần
          const sunProgress = Math.min(progress * 2.5, 1);
          sunLight.intensity = 1.5 * (1 - sunProgress);
          if (ambientLight) {
            ambientLight.intensity = 0.7 - easeProgress * 0.4;
          }

          if (currentPos.y < 0) {
            sunLight.intensity = 0;
          }
        }
      })
    ]);

    isAnimating = false;
    resolve();
  });
}

// Khởi tạo hệ thống ngày/đêm
export async function initDayNight(scene, ambientLightRef) {
  sceneRef = scene;
  ambientLight = ambientLightRef;
  createSun(scene);
  createMoon(scene);
  
  // Đặt mặt trăng ở vị trí ban đầu (ẩn)
  moon.position.set(-30, 50, 0);
  moon.visible = false;
  
  // Đặt màu bầu trời đêm ban đầu
  scene.background = new THREE.Color(0x1a1a2e);
  
  if (ambientLight) {
    ambientLight.intensity = 0.3;
  }
  
  isDayMode = false; // Bắt đầu ở đêm để mọc mặt trời
  // Gọi hàm mọc mặt trời khi khởi tạo
  await animateSunrise();
  isDayMode = true;
}

// Chuyển sang chế độ ngày
export async function switchToDay() {
  if (isDayMode || isAnimating) return;
  isDayMode = true;
  await animateSunrise();
}

// Chuyển sang chế độ đêm
export async function switchToNight() {
  if (!isDayMode || isAnimating) return;
  isDayMode = false;
  await animateSunset();
}

// Toggle ngày/đêm
export async function toggleDayNight() {
  if (isDayMode) {
    await switchToNight();
  } else {
    await switchToDay();
  }
  return isDayMode;
}

// Callback được gọi sau khi hoàn thành 1 ngày
let onDayCompleteCallback = null;

export function setOnDayCompleteCallback(callback) {
  onDayCompleteCallback = callback;
}

// Kết thúc ngày: chuyển sang đêm, sau 5s tự động chuyển sang ngày
export async function endDay() {
  if (!isDayMode || isAnimating) return;
  
  // Chuyển sang đêm
  await switchToNight();
  
  // Đợi 5 giây
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Tự động chuyển sang ngày
  await switchToDay();
  
  if (onDayCompleteCallback) {
    onDayCompleteCallback();
  }
}

// Lấy trạng thái hiện tại
export function getIsDayMode() {
  return isDayMode;
}

