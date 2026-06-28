import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
export class Room {
  public mesh: THREE.Group;
  
private loader = new GLTFLoader();
  constructor() {
    this.mesh = new THREE.Group();
  this.loadCafeModel(); // 👈 هذا الجديد

    // this.createFloor();
    // this.createWalls();this.createProps();
  }

//   private createFloor() {
// const floorGeometry = new THREE.PlaneGeometry(12, 12, 10, 10);  const floorMaterial = new THREE.MeshStandardMaterial({
//   color: 0x3b2a1f, // لون خشب غامق (café wood tone)
//   roughness: 0.95,
//   metalness: 0.0,
// });

//     const floor = new THREE.Mesh(floorGeometry, floorMaterial);

//     floor.rotation.x = -Math.PI / 2;
//     floor.position.y = -this.tableHeight;
//     floor.receiveShadow = true;

//     this.mesh.add(floor);
//   }

//   private createWalls() {
// const wallMaterial = new THREE.MeshStandardMaterial({
//   color: 0x2f2a26, // بني غامق دافئ
//   roughness: 1.0,
//   metalness: 0.0,
// });

//     const wallHeight = 4;

//     const wall1 = new THREE.Mesh(
//       new THREE.BoxGeometry(12, wallHeight, 0.2),
//       wallMaterial
//     );
//     wall1.position.set(0, wallHeight / 2 - this.tableHeight, -6);

//     const wall2 = wall1.clone();
//     wall2.position.set(0, wallHeight / 2 - this.tableHeight, 6);

//     const wall3 = new THREE.Mesh(
//       new THREE.BoxGeometry(0.2, wallHeight, 12),
//       wallMaterial
//     );
//     wall3.position.set(-6, wallHeight / 2 - this.tableHeight, 0);

//     const wall4 = wall3.clone();
//     wall4.position.set(6, wallHeight / 2 - this.tableHeight, 0);

//     this.mesh.add(wall1, wall2, wall3, wall4);
//   }



private loadCafeModel() {
  // 🌟 خطوة هامة: ضع هنا اسم ملف الـ GLB الجديد الخاص بك بالضبط
  const modelPath = "/models/cafe/coffee_shop_building.glb"; 

  this.loader.load(
    modelPath, 
    (gltf) => {
      const model = gltf.scene;

      // 📐 ضبط الحجم والموقع (عدل الـ scale إذا ظهر الموديل كبيراً أو صغيراً جداً)
      model.scale.set(1, 1, 1);
      model.position.set(-27, -1.12, 3);

      // 🦾 المرور على أجزاء الموديل لتفعيل الظلال والألوان
      model.traverse((child: any) => {
        if (child.isMesh) {
          // تفعيل إسقاط واستقبال الظلال للمجسم
          child.castShadow = true;
          child.receiveShadow = true;

          // التأكد من تهيئة الخامات بشكل صحيح مع إضاءة Scene
          if (child.material) {
            child.material.needsUpdate = true;
            
            // إذا كان الموديل يحتوي على تكستشرز (ألوان وصور مدمجة)
            if (child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace; // لضمان ألوان زاهية وواقعية
              child.material.map.needsUpdate = true;
            }
          }
        }
      });

      // إضافة المقهى الجديد إلى الـ Group الخاص بالـ Room
      this.mesh.add(model);
      console.log("🚀 تم تحميل موديل الـ GLB الجديد بنجاح وبألوانه الأصلية!");
    },
    (xhr) => {
      // طباعة نسبة التحميل في الـ Console
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
      // عرض الخطأ بالتفصيل في حال وجود مشكلة في المسار
      console.error("❌ حدث خطأ أثناء تحميل ملف الـ GLB:", error);
    }
  );
}


// private createProps() {
//   const props = new THREE.Group();

//   const tableMaterial = new THREE.MeshStandardMaterial({
//     color: 0x4a3a2f,
//     roughness: 0.9,
//   });

//   const tableGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.6);

//   for (let i = 0; i < 3; i++) {
//     const table = new THREE.Mesh(tableGeometry, tableMaterial);

//     table.position.set(
//       -2 + i * 2,
//       -this.tableHeight + 0.4,
//       -3
//     );

//     props.add(table);
//   }

//   this.mesh.add(props);








// const chairMaterial = new THREE.MeshStandardMaterial({
//   color: 0x2d221b,
//   roughness: 1,
// });

// const chairGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);

// for (let i = 0; i < 6; i++) {
//   const chair = new THREE.Mesh(chairGeometry, chairMaterial);

//   chair.position.set(
//     -2 + (i % 3) * 2 + 0.5,
//     -this.tableHeight + 0.15,
//     -3 + (i < 3 ? 0.7 : -0.7)
//   );

//   props.add(chair);
// }


// const counterMaterial = new THREE.MeshStandardMaterial({
//   color: 0x3a2b22,
//   roughness: 0.8,
// });

// const counter = new THREE.Mesh(
//   new THREE.BoxGeometry(3, 1, 0.5),
//   counterMaterial
// );

// counter.position.set(0, -this.tableHeight + 0.5, -5.5);

// props.add(counter);

// }
}