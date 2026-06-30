import * as THREE from "three";
import { Ball } from "../enviroment/Ball";

const BALL_RADIUS = 0.028575;
const BALL_MASS = 0.17;

const apexX = 0.5;
const apexY = 0.0;

const rackOrder = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 15, 7];

function getRowX(rowNumber: number): number {
  return apexX + rowNumber * (Math.sqrt(3) * BALL_RADIUS);
}

function getRowYOffsets(rowNumber: number): number[] {
  const r = BALL_RADIUS;

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

export function createRack(scene: THREE.Scene, balls: Ball[]) {
  let ballIndex = 0;

  for (let row = 0; row < 5; row++) {
    const x = getRowX(row);

    for (const yOffset of getRowYOffsets(row)) {
      const id = rackOrder[ballIndex];
      const y = apexY + yOffset;

      const ball = new Ball(x, y, BALL_RADIUS, BALL_MASS, id);

      balls.push(ball);
      scene.add(ball.mesh);

      ballIndex++;
    }
  }
}