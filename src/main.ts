import * as THREE from "three";
import { Table } from "./Table";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Ball } from "./Ball";
import { Physics } from "./Physics";
import { PhysicsVisualizer } from "./PhysicsVisualizer";
import { Lighting } from "./enviroment/Lighting";
import { Room } from "./enviroment/Room";
import { CameraController } from "./controls/CameraController";

import { ControlPanel } from "./controls/Control_Panel.ts";
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

camera.position.set(0,2, 1.5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controller = new CameraController(camera, renderer.domElement);
const table = new Table(2.84, 1.42);
scene.add(table.mesh);

Lighting.setupLighting(scene);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
// const cameraRig = new THREE.Group();
// scene.add(cameraRig);
// cameraRig.add(camera);
const room = new Room();
scene.add(room.mesh);

const balls: Ball[] = [];

const ball = new Ball(-1, -0, 0.028575, 0.17, 0);


balls.push(ball);
scene.add(ball.mesh);
const panel = new ControlPanel(ball);


const BALL_RADIUS = 0.028575; // الـ r الخاص بك
const BALL_MASS = 0.17;

const apexX = 0.5;  // نقطة بداية رأس المثلث طولياً
const apexY = 0.0;  // منتصف الطاولة عرضياً

// الترتيب الرسمي لكرات البلياردو (عشان تظهر الأرقام والألوان صحيحة)
const rackOrder = [
  1,
  9, 2,
  10, 8, 3,
  11, 4, 12, 5,
  13, 6, 14, 15, 7
];
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
    case 0: return [0];
    case 1: return [-r, r];
    case 2: return [-2 * r, 0, 2 * r];
    case 3: return [-3 * r, -r, r, 3 * r];
    case 4: return [-4 * r, -2 * r, 0, 2 * r, 4 * r];
    default: return [];
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



let lastTime = performance.now();

// const debugVisualizer = new PhysicsVisualizer(scene);

const FIXED_DT = 1 / 240;
function animate(time: number) {
//  const dt = Math.min(
//    (time-lastTime)/1000,
//    0.016
// );

//   lastTime = time;
for (let step = 0; step < 4; step++) {

  for (const ball of balls) {
    ball.update(FIXED_DT);
  }

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      Physics.resolveBallCollision(
        balls[i],
        balls[j]
      );
    }
  }
}

// const v = ball.velocity.length();
// const w = ball.angularVelocity.length();
// console.log(
//   "v",
//   v.x,
//   v.y,
//   "omega",
//   w.x,
//   w.y,
//   w.z
// );
// console.log(
//    "v=", v,
//    "wR=", w * ball.radius,
//    "diff=", v - w * ball.radius
// );
const slip = Physics.getSlipVector(ball);

// console.log(
//   "vx", ball.velocity.x,
//   "vy", ball.velocity.y,
//   "wx", ball.angularVelocity.x,
//   "wy", ball.angularVelocity.y,
//   "wz", ball.angularVelocity.z,
//   "slipx", slip.x,
//   "slipy", slip.y
// );

console.log(
  "v=", ball.velocity.length(),
  "omegaR=",
  Math.sqrt(
    ball.angularVelocity.x**2 +
    ball.angularVelocity.y**2
  ) * ball.radius,
  "slip=",
  Physics.getSlipVector(ball).length()
);
// console.log("Angular Velocity Vector:", ball.angularVelocity);
  // controls.update();
// debugVisualizer.update(ball);
   renderer.render(scene, camera);
controller.update();
  requestAnimationFrame(animate);
}

animate(lastTime);
