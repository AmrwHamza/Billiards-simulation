import * as THREE from "three";
import { Vector3 } from "../math/Vector3";
import { Physics } from "../Physics";

export class Ball {
  public radius: number;
  private _mass: number; // جعلها خاصة
  public position: Vector3;
  public velocity: Vector3;
  public acceleration: Vector3;
  public mesh: THREE.Mesh;
  public id: number; // رقم الكرة (0 للبيضاء، ومن 1 إلى 15 للبقية)

  public angularVelocity: Vector3;
  public angularAcceleration: Vector3;
  public torque: Vector3;
  public inertia: number;

  // تعريف لودر ثابت (Static) ليعاد استخدامه مع كل الكرات دون استهلاك الذاكرة
  private static textureLoader = new THREE.TextureLoader();

  constructor(
    x: number,
    y: number,
    radius: number,
    mass: number,
    id: number, // استبدال اللون بالـ id لاستدعاء الصورة المناسبة
  ) {
    this.radius = radius;
    this._mass = mass;
    this.id = id;

    // إعداد المتجهات الفيزيائية كما هي في كودك الأصلي
    this.position = new Vector3(x, y, this.radius);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);

    this.angularVelocity = new Vector3(0, 0, 0);
    this.angularAcceleration = new Vector3(0, 0, 0);
    this.torque = new Vector3(0, 0, 0);

    // حساب عزم القصور الذاتي (Moment of Inertia) للكرة
    this.inertia = (2 / 5) * this.mass * this.radius * this.radius;

    // 1. تحميل الصورة ديناميكياً من مجلد textures بناءً على الرقم
    // (تأكد من مطابقة صيغة الملف .png أو .jpg لما قمت بتحميله)
    const ballTexture = Ball.textureLoader.load(`textures/Ball_${id}.jpg`);

    // ضبط ترميز الألوان لتظهر بشكل صحيح ومشبع داخل محرك الرندر
    ballTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. إنشاء مجسم الكرة كقطعة واحدة خفيفة وتطبيق الخامة عليها
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      map: ballTexture, // ربط صورة الكرة المفرودة
      roughness: 0.15, // صقل السطح ليعطي لمعان كرات البلياردو الحقيقية
      metalness: 0.0,
      envMapIntensity: 1.2,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // مزامنة موقع المجسم الرسومي مع المتجهات الفيزيائية
    this.syncMesh();
  }

  public update(dt: number): void {
    Physics.update(this, dt);
    this.updateRotation(dt);
    this.syncMesh();
  }

  public syncMesh(): void {
    // ربط محاور الفيزياء بمحاور Three.js (تحويل Y للفيزياء إلى Z في الـ 3D لتبدو الطاولة أفقية)
    this.mesh.position.set(this.position.x, this.position.z, this.position.y);
  }

  public get mass(): number {
    return this._mass;
  }
  public set mass(value: number) {
    this._mass = value;
    // تحديث العزم تلقائياً عند تغيير الكتلة
    this.inertia = (2 / 5) * this._mass * this.radius * this.radius;
  }

  private updateRotation(dt: number): void {
    const w = this.angularVelocity.length();
    if (w < 0.0001) return;

    // تحديد محور الدوران في الفراغ ثلاثي الأبعاد
    const axis = new THREE.Vector3(
      this.angularVelocity.x,
      this.angularVelocity.z,
      this.angularVelocity.y,
    ).normalize();

    // حساب زاوية الدوران وتطبيقها مستخدمين الـ Quaternion لمنع مشكلة الـ Gimbal Lock
    const deltaRotation = new THREE.Quaternion();
    deltaRotation.setFromAxisAngle(axis, -w * dt);

    this.mesh.quaternion.premultiply(deltaRotation);
  }
}
