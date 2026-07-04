import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
export class Room {
  public mesh: THREE.Group;
  
private loader = new GLTFLoader();
  constructor() {
    this.mesh = new THREE.Group();
  this.loadCafeModel(); 

 
  }




private loadCafeModel() {
  const modelPath = "/models/cafe/coffee_shop_building.glb"; 

  this.loader.load(
    modelPath, 
    (gltf) => {
      const model = gltf.scene;

      model.scale.set(1, 1, 1);
      model.position.set(-27, -1.12, 3);

      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            child.material.needsUpdate = true;
            
            if (child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace; 
              child.material.map.needsUpdate = true;
            }
          }
        }
      });

 
      this.mesh.add(model);
      console.log("نجاح");
    },
    (xhr) => {
    
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
   
      console.error("خطاء في تحميل الموديل", error);
    }
  );
}

}