import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Ball } from "./Ball";

export class CueStick {
  public group: THREE.Group;
  private model: THREE.Group | null = null;
  private loader: GLTFLoader;

  private static readonly MODEL_PATH = "/models/Cue stick/billiard_cue.glb";

  constructor() {
    this.group = new THREE.Group();
    this.loader = new GLTFLoader();
    this.loadModel();
  }

  private loadModel() {
    this.loader.load(
      CueStick.MODEL_PATH,
      (gltf) => {
        this.model = gltf.scene;
        const box = new THREE.Box3().setFromObject(this.model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        console.log("SIZE:", size);
        console.log("CENTER:", center);
        console.log("ROT:", this.model.rotation);
        this.model.scale.set(1, 1, 1);

        this.group.add(this.model);
      },
      undefined,
      (error) => {
        console.error("خطأ في تحميل عصا البلياردو:", error);
      },
    );
  }

  public update(ball: Ball, angle: number, power: number) {
    this.group.position.set(ball.position.x, ball.radius, ball.position.y);

    this.group.rotation.y = angle;

    if (this.model) {
      const cueLength = 1.508;
      const halfLength = cueLength / 2;

      const tipGap = 0.01;
      const offset = -(halfLength + ball.radius + tipGap);
      const pullBack = power * 0.03;
      this.model.position.set(offset - pullBack, 0, 0);

      //   this.model.position.set(baseOffset - pullBack, 0, 0);
    }
  }

  public hide() {
    this.group.visible = false;
  }

  public show() {
    this.group.visible = true;
  }
}
