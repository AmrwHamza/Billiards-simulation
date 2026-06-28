// import * as THREE from "three";

// export class Table {
//   width: number;
//   height: number;
//   mesh: THREE.Mesh;

//   constructor(width: number, height: number) {
//     this.width = width;
//     this.height = height;

//     const geometry = new THREE.PlaneGeometry(width, height);

//     const material = new THREE.MeshStandardMaterial({
//       color: 0x0a7a2f, 
//     });

//     this.mesh = new THREE.Mesh(geometry, material);
// this.mesh.receiveShadow = true;
//     this.mesh.rotation.x = -Math.PI / 2;
//   }
// }

    // model.scale.set(1.2, 1.2, 1.2); 
    //     model.position.set(0, -0.95, 0);

import * as THREE from "three";
// 🌟 استيراد الـ Loader الخاص بملفات الـ GLB
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Table {
  width: number;
  height: number;
  // 🌟 حوّلنا النوع إلى Group لكي يستطيع حمل (الأخضر + الصندوق الأحمر + الموديل)
  mesh: THREE.Group; 
  private loader: GLTFLoader;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    // 1️⃣ إنشاء الحاوية الرئيسية
    this.mesh = new THREE.Group();
    this.loader = new GLTFLoader();

    // 2️⃣ الإبقاء على القماش الأخضر الحالي (كما طلبته تماماً)
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0a7a2f, 
    });
    const clothMesh = new THREE.Mesh(geometry, material);
    clothMesh.receiveShadow = true;
    clothMesh.rotation.x = -Math.PI / 2;
    
    // نضيف الأخضر داخل الحاوية
    // this.mesh.add(clothMesh);

    // 3️⃣ إضافة صندوق المعاينة الأحمر (Wireframe) ليمثل حدود الفيزياء (2.84 × 1.42)
    // سماكة الصندوق 0.05 لكي يظهر كإطار حول القماش
    const debugGeometry = new THREE.BoxGeometry(width, 0.05, height); 
    const debugMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,   // لون أحمر
      wireframe: true,   // شبكي شفاف لترى من خلاله
    });
    const debugBox = new THREE.Mesh(debugGeometry, debugMaterial);
    
    // وضعه عند مستوى الصفر تماماً ليطابق القماش
    debugBox.position.y = 0; 
    
    // نضيف الصندوق الأحمر داخل الحاوية
    this.mesh.add(debugBox);

    // 4️⃣ استدعاء دالة تحميل الموديل الـ 3D الجديد
    this.loadModel();
  }

  private loadModel() {
    // 🌟 ضع هنا اسم ملف الـ GLB الجديد الذي قمت بتحميله ونقلته لمجلد public
    const modelPath = "/public/models/Billiard table/billiard_table.glb"; 

    this.loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        // 📐 خطوتك القادمة بالعين المجردة:
        // عدل هذه الأرقام (الـ scale والـ position) حتى تنطبق حواف الموديل
        // مع الصندوق الأحمر والقماش الأخضر تماماً أثناء تشغيل اللعبة.
        model.scale.set(1.2, 1.2, 1.2); 
        model.position.set(0, -0.9353, 0); // غالباً ستحتاج لإنزاله تحت الصفر ليظهر القماش بالأعلى

        model.traverse((child: any) => {
          if (child.isMesh) {

console.log("Mesh Name found:", child.name);

          // 2️⃣ تحويل الاسم لأحرف صغيرة لمنع مشاكل الحروف الكبيرة والمنخفضة
          const meshName = child.name.toLowerCase();

          // 3️⃣ الفلتر الذكي: إذا كان الاسم يحتوي على كرة أو عصا، قم بإخفائه فوراً
          if (
            meshName.includes("ball") ||  // إخفاء الكرات
            meshName.includes("cue") ||   // إخفاء العصا (Cue stick)
            meshName.includes("stick") || // إخفاء أي مجسم مكتوب فيه عصا
            meshName.includes("rack")     // إخفاء مثلث تجميع الكرات إذا كان موجوداً
          ) {
            child.visible = false; // ❌ إخفاء القطعة تماماً من المشهد
            return; // تخطي باقي الإعدادات لهذه القطعة المخفية والانتقال للتالي
          }

            child.castShadow = true;
            child.receiveShadow = true;
            
            // تصحيح الألوان للموديل الجديد
            if (child.material && child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace;
            }
          }
        });

        // نضيف الموديل الـ 3D داخل الحاوية مع البقية
        this.mesh.add(model);
        console.log("🎯 تم دمج الموديل ثلاثي الأبعاد مع نظام الطاولة!");
      },
      undefined,
      (error) => {
        console.error("خطأ أثناء تحميل موديل الطاولة:", error);
      }
    );
  }
}