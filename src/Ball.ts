// import * as THREE from "three";
// import { Vector3 } from "./math/Vector3";
// import { Physics } from "./Physics";

// export class Ball {
//   public radius: number;
//   public mass: number;
//   public position: Vector3;
//   public velocity: Vector3;
//   public acceleration: Vector3;
//   public mesh: THREE.Mesh;
//   public color: THREE.ColorRepresentation | undefined;

//   public angularVelocity: Vector3;
//   public angularAcceleration: Vector3;
//   public torque: Vector3;
//   public inertia: number;
//   constructor(
//     x: number,
//     y: number,
//     radius: number,
//     mass: number,
//     color: THREE.ColorRepresentation,
//   ) {
//     this.radius = radius;
//     this.mass = mass;
//     this.position = new Vector3(x, y, this.radius);
//     this.velocity = new Vector3(0, 0, 0);
//     this.acceleration = new Vector3(0, 0, 0);

//     this.angularVelocity = new Vector3(0, 0, 0);
//     this.angularAcceleration = new Vector3(0, 0, 0);

//     this.torque = new Vector3(0, 0, 0);

//     this.inertia = (2 / 5) * this.mass * this.radius * this.radius;
//     const geometry = new THREE.SphereGeometry(this.radius, 32, 32);

//     const material = new THREE.MeshStandardMaterial({
//       color: color,
//     });

//     this.mesh = new THREE.Mesh(geometry, material);

//     const topGeometry = new THREE.SphereGeometry(
//       this.radius,
//       32,
//       32,
//       0,
//       Math.PI * 2,
//       0,
//       Math.PI / 2,
//     );
//     const topMaterial = new THREE.MeshStandardMaterial({
//       color: color,
//       roughness: 0.2,
//       metalness: 0.1,
//     });
//     const topHalf = new THREE.Mesh(topGeometry, topMaterial);
//     this.mesh.add(topHalf);

//     const marker = new THREE.Mesh(
//       new THREE.SphereGeometry(this.radius * 0.2),
//       new THREE.MeshBasicMaterial({ color: 0x000000 }),
//     );

//     marker.position.set(0, this.radius, 0);

//     this.mesh.add(marker);

//     const bottomGeometry = new THREE.SphereGeometry(
//       this.radius,
//       32,
//       32,
//       0,
//       Math.PI * 2,
//       Math.PI / 2,
//       Math.PI / 2,
//     );
//     const bottomMaterial = new THREE.MeshStandardMaterial({
//       color: 0xffffff, 
//       roughness: 0.2,
//       metalness: 0.1,
//     });
//     const bottomHalf = new THREE.Mesh(bottomGeometry, bottomMaterial);
//     this.mesh.add(bottomHalf);
//     this.syncMesh();
//   }
//   public update(dt: number): void {
//     Physics.update(this, dt);
//     this.updateRotation(dt);
//     this.syncMesh();
//   }
//   // public syncMesh(): void {
//   //   this.mesh.position.set(this.position.x, this.position.z, this.position.y);
//   // }

//   public syncMesh(): void {
//     this.mesh.position.set(this.position.x, this.position.z, this.position.y);
//   }

// //  private updateRotation(dt: number): void {
// //   const angle = this.angularVelocity.length() * dt;
// //   if (angle < 0.0001) return; 

  
// //   const axis = new THREE.Vector3(
// //     this.angularVelocity.x,
// //     this.angularVelocity.z,
// //     this.angularVelocity.y
// //   ).normalize();


// //   const deltaRotation = new THREE.Quaternion();
// //   deltaRotation.setFromAxisAngle(axis, -angle); 


// //   this.mesh.quaternion.multiplyQuaternions(deltaRotation, this.mesh.quaternion);
// // }

// private updateRotation(dt: number): void {
//   const w = this.angularVelocity.length();
//   if (w < 0.0001) return;

//   const axis = new THREE.Vector3(
//     this.angularVelocity.x,
//     this.angularVelocity.z,
//     this.angularVelocity.y
//   ).normalize();

//   const deltaRotation = new THREE.Quaternion();
//   deltaRotation.setFromAxisAngle(axis, -w * dt);

//   this.mesh.quaternion.premultiply(deltaRotation);
// }

// }
import * as THREE from "three";
import { Vector3 } from "./math/Vector3";
import { Physics } from "./Physics";

export class Ball {
  public radius: number;
  public mass: number;
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
    id: number // استبدال اللون بالـ id لاستدعاء الصورة المناسبة
  ) {
    this.radius = radius;
    this.mass = mass;
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
      roughness: 0.15,  // صقل السطح ليعطي لمعان كرات البلياردو الحقيقية
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

  private updateRotation(dt: number): void {
    const w = this.angularVelocity.length();
    if (w < 0.0001) return;

    // تحديد محور الدوران في الفراغ ثلاثي الأبعاد
    const axis = new THREE.Vector3(
      this.angularVelocity.x,
      this.angularVelocity.z,
      this.angularVelocity.y
    ).normalize();

    // حساب زاوية الدوران وتطبيقها مستخدمين الـ Quaternion لمنع مشكلة الـ Gimbal Lock
    const deltaRotation = new THREE.Quaternion();
    deltaRotation.setFromAxisAngle(axis, -w * dt);

    this.mesh.quaternion.premultiply(deltaRotation);
  }
}