import * as THREE from "three";
import { Table } from "./enviroment/Table.ts";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Ball } from "./enviroment/Ball.ts";
import { Physics } from "./Physics";
// import { PhysicsVisualizer } from "./PhysicsVisualizer";
import { Lighting } from "./enviroment/Lighting";
import { Room } from "./enviroment/Room";
import { CameraController } from "./controls/CameraController";

import { ControlPanel } from "./controls/Control_Panel.ts";
import { CueStick } from "./enviroment/Cue_Stick.ts";

//المشهد
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
//////////////////////////

//الكاميرا
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 2.8, 0);
camera.lookAt(0, 0, 0);
///////////////////

// الستيك
const cue = new CueStick();
scene.add(cue.group);
////////////

//الطاولة
const table = new Table(2.84, 1.42);
scene.add(table.mesh);
//////////////////

//البناء
const room = new Room();
scene.add(room.mesh);
/////////////////

//الاسهم التوضيحية
// const debugVisualizer = new PhysicsVisualizer(scene);
////////////////

//الرندرة
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
// document.body.appendChild(renderer.domElement);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.autoUpdate = true;
renderer.shadowMap.needsUpdate = true;
////////////

const controller = new CameraController(camera, renderer.domElement);

Lighting.setupLighting(scene);

const balls: Ball[] = [];

//الكرة البيضا
const ball = new Ball(-1, -0, 0.028575, 0.17, 0);
balls.push(ball);
scene.add(ball.mesh);
/////////////////////////////

const BALL_RADIUS = 0.028575; // الـ r الخاص بك
const BALL_MASS = 0.17;

const apexX = 0.5; // نقطة بداية رأس المثلث طولياً
const apexY = 0.0; // منتصف الطاولة عرضياً

const rackOrder = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 15, 7];
let ballIndex = 0;

// 1. الدالة الأولى: تحسب موقع الصف (طولياً) بناءً على رقم الصف
function getRowX(rowNumber: number): number {
  // استخدام جذر 3 للتلامس المثالي بين الصفوف
  return apexX + rowNumber * (Math.sqrt(3) * BALL_RADIUS);
}

// 2. الدالة الثانية: تعطينا الانحرافات العرضية لكل كرة (نفس فكرة الـ switch بالجافا)
function getRowYOffsets(rowNumber: number): number[] {
  const r = BALL_RADIUS;
  switch (rowNumber) {
    case 0:
      return [0];
      case 1:
        return [-r, r];
        case 2:
          return [-2 * r, 0, 2 * r];
          case 3:
      return [-3 * r, -r, r, 3 * r];
    case 4:
      return [-4 * r, -2 * r, 0, 2 * r, 4 * r];
      default:
      return [];
    }
  }
  
  // 3. التطبيق بلفة بسيطة ومفهومة جداً بالنظر
  for (let row = 0; row < 5; row++) {
    const x = getRowX(row); // تحديد موقع الصف الحالي على الطاولة
    
    // اللفة الداخلية تقرأ مصفوفة الانحرافات الخاصة بالصف
    for (const yOffset of getRowYOffsets(row)) {
      const id = rackOrder[ballIndex];
      const y = apexY + yOffset; // حساب الموقع العرضي الفعلي للكرة
      
    // إنشاء الكرة وإضافتها للمحاكاة
    const b = new Ball(x, y, BALL_RADIUS, BALL_MASS, id);
    balls.push(b);
    scene.add(b.mesh);
    
    ballIndex++;
  }
}

//لوجة التحكم
const panel = new ControlPanel(ball,balls, cue);
/////////////////



let lastTime = performance.now();

const FIXED_DT = 1 / 240;


function animate(time: number) {

  const dt = (time - lastTime) / 1000;
  lastTime = time;

  for (let step = 0; step < 4; step++) {
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.update(FIXED_DT);

      if (b.id !== 0 && Physics.checkHoleCollision(b)) {
        scene.remove(b.mesh);
        balls.splice(i, 1);
      }
    }

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        Physics.resolveBallCollision(balls[i], balls[j]);
      }
    }
  }



  // 🔥 هون الحل

  controller.update();
  panel.update();
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate(lastTime);
