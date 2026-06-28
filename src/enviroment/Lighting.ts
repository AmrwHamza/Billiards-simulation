import * as THREE from "three";

export class Lighting {
  static setupLighting(scene: THREE.Scene) {

    // 🟢 1. Ambient (رفع الإضاءة العامة)
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // 🟢 2. Hemisphere (أساسي جداً للـ interiors)
  // اجعل الإضاءة بيضاء ورمادية مؤقتاً
const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.0);
    scene.add(hemi);

    // 🟡 3. Main table light (spot فوق الطاولة)
    const spot = new THREE.SpotLight(0xfff4d6, 6);
    spot.position.set(0, 3.5, 0);

    spot.angle = Math.PI / 3;
    spot.penumbra = 0.7;
    spot.decay = 1;
    spot.distance = 20;

    spot.castShadow = true;
spot.shadow.mapSize.width = 2048;
spot.shadow.mapSize.height = 2048;
spot.shadow.bias = -0.0005; 

// 🌟 تقريب الكاميرا الخاصة بالظل لتركز على مساحة المقهى فقط وتزيد الدقة
spot.shadow.camera.near = 0.5;
spot.shadow.camera.far = 15;


    const target = new THREE.Object3D();
    target.position.set(0, 0, 0);
    scene.add(target);

    spot.target = target;

    scene.add(spot);

    // 🟣 4. Fill lights (سر الواقعية الحقيقي)
    const fill1 = new THREE.PointLight(0xffddaa, 1.2, 15);
    fill1.position.set(4, 2, 3);
    scene.add(fill1);

    const fill2 = new THREE.PointLight(0xffddaa, 1.2, 15);
    fill2.position.set(-4, 2, -3);
    scene.add(fill2);

    const fill3 = new THREE.PointLight(0xffddaa, 0.8, 12);
    fill3.position.set(0, 2, -4);
    scene.add(fill3);

  }
}