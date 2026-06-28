import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private dom: HTMLElement;

  public orbit: OrbitControls;

  private move = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  private speed = 0.01; // قمت بزيادة السرعة قليلاً لتجوال أفضل

  constructor(camera: THREE.PerspectiveCamera, dom: HTMLElement) {
    this.camera = camera;
    this.dom = dom;

    // 🖱️ إعدادات التحكم بالماوس (الدوران)
    this.orbit = new OrbitControls(camera, dom);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.05;
    this.orbit.target.set(0, 0, 0); // البداية تكون عند الطاولة

    // ⌨️ الاستماع للأزرار
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
    // 1️⃣ استخراج الاتجاه الذي تنظر إليه الكاميرا حالياً (اتجاه الأمام)
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    
    // 💡 ميزة اختيارية: تصفير المحور العمودي (Y) لكي يظل المشي أفقياً على الأرض
    // ولا تطير الكاميرا لأعلى أو أسفل إذا كنت تنظر للسقف أو الأرض
    forward.y = 0; 
    forward.normalize();

    // 2️⃣ حساب اتجاه اليمين بناءً على اتجاه الأمام والاتجاه العلوي للكاميرا
    const right = new THREE.Vector3();
    right.crossVectors(forward, this.camera.up).normalize();

    // 3️⃣ بناء متجه الحركة بناءً على الأزرار المضغوطة واتجاهات الكاميرا الحالية
    const moveVec = new THREE.Vector3();

    if (this.move.forward)  moveVec.add(forward);
    if (this.move.backward) moveVec.sub(forward);
    if (this.move.right)    moveVec.add(right);
    if (this.move.left)     moveVec.sub(right);

    // 4️⃣ تطبيق الحركة إذا كان هناك أي زر مضغوط
    if (moveVec.lengthSq() > 0) {
      moveVec.normalize().multiplyScalar(this.speed);

      // 🌟 الخطوة السحرية: تحريك الكاميرا وتحريك هدف دوران الماوس معاً!
      // هذا يضمن أن مركز دوران الماوس ينتقل معك أينما مشيت في المقهى
      this.camera.position.add(moveVec);
      this.orbit.target.add(moveVec); 
    }

    
    this.orbit.update();
  }
}