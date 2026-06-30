import * as THREE from "three";
import { Vector3 } from "../math/Vector3";
import { Physics } from "../Physics/Physics";

export class Ball {
  public radius: number;
  public mass: number;
  public position: Vector3;
  public velocity: Vector3;
  public acceleration: Vector3;
  public mesh: THREE.Mesh;
  public id: number;

  public angularVelocity: Vector3;
  public angularAcceleration: Vector3;
  public torque: Vector3;

  private static textureLoader = new THREE.TextureLoader();

  constructor(x: number, y: number, radius: number, mass: number, id: number) {
    this.radius = radius;
    this.mass = mass;
    this.id = id;

    this.position = new Vector3(x, y, this.radius);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.angularVelocity = new Vector3(0, 0, 0);
    this.angularAcceleration = new Vector3(0, 0, 0);
    this.torque = new Vector3(0, 0, 0);

    const ballTexture = Ball.textureLoader.load(`textures/Ball_${id}.jpg`);
    ballTexture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.15,
      metalness: 0.0,
      envMapIntensity: 1.2,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.syncMesh();
  }

  public get inertia(): number {
    return (2 / 5) * this.mass * this.radius * this.radius;
  }

  public update(dt: number): void {
    Physics.update(this, dt);
    this.updateRotation(dt);
    this.syncMesh();
  }

  public syncMesh(): void {
    this.mesh.position.set(this.position.x, this.position.z, this.position.y);
  }

  private updateRotation(dt: number): void {
    const w = this.angularVelocity.length();
    if (w < 0.0001) return;

    const axis = new THREE.Vector3(
      this.angularVelocity.x,
      this.angularVelocity.z,
      this.angularVelocity.y,
    ).normalize();

    const deltaRotation = new THREE.Quaternion();
    deltaRotation.setFromAxisAngle(axis, -w * dt);

    this.mesh.quaternion.premultiply(deltaRotation);
  }
}
