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
  public color: THREE.ColorRepresentation | undefined;

  public angularVelocity: Vector3;
  public angularAcceleration: Vector3;
  public torque: Vector3;
  public inertia: number;
  constructor(
    x: number,
    y: number,
    radius: number,
    mass: number,
    color: THREE.ColorRepresentation,
  ) {
    this.radius = radius;
    this.mass = mass;
    this.position = new Vector3(x, y, this.radius);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);

    this.angularVelocity = new Vector3(0, 0, 0);
    this.angularAcceleration = new Vector3(0, 0, 0);

    this.torque = new Vector3(0, 0, 0);

    this.inertia = (2 / 5) * this.mass * this.radius * this.radius;
    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);

    const material = new THREE.MeshStandardMaterial({
      color: color,
    });

    this.mesh = new THREE.Mesh(geometry, material);

    const topGeometry = new THREE.SphereGeometry(
      this.radius,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    const topMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.2,
      metalness: 0.1,
    });
    const topHalf = new THREE.Mesh(topGeometry, topMaterial);
    this.mesh.add(topHalf);

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius * 0.2),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );

    marker.position.set(0, this.radius, 0);

    this.mesh.add(marker);

    // 2. النصف السفلي (باللون الأبيض دائماً ليظهر التباين مثل كرة البليارو)
    const bottomGeometry = new THREE.SphereGeometry(
      this.radius,
      32,
      32,
      0,
      Math.PI * 2,
      Math.PI / 2,
      Math.PI / 2,
    );
    const bottomMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // لون أبيض ثابت للنصف السفلي
      roughness: 0.2,
      metalness: 0.1,
    });
    const bottomHalf = new THREE.Mesh(bottomGeometry, bottomMaterial);
    this.mesh.add(bottomHalf);
    this.syncMesh();
  }
  public update(dt: number): void {
    Physics.update(this, dt);
    this.updateRotation(dt);
    this.syncMesh();
  }
  // public syncMesh(): void {
  //   this.mesh.position.set(this.position.x, this.position.z, this.position.y);
  // }

  public syncMesh(): void {
    this.mesh.position.set(this.position.x, this.position.z, this.position.y);
  }

 private updateRotation(dt: number): void {
  const angle = this.angularVelocity.length() * dt;
  if (angle < 0.0001) return; 

  
  const axis = new THREE.Vector3(
    this.angularVelocity.x,
    this.angularVelocity.z,
    this.angularVelocity.y
  ).normalize();


  const deltaRotation = new THREE.Quaternion();
  deltaRotation.setFromAxisAngle(axis, -angle); 


  this.mesh.quaternion.multiplyQuaternions(deltaRotation, this.mesh.quaternion);
}
}
