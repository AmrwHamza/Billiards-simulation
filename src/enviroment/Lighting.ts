import * as THREE from "three";

export class Lighting {
  static setupLighting(scene: THREE.Scene) {

    // 🌕 Ambient بسيط (لا تخليه صفر)
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    // 💡 Main directional light (أسهل وأثبت من spot للتجربة)
    const light = new THREE.DirectionalLight(0xffffff, 1.4);

light.position.set(-1, 1, 2);
    light.castShadow = true;
light.shadow.bias = -0.0002;  
  // 🔥 مهم جداً جداً
 light.shadow.mapSize.width = 4096;
light.shadow.mapSize.height = 4096;
light.shadow.radius = 3;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 20;

    // حجم منطقة الظل (CRITICAL)
 light.shadow.camera.left = -4;
light.shadow.camera.right = 4;
light.shadow.camera.top = 4;
light.shadow.camera.bottom = -4;

    scene.add(light);

    // 🎯 هدف (مو ضروري مع directional بس خلينا ثابت)
    const target = new THREE.Object3D();
    target.position.set(0, 0, 0);
    scene.add(target);
    light.target = target;
  }
}