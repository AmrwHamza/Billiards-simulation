import * as THREE from "three";
import { Ball } from "../environment/Ball";

export class Rack {
  private static  BALL_RADIUS = 0.028575;
  private static  BALL_MASS = 0.17;

  private static  APEX_X = 0.5;
  private static  APEX_Y = 0.0;

  private static  RACK_ORDER = [
    1, 9, 2,
    10, 8, 3,
    11, 4, 12, 5,
    13, 6, 14, 15, 7
  ];

  private static getRowX(rowNumber: number): number {
    return this.APEX_X + rowNumber * (Math.sqrt(3) * this.BALL_RADIUS);
  }

  private static getRowYOffsets(rowNumber: number): number[] {
    const r = this.BALL_RADIUS;

    switch (rowNumber) {
      case 0:
        return [0];
      case 1:
        return [-r, r];
      case 2:
        return [-2 * r, 0, 2 * r];
      case 3:
        return [-3 * r, -r, r, 3 * r];
      case 4:
        return [-4 * r, -2 * r, 0, 2 * r, 4 * r];
      default:
        return [];
    }
  }

  static createRack(scene: THREE.Scene, balls: Ball[]): void {
    let ballIndex = 0;

    for (let row = 0; row < 5; row++) {
      const x = this.getRowX(row);

      for (const yOffset of this.getRowYOffsets(row)) {
        const id = this.RACK_ORDER[ballIndex];
        const y = this.APEX_Y + yOffset;

        const ball = new Ball(
          x,
          y,
          this.BALL_RADIUS,
          this.BALL_MASS,
          id
        );

        balls.push(ball);
        scene.add(ball.mesh);

        ballIndex++;
      }
    }
  }
}