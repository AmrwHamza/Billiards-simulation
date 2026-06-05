import * as THREE from "three";
import { Table } from "./Table";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Ball } from "./Ball";
import { Physics } from "./Physics";
import { PhysicsVisualizer } from "./PhysicsVisualizer";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

camera.position.set(0,3, 1.5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const table = new Table(2.84, 1.42);
scene.add(table.mesh);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;



const balls: Ball[] = [];

const ball = new Ball(-1, 0.6, 0.028575, 0.17, 0xff0000);
ball.velocity.set(4.7,2, 0); 
// ball.angularVelocity.set(0,5,0);

balls.push(ball);
scene.add(ball.mesh);

// const ball2 = new Ball(0, 0.5, 0.028575,0.17 ,0xffffff);//0.17
// ball2.velocity.set(1.7,-0.7, 0);
// balls.push(ball2);
// scene.add(ball2.mesh);

// const ball3 = new Ball(1, 0.5, 0.028575,0.17 ,0xffffff);//0.17
// ball3.velocity.set(1.7,-0.7, 0);
// balls.push(ball3);
// scene.add(ball3.mesh);

for (let i = 0; i < 15; i++) {
  const b = new Ball(
    0.5 + i * 0.06,
   -0.5 + i * 0.06,
    0.028575,
    0.17,
    0xffff00
  );

  balls.push(b);
  scene.add(b.mesh);
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
  controls.update();
// debugVisualizer.update(ball);
   renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate(lastTime);
