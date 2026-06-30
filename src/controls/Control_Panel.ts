import { GUI } from "lil-gui";
import * as THREE from "three";
import { Ball } from "../enviroment/Ball";
import { CueStick } from "../enviroment/Cue_Stick";

export class ControlPanel {
  private gui: GUI;
  private targetBall: Ball;
  private cue: CueStick;
  private keysPressed: { [key: string]: boolean } = {};

  // مرجع للسلايدرات لتحديثها برمجياً
  private angleController: any;
  private powerController: any;

  private config = {
    angleDeg: 0,
    power: 0,
    shoot: () => this.triggerShot(),
  };

  constructor(ball: Ball, cue: CueStick) {
    this.targetBall = ball;
    this.cue = cue;

    this.gui = new GUI({ title: "لوحة التحكم" });
    this.gui.domElement.style.width = "400px";
    this.gui.domElement.style.fontSize = "16px";

    // إضافة مستمعي الكيبورد
    window.addEventListener("keydown", (e) => (this.keysPressed[e.key] = true));
    window.addEventListener("keyup", (e) => (this.keysPressed[e.key] = false));

    this.setupUI();
  }

  private setupUI() {
    const folder = this.gui.addFolder("التحكم بالعصا");

    // تخزين المراجع (Controllers) في متغيرات لتحديثها لاحقاً
    this.angleController = folder
      .add(this.config, "angleDeg", 0, 360, 0.1)
      .name("الزاوية");
    this.powerController = folder
      .add(this.config, "power", 0, 6, 0.1)
      .name("القوة");

    folder.add(this.config, "shoot").name("إطلاق");
    folder.open();
  }

  public update() {
    const speed = 0.3;
    let changed = false;
    const powerStep = 0.02;
    if (this.keysPressed["ArrowRight"]) {
      this.config.angleDeg = (this.config.angleDeg + speed) % 360;
      changed = true;
    }
    if (this.keysPressed["ArrowLeft"]) {
      // نستخدم 360 + القيمة لنضمن عدم ظهور أرقام سالبة عند الطرح
      this.config.angleDeg = (this.config.angleDeg - speed + 360) % 360;
      changed = true;
    }

    // القوة تبقى كما هي (بين 0 و 15)
    if (this.keysPressed["ArrowUp"]) {
      this.config.power = Math.min(this.config.power + powerStep, 6);
      changed = true;
    }
    if (this.keysPressed["ArrowDown"]) {
      this.config.power = Math.max(this.config.power - powerStep, 0);
      changed = true;
    }

    if (changed) {
      this.angleController.updateDisplay();
      this.powerController.updateDisplay();
    }

    const angleRad = THREE.MathUtils.degToRad(this.config.angleDeg);
    this.cue.update(this.targetBall, angleRad, this.config.power);
  }

  private triggerShot() {
    const angleRad = THREE.MathUtils.degToRad(this.config.angleDeg);

    const vx = this.config.power * Math.cos(angleRad);
    const vy = -this.config.power * Math.sin(angleRad);

    this.targetBall.velocity.set(vx, vy, 0);
    this.cue.hide();

    setTimeout(() => {
      this.cue.show();
    }, 4000);

    console.log("Shot:", vx, vy);
  }
}
