import * as THREE from "three";
import { Table } from "./environment/Table.ts";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Ball } from "./environment/Ball.ts";
import { Physics } from "./Physics/Physics.ts";
// import { PhysicsVisualizer } from "./PhysicsVisualizer";
import { Lighting } from "./environment/Lighting.ts";
import { Room } from "./environment/Room.ts";
import { CameraController } from "./controls/CameraController";

import { ControlPanel } from "./controls/Control_Panel.ts";
import { CueStick } from "./environment/Cue_Stick.ts";
import { createRack } from "./setup/rack";
import { createRenderer } from "./setup/renderer";
import { setupWorld } from "./setup/world";
import { createCamera } from "./setup/camera";
import { PhysicsVisualizer } from "./controls/PhysicsVisualizer.ts";

//المشهد
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
//////////////////////////

//الكاميرا
const camera = createCamera();
const world = setupWorld(scene);
const renderer = createRenderer(camera);
const controller = new CameraController(camera, renderer.domElement);

const balls: Ball[] = [];

//الكرة البيضا
const ball = new Ball(-1, -0, 0.028575, 0.17, 0);
balls.push(ball);
scene.add(ball.mesh);
/////////////////////////////
createRack(scene, balls);
//لوجة التحكم
const panel = new ControlPanel(ball, balls, world.cue);
/////////////////

//الاسهم التوضيحية
const debugVisualizer = new PhysicsVisualizer(scene);
////////////////

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
  debugVisualizer.update(ball);
  controller.update();
  panel.update();
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}
animate(lastTime);
