import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class Table {
  width: number;
  height: number;

  mesh: THREE.Group;
  private loader: GLTFLoader;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.mesh = new THREE.Group();
    this.loader = new GLTFLoader();

    const debugGeometry = new THREE.BoxGeometry(width, 0.05, height);
    const debugMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });
    const debugBox = new THREE.Mesh(debugGeometry, debugMaterial);

    debugBox.position.y = 0;

    this.loadModel();
  }

  private loadModel() {
    const modelPath = "/public/models/Billiard_table/billiard_table.glb";

    this.loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        model.scale.set(1.2, 1.2, 1.2);
        model.position.set(0, -0.9353, 0);

        model.traverse((child: any) => {
          if (child.isMesh) {
            console.log("Mesh Name found:", child.name);

            const meshName = child.name.toLowerCase();

            if (
              meshName.includes("ball") ||
              meshName.includes("cue") ||
              meshName.includes("stick") ||
              meshName.includes("rack")
            ) {
              child.visible = false;
              return;
            }

            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material && child.material.map) {
              child.material.map.colorSpace = THREE.SRGBColorSpace;
            }
          }
        });

        this.mesh.add(model);
        console.log("نجاح2");
      },
      undefined,
      (error) => {
        console.error("خطأ2", error);
      },
    );
  }
}
