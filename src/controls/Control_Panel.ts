import { GUI } from "lil-gui";
import * as THREE from "three";
import { Ball } from "../Ball";
import { CueStick } from "../enviroment/Cue_Stick";

export class ControlPanel {
  private gui: GUI;
  private targetBall: Ball;
  private cue: CueStick;

  private config = {
    angleDeg: 0,
    power: 0,
    shoot: () => this.triggerShot()
  };

  constructor(ball: Ball, cue: CueStick) {
    this.targetBall = ball;
    this.cue = cue;

    this.gui = new GUI({ title: "لوحة التحكم" });
    this.gui.domElement.style.width = '500px';
this.gui.domElement.style.fontSize = '16px';
    this.setupUI();
  }

  private setupUI() {
    const folder = this.gui.addFolder("التحكم بالعصا");

    folder
      .add(this.config, "angleDeg", 0, 360, 1)
      .name("الزاوية");

    folder
      .add(this.config, "power", 0, 20, 0.1)
      .name("القوة");

    folder
      .add(this.config, "shoot")
      .name("إطلاق");

    folder.open();
  }

  public update() {
    const angleRad = THREE.MathUtils.degToRad(this.config.angleDeg);

    this.cue.update(
      this.targetBall,
      angleRad,
      this.config.power
    );
  }

  private triggerShot() {
    const angleRad = THREE.MathUtils.degToRad(this.config.angleDeg);

    const vx = this.config.power * Math.cos(angleRad);
    const vy = -this.config.power * Math.sin(angleRad);

    this.targetBall.velocity.set(vx, vy, 0);

 this.cue.hide();

  setTimeout(() => {
    this.cue.show();
  }, 5000);

    console.log("Shot:", vx, vy);
  }
}