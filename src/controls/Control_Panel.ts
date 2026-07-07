import { GUI } from "lil-gui";
import * as THREE from "three";
import { Ball } from "../environment/Ball";
import { CueStick } from "../environment/Cue_Stick";
import { Physics } from "../Physics/Physics";


export class ControlPanel {
  private gui: GUI;
  private targetBall: Ball;
  private balls: Ball[];
  private cue: CueStick;
  private keysPressed: { [key: string]: boolean } = {};


  private angleController: any;
  private velocityController: any;
  private massControllers: any[] = [];

  private config = {
    angleDeg: 0,
    velocity: 0,
    shoot: () => this.triggerShot(),
  };

  private monitoringFolder: any;
  private monitoringValues: Map<number, { v: number; w: number }> = new Map();

 
  constructor(ball: Ball, balls: Ball[], cue: CueStick) {
    this.targetBall = ball;
    this.balls = balls;
    this.cue = cue;

    this.gui = new GUI({ title: "لوحة التحكم" });
    this.gui.domElement.style.width = "400px";




    window.addEventListener("keydown", (e) => (this.keysPressed[e.key] = true));
    window.addEventListener("keyup", (e) => (this.keysPressed[e.key] = false));

    this.setupUI();
    this.setupPhysicsUI();
    this.setupMonitoring();
  }

  private setupUI() {
    const folder = this.gui.addFolder("التحكم بالعصا");

    this.angleController = folder
      .add(this.config, "angleDeg", -180, 180, 0.1)
      .name("الزاوية");

    this.velocityController = folder
      .add(this.config, "velocity", 0, 13, 0.1)
      .name("السرعة");

    folder.add(this.config, "shoot").name("إطلاق");


    folder.open();
  }

  private setupPhysicsUI() {
    const folder = this.gui.addFolder("إعدادات الفيزياء والكتل");

    folder.add(Physics, "friction", 0, 0.4, 0.01).name("احتكاك الأرضية");

    folder
      .add(Physics, "rollingResistance", 0, 0.05, 0.001)
      .name("مقاومة التدحرج");

    const masterMass = { allMass: 0.17 };

    folder
      .add(masterMass, "allMass", 0.1, 1.5, 0.01)
      .name("تغيير كتلة الكل")
      .onChange((val: number) => {
        this.balls.forEach((b) => (b.mass = val));
        this.massControllers.forEach((controller) =>
          controller.updateDisplay(),
        );
      });

    const individualFolder = folder.addFolder("كتلة كل كرة على حدة");

    this.balls.forEach((ball) => {
      const controller = individualFolder
        .add(ball, "mass", 0.1, 0.5, 0.01)
        .name(`الكرة ${ball.id}`);

      this.massControllers.push(controller);
    });

    folder.close();
    individualFolder.close();
  }

  private setupMonitoring() {
    this.monitoringFolder = this.gui.addFolder("مراقبة السرعات");

    this.balls.forEach((ball) => {
      const state = {
        v: 0,
        w: 0,
      };

      this.monitoringValues.set(ball.id, state);

      const sub = this.monitoringFolder.addFolder(`كرة ${ball.id}`);

      sub.add(state, "v").name("السرعة الخطية (m/s)").listen();
      sub.add(state, "w").name("السرعة الزاوية (rad/s)").listen();

      sub.close();
    });

    this.monitoringFolder.close();
  }

  public update() {////delete dt
    const speed = 0.012;
    const velocityStep = 0.02;

    let changed = false;

    if (this.keysPressed["ArrowRight"]) {
      this.config.angleDeg = (this.config.angleDeg + speed) % 360;
      changed = true;
    }

    if (this.keysPressed["ArrowLeft"]) {
      this.config.angleDeg = (this.config.angleDeg - speed + 360) % 360;
      changed = true;
    }

    if (this.keysPressed["ArrowUp"]) {
      this.config.velocity = Math.min(this.config.velocity + velocityStep, 6);
      changed = true;
    }

    if (this.keysPressed["ArrowDown"]) {
      this.config.velocity = Math.max(this.config.velocity - velocityStep, 0);
      changed = true;
    }

    if (changed) {
      this.angleController.updateDisplay();
      this.velocityController.updateDisplay();
    }

    const angleRad = THREE.MathUtils.degToRad(this.config.angleDeg);
    this.cue.update(this.targetBall, angleRad, this.config.velocity);


    this.updateMonitoring();
  }

  private updateMonitoring() {
    for (const ball of this.balls) {
      const state = this.monitoringValues.get(ball.id);
      if (!state) continue;

      state.v = Number(ball.velocity.length().toFixed(4));
      state.w = Number(ball.angularVelocity.length().toFixed(4));
    }
  }

private triggerShot() {
    const angleRad = THREE.MathUtils.degToRad(this.config.angleDeg);

     
    Physics.applyInitialShot(this.targetBall, angleRad, this.config.velocity);

  
    
    this.cue.hide();
    setTimeout(() => this.cue.show(), 4000);
}
}
