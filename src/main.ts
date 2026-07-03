import * as THREE from "three";

import { Ball } from "./environment/Ball.ts";
import { Physics } from "./Physics/Physics.ts";
import { CameraController } from "./controls/CameraController";
import { ControlPanel } from "./controls/Control_Panel.ts";
import { Rack } from "./setup/rack";
import { CreatRenderer } from "./setup/renderer";
import { MainCamera } from "./setup/camera";
import { SetupWorld } from "./setup/world.ts";
import { DataRecorder } from "./DataRecorder";
//المشهد
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
//////////////////////////
// const axesHelper = new THREE.AxesHelper(1);
// scene.add(axesHelper);
//الكاميرا
const camera = MainCamera.createCamera();
const world = SetupWorld.setupWorld(scene);
const renderer = CreatRenderer.createRenderer(camera);
const controller = new CameraController(camera, renderer.domElement);

const balls: Ball[] = [];

//الكرة البيضا
const ball = new Ball(-1, -0, 0.028575, 0.17, 0);
// const ball = new Ball(-1.3, -0, 0.028575, 0.17, 0);
balls.push(ball);
scene.add(ball.mesh);
/////////////////////////////
// Rack.createRack(scene, balls);
//لوجة التحكم
// const panel = new ControlPanel(ball, balls, world.cue);
const recorder = new DataRecorder();

const panel = new ControlPanel(ball, balls, world.cue, recorder);
/////////////////

//الاسهم التوضيحية
// const debugVisualizer = new PhysicsVisualizer(scene);
////////////////

let lastTime = performance.now();
function animate(time: number) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    b.update(dt);

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

console.log("Ball speed:", ball.velocity.length());

  
 

  controller.update();
  panel.update(dt);
  renderer.render(scene, camera);

  
  requestAnimationFrame(animate);
}
animate(lastTime);
