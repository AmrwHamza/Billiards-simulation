import * as THREE from "three";
import { Ball } from "./environment/Ball.ts";
import { Physics } from "./Physics/Physics.ts";
import { CameraController } from "./controls/CameraController";
import { ControlPanel } from "./controls/Control_Panel.ts";
import { Rack } from "./setup/rack";
import { CreatRenderer } from "./setup/renderer";
import { MainCamera } from "./setup/camera";
import { SetupWorld } from "./setup/world.ts";


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);


const camera = MainCamera.createCamera();
const world = SetupWorld.setupWorld(scene);
const renderer = CreatRenderer.createRenderer(camera);
const controller = new CameraController(camera, renderer.domElement);

const balls: Ball[] = [];

const ball = new Ball(-1, -0, 0.028575, 0.17, 0);

balls.push(ball);
scene.add(ball.mesh);
Rack.createRack(scene, balls);

const panel = new ControlPanel(ball, balls, world.cue);



let lastTime = performance.now();

function animate(time: number) {
  // const dt = (time - lastTime) / 1000;
  // lastTime = time;
const dt = 1 / 165;

  

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

  controller.update();
  panel.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate(lastTime);
