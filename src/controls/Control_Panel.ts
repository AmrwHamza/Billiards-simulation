import { GUI } from "lil-gui";
import * as THREE from "three";
import { Ball } from "../enviroment/Ball";
import { CueStick } from "../enviroment/Cue_Stick";
import { Physics } from "../Physics"; // استيراد كلاس الفيزياء للوصول للثوابت

export class ControlPanel {
  private gui: GUI;
  private targetBall: Ball;
  private balls: Ball[]; // مصفوفة الكرات
  private cue: CueStick;
  private keysPressed: { [key: string]: boolean } = {};

  private angleController: any;
  private powerController: any;

  private config = {
    angleDeg: 0,
    power: 0,
    shoot: () => this.triggerShot(),
  };

  constructor(ball: Ball, balls: Ball[], cue: CueStick) {
    this.targetBall = ball;
    this.balls = balls;
    this.cue = cue;

    this.gui = new GUI({ title: "لوحة التحكم" });
    this.gui.domElement.style.width = "400px";
    
    window.addEventListener("keydown", (e) => (this.keysPressed[e.key] = true));
    window.addEventListener("keyup", (e) => (this.keysPressed[e.key] = false));

    this.setupUI();
    this.setupPhysicsUI(); // إضافة إعدادات الفيزياء
  }

  private setupUI() {
    const folder = this.gui.addFolder("التحكم بالعصا");
    this.angleController = folder.add(this.config, "angleDeg", 0, 360, 0.1).name("الزاوية");
    this.powerController = folder.add(this.config, "power", 0, 6, 0.1).name("القوة");
    folder.add(this.config, "shoot").name("إطلاق");
    folder.open();
  }

  private setupPhysicsUI() {
    const folder = this.gui.addFolder("إعدادات الفيزياء والكتل");

    // 1. إعدادات الاحتكاك (تعديل مباشر على كلاس الفيزياء)
    folder.add(Physics, 'friction', 0, 1, 0.01).name("احتكاك الأرضية");
    folder.add(Physics, 'rollingResistance', 0, 0.05, 0.001).name("مقاومة التدحرج");

    // 2. سلايدر الكتلة الجماعي
    const masterMass = { allMass: 0.17 };
    folder.add(masterMass, 'allMass', 0.1, 0.5, 0.01)
      .name("تغيير كتلة الكل")
      .onChange((val: number) => {
        this.balls.forEach(b => b.mass = val);
        // تحديث عرض السلايدرات الفردية إذا كانت مفتوحة
        individualFolder.controllers.forEach(c => c.updateDisplay());
      });

    // 3. سلايدرات الكتلة الفردية
    const individualFolder = folder.addFolder("كتلة كل كرة على حدة");
    this.balls.forEach((ball) => {
      individualFolder.add(ball, 'mass', 0.1, 0.5, 0.01)
        .name(`الكرة ${ball.id}`);
    });
    console.log(this.balls.map(b => b.id));
  }

  public update() {
    // ... (منطق التحكم بالعصا كما هو)
    const speed = 0.3;
    let changed = false;
    const powerStep = 0.02;
    if (this.keysPressed["ArrowRight"]) { this.config.angleDeg = (this.config.angleDeg + speed) % 360; changed = true; }
    if (this.keysPressed["ArrowLeft"]) { this.config.angleDeg = (this.config.angleDeg - speed + 360) % 360; changed = true; }
    if (this.keysPressed["ArrowUp"]) { this.config.power = Math.min(this.config.power + powerStep, 6); changed = true; }
    if (this.keysPressed["ArrowDown"]) { this.config.power = Math.max(this.config.power - powerStep, 0); changed = true; }

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
    setTimeout(() => { this.cue.show(); }, 4000);
  }
}