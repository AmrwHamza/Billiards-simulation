import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class CameraController {
  private camera: THREE.PerspectiveCamera;
 

  public orbit: OrbitControls;

  private move = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  private speed = 0.007;


  constructor(camera: THREE.PerspectiveCamera, dom: HTMLElement) {
    this.camera = camera;
    

    this.orbit = new OrbitControls(camera, dom);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.target.set(0, 0, 0);

    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent) {
    switch (e.code) {
      case "KeyW": this.move.forward = true; break;
      case "KeyS": this.move.backward = true; break;
      case "KeyA": this.move.left = true; break;
      case "KeyD": this.move.right = true; break;
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    switch (e.code) {
      case "KeyW": this.move.forward = false; break;
      case "KeyS": this.move.backward = false; break;
      case "KeyA": this.move.left = false; break;
      case "KeyD": this.move.right = false; break;
    }
  }

  update() {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    
    forward.y = 0; 
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, this.camera.up).normalize();

    const moveVec = new THREE.Vector3();

    if (this.move.forward)  moveVec.add(forward);
    if (this.move.backward) moveVec.sub(forward);
    if (this.move.right)    moveVec.add(right);
    if (this.move.left)     moveVec.sub(right);

    if (moveVec.lengthSq() > 0) {
      moveVec.normalize().multiplyScalar(this.speed);

      this.camera.position.add(moveVec);
      this.orbit.target.add(moveVec); 
    }

    
    this.orbit.update();
  }
}