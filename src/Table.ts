import * as THREE from "three";

export class Table {
  width: number;
  height: number;
  mesh: THREE.Mesh;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    const geometry = new THREE.PlaneGeometry(width, height);

    const material = new THREE.MeshStandardMaterial({
      color: 0x0a7a2f, 
    });

    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.rotation.x = -Math.PI / 2;
  }
}