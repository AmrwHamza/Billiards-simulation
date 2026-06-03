import * as THREE from 'three';
import { Ball } from './Ball';

export class PhysicsVisualizer {
  private velocityArrow: THREE.ArrowHelper;
  private angularArrow: THREE.ArrowHelper;

  constructor(scene: THREE.Scene) {
    const origin = new THREE.Vector3(0, 0, 0);
    
    // سهم السرعة الأخضر (السرعة الكلية)
    this.velocityArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0x00ff00);
    
    // سهم الدوران الأحمر (محور الدوران)
    this.angularArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1, 0xff0000);

    scene.add(this.velocityArrow);
    scene.add(this.angularArrow);
  }

  public update(ball: Ball): void {
   
    const pos = new THREE.Vector3(ball.position.x, ball.position.z, ball.position.y);
    this.velocityArrow.position.copy(pos);
    this.angularArrow.position.copy(pos);

    const vLen = ball.velocity.length();
    if (vLen > 0.01) {
        const vDir = new THREE.Vector3(ball.velocity.x, ball.velocity.z, ball.velocity.y).normalize();
        this.velocityArrow.setDirection(vDir);
        this.velocityArrow.setLength(vLen);
        this.velocityArrow.visible = true;
    } else {
        this.velocityArrow.visible = false;
    }

    const wLen = ball.angularVelocity.length();
    if (wLen > 0.01) {
        const wDir = new THREE.Vector3(ball.angularVelocity.x, ball.angularVelocity.z, ball.angularVelocity.y).normalize();
        this.angularArrow.setDirection(wDir);
        this.angularArrow.setLength(wLen * 0.2); 
        this.angularArrow.visible = true;
    } else {
        this.angularArrow.visible = false;
    }
  }
}