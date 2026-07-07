import { Ball } from "../environment/Ball";
import { Vector3 } from "../math/Vector3";

export class Physics {
  static gravity = 9.81;
  public static friction = 0.2;
  static restitution = 0.9;
  public static rollingResistance = 0.01;
  public static spinFriction = 0.008;

  
  public static update(ball: Ball, dt: number): void {
    
    const totalForce = this.getTotalForce(ball); 
    const acceleration = this.forceToAcceleration(totalForce, ball.mass); 
    this.updateVelocity(ball, acceleration, dt); 
    
    const totalTorque = this.getTorque(ball); 
    const angularAcceleration = this.torqueToAngularAcceleration(
      totalTorque,
      ball.inertia,
    ); 
    this.updateAngularVelocity(ball, angularAcceleration, dt); 

    
    this.updatePosition(ball, dt); 
    this.updateRotation(ball, dt); 

    
    this.resolveWallCollision(ball);

    
    const stopVelocity = 0.01;
    const stopAW = 0.01;
    if (
      ball.velocity.length() < stopVelocity &&
      ball.angularVelocity.length() < stopAW
    ) {
      ball.velocity = new Vector3(0, 0, 0);
      ball.angularVelocity = new Vector3(0, 0, 0);
    }
  }

  
  static getTotalForce(ball: Ball): Vector3 {
    const gravity = this.getGravity(ball); 
    const normal = this.getNormal(ball); 
    const friction = this.getFriction(ball); 

    return gravity.add(normal).add(friction); 
  }

  
  static getGravity(ball: Ball): Vector3 {
    return new Vector3(0, 0, -ball.mass * Physics.gravity);
  }

  
  static getNormal(ball: Ball): Vector3 {
    return new Vector3(0, 0, ball.mass * Physics.gravity);
  }

  
  static getFriction(ball: Ball): Vector3 {
    const contactVelocity = this.getContactVelocity(ball);
    const contactVelocitySpeed = contactVelocity.length();

    if (contactVelocitySpeed > 1e-6) {
      const direction = contactVelocity.normalize();
      const magnitude = this.friction * ball.mass * Physics.gravity;
      return direction.multiplyScalar(-magnitude);
    }

    return new Vector3(0, 0, 0);
  }

  
  static getContactVelocity(ball: Ball): Vector3 {
    const wCrossR = new Vector3(
      -ball.angularVelocity.y * ball.radius,
      ball.angularVelocity.x * ball.radius,
      0,
    );

    const contactVelocity = ball.velocity.add(wCrossR);

    if (contactVelocity.length() < 0.01) {
      return new Vector3(0, 0, 0);
    }

    return contactVelocity;
  }

  static getTorque(ball: Ball): Vector3 {
    let torque = this.getSlipTorque(ball);
    torque = torque.add(this.getRollingTorque(ball));
    torque = torque.add(this.getSpinTorque(ball));

    return torque;
  }

  static getSlipTorque(ball: Ball): Vector3 {
    const friction = this.getFriction(ball);

    return new Vector3(friction.y * ball.radius, -friction.x * ball.radius, 0);
  }

  static getRollingTorque(ball: Ball): Vector3 {
    
    const w = ball.angularVelocity;
    const wXwY = new Vector3(w.x, w.y, 0);

    const wMag = wXwY.length();
    if (wMag < 1e-6) return new Vector3(0, 0, 0);

    const magnitude =
      (2 / 5) *
      Physics.rollingResistance *
      ball.mass *
      Physics.gravity *
      ball.radius;

    const direction = wXwY.normalize().multiplyScalar(-1);

    
    return direction.multiplyScalar(magnitude);
  }

  static getSpinTorque(ball: Ball): Vector3 {
    const spin = ball.angularVelocity.z;

    if (Math.abs(spin) < 1e-6) {
      return new Vector3(0, 0, 0);
    }

    return new Vector3(0, 0, -spin)
      .normalize()
      .multiplyScalar(
        Physics.spinFriction * ball.mass * Physics.gravity * ball.radius,
      );
  }

  static forceToAcceleration(force: Vector3, mass: number): Vector3 {
    return force.multiplyScalar(1 / mass);
  }

  static updateVelocity(ball: Ball, acceleration: Vector3, dt: number): void {
    ball.velocity = ball.velocity.add(acceleration.multiplyScalar(dt));
  }

  static updatePosition(ball: Ball, dt: number): void {
    ball.position = ball.position.add(ball.velocity.multiplyScalar(dt));

    ball.position = new Vector3(ball.position.x, ball.position.y, ball.radius);
  }
  static updateRotation(ball: Ball, dt: number): void {
    
    const wx = -ball.angularVelocity.x;
    const wy = -ball.angularVelocity.z;
    const wz = -ball.angularVelocity.y;

    const wLength = Math.sqrt(wx * wx + wy * wy + wz * wz);
    if (wLength < 0.0001) return;

    
    const qw = ball.qW;
    const qx = ball.qX;
    const qy = ball.qY;
    const qz = ball.qZ;

    
    const dq_w = 0.5 * dt * (-wx * qx - wy * qy - wz * qz);
    const dq_x = 0.5 * dt * (wx * qw + wy * qz - wz * qy);
    const dq_y = 0.5 * dt * (-wx * qz + wy * qw + wz * qx);
    const dq_z = 0.5 * dt * (wx * qy - wy * qx + wz * qw);

    
    ball.qW += dq_w;
    ball.qX += dq_x;
    ball.qY += dq_y;
    ball.qZ += dq_z;

    
    const magnitude = Math.sqrt(
      ball.qW * ball.qW +
        ball.qX * ball.qX +
        ball.qY * ball.qY +
        ball.qZ * ball.qZ,
    );

    if (magnitude > 0) {
      ball.qW /= magnitude;
      ball.qX /= magnitude;
      ball.qY /= magnitude;
      ball.qZ /= magnitude;
    }
  }

  static resolveWallCollision(ball: Ball): void {
    const halfX = 2.84 / 2; 
    const halfY = 1.42 / 2; 
    const r = ball.radius;

    let collided = false;
    let normal = new Vector3();
    let wallType = ""; 

    
    if (ball.position.x + r > halfX) {
      
      collided = true;
      normal = new Vector3(-1, 0, 0);
      wallType = "right";
    } else if (ball.position.x - r < -halfX) {
      
      collided = true;
      normal = new Vector3(1, 0, 0);
      wallType = "left";
    } else if (ball.position.y + r > halfY) {
      
      collided = true;
      normal = new Vector3(0, -1, 0);
      wallType = "top";
    } else if (ball.position.y - r < -halfY) {
      
      collided = true;
      normal = new Vector3(0, 1, 0);
      wallType = "bottom";
    }

    if (!collided) return;

    
    const e = Physics.restitution;
    const mu = 0.15;
    const invMass = 1 / ball.mass;

    const rContact = normal.multiplyScalar(-r);
    const omegaCrossR = ball.angularVelocity.cross(rContact);
    const vContact = ball.velocity.add(omegaCrossR);

    const vN = vContact.dot(normal);
    if (vN >= 0) return;

    
    const rCrossN = rContact.cross(normal);
    const rotationalN = rCrossN.lengthSq() / ball.inertia;
    const jN = (-(1 + e) * vN) / (invMass + rotationalN);
    const impulseN = normal.multiplyScalar(jN);

    
    const tangent = vContact.subtract(normal.multiplyScalar(vN));
    let impulseT = new Vector3();

    if (tangent.length() > 1e-6) {
      const t = tangent.normalize();
      const vt = vContact.dot(t);
      const rCrossT = rContact.cross(t);
      const rotationalT = rCrossT.lengthSq() / ball.inertia;

      let jT = -vt / (invMass + rotationalT);
      const maxFriction = mu * Math.abs(jN);
      jT = Math.max(-maxFriction, Math.min(maxFriction, jT));

      impulseT = t.multiplyScalar(jT);
    }

    const totalImpulse = impulseN.add(impulseT);

    
    ball.velocity = ball.velocity.add(totalImpulse.multiplyScalar(invMass));

    const deltaOmega = rContact
      .cross(totalImpulse)
      .multiplyScalar(1 / ball.inertia);
    ball.angularVelocity = ball.angularVelocity.add(deltaOmega);

    
    if (wallType === "right") {
      ball.position.x = halfX - r; 
    } else if (wallType === "left") {
      ball.position.x = -halfX + r; 
    } else if (wallType === "top") {
      ball.position.y = halfY - r; 
    } else if (wallType === "bottom") {
      ball.position.y = -halfY + r; 
    }
  }
  static resolveBallCollision(a: Ball, b: Ball): void {
    const delta = b.position.clone().subtract(a.position); 
    delta.z = 0;

    const distSq = delta.x * delta.x + delta.y * delta.y; 
    const minDist = a.radius + b.radius; 
    if (distSq > minDist * minDist) return; 

    

    const dist = Math.sqrt(distSq);
    
    const normal = delta.clone().normalize();

    const rA = normal.clone().multiplyScalar(a.radius);
    const rB = normal.clone().multiplyScalar(-b.radius);

    
    const vA_contact = a.velocity
      .clone()
      .add(a.angularVelocity.clone().cross(rA));
    const vB_contact = b.velocity
      .clone()
      .add(b.angularVelocity.clone().cross(rB));

    
    const relVel = vA_contact.clone().subtract(vB_contact);
    const velAlongNormal = relVel.x * normal.x + relVel.y * normal.y;

    if (velAlongNormal < 0) return; 
    const e = Physics.restitution;
    const ballFriction = 0.05;
    
    const invMassA = 1 / a.mass;
    const invMassB = 1 / b.mass;
    const invMassSum = invMassA + invMassB;
    
    const rAcrossN = rA.x * normal.y - rA.y * normal.x;
    const rBcrossN = rB.x * normal.y - rB.y * normal.x;


    let jN = -(1 + e) * velAlongNormal;

    
    jN /=
      invMassSum +
      (rAcrossN * rAcrossN) / a.inertia +
      (rBcrossN * rBcrossN) / b.inertia;

    const impulseNormal = normal.clone().multiplyScalar(jN);

    let tangent = relVel
      .clone()
      .subtract(normal.clone().multiplyScalar(velAlongNormal));
    const tangentLen = tangent.length();
    

    let impulseTangent = new Vector3(0, 0, 0);
    if (tangentLen > 0.0001) {
      tangent = tangent.multiplyScalar(1 / tangentLen);
      const velAlongTangent = relVel.x * tangent.x + relVel.y * tangent.y;

      const rAcrossT = rA.x * tangent.y - rA.y * tangent.x;
      const rBcrossT = rB.x * tangent.y - rB.y * tangent.x;

      let jT = -velAlongTangent;
      jT /=
        invMassSum +
        (rAcrossT * rAcrossT) / a.inertia +
        (rBcrossT * rBcrossT) / b.inertia;

      const maxFriction = Math.abs(jN) * ballFriction;
      if (Math.abs(jT) > maxFriction) {
        jT = (jT > 0 ? 1 : -1) * maxFriction;
      }

      impulseTangent = tangent.clone().multiplyScalar(jT);
    }

    const totalImpulse = impulseNormal.add(impulseTangent);

    a.velocity = a.velocity.add(totalImpulse.clone().multiplyScalar(invMassA));
    b.velocity = b.velocity.subtract(
      totalImpulse.clone().multiplyScalar(invMassB),
    );

    const torqueImpulseA = rA.x * impulseTangent.y - rA.y * impulseTangent.x;
    const torqueImpulseB = rB.x * -impulseTangent.y - rB.y * -impulseTangent.x;

    a.angularVelocity = new Vector3(
      a.angularVelocity.x,
      a.angularVelocity.y,
      a.angularVelocity.z + torqueImpulseA / a.inertia,
    );

    b.angularVelocity = new Vector3(
      b.angularVelocity.x,
      b.angularVelocity.y,
      b.angularVelocity.z + torqueImpulseB / b.inertia,
    );

    const percent = 0.8;
    const slop = 0.01;
    const overlap = minDist - dist;

    if (overlap > slop) {
      const correctionMag =
        (Math.max(overlap - slop, 0.0) / invMassSum) * percent;
      const correction = normal.clone().multiplyScalar(correctionMag);

      a.position = a.position.subtract(
        correction.clone().multiplyScalar(invMassA),
      );
      b.position = b.position.add(correction.clone().multiplyScalar(invMassB));
    }
  }

  static torqueToAngularAcceleration(
    torque: Vector3,
    inertia: number,
  ): Vector3 {
    return torque.multiplyScalar(1 / inertia);
  }

  static updateAngularVelocity(
    ball: Ball,
    angularAcceleration: Vector3,
    dt: number,
  ): void {
    ball.angularVelocity = ball.angularVelocity.add(
      angularAcceleration.multiplyScalar(dt),
    );

    const vSpeed = ball.velocity.length();
    const slipSpeed = this.getContactVelocity(ball).length();

    
    if (vSpeed < 0.0005 && slipSpeed < 0.0005) {
      ball.velocity = new Vector3(0, 0, 0);
      ball.angularVelocity = new Vector3(0, 0, 0);
      return;
    }

    if (ball.velocity.length() < 0.01 && ball.angularVelocity.length() < 0.05) {
      ball.angularVelocity = new Vector3(0, 0, 0);
    }
  }

  static checkHoleCollision(ball: Ball): boolean {
    const halfX = 2.84 / 2;
    const halfY = 1.42 / 2;
    
    const holeRadius = 0.055;
    
    const holes = [
      
      { x: halfX, y: halfY },
      { x: halfX, y: -halfY },
      { x: -halfX, y: halfY },
      { x: -halfX, y: -halfY },
      
      { x: 0, y: halfY },
      { x: 0, y: -halfY },
    ];

    for (const hole of holes) {
      const dx = ball.position.x - hole.x;
      const dy = ball.position.y - hole.y;
      if (dx * dx + dy * dy < holeRadius * holeRadius) {
        return true;
      }
    }
    return false;
  }
static applyInitialShot(ball: Ball, angleRad: number, velocity: number): void {
    
    const vx = velocity * Math.cos(angleRad);
    const vy = velocity * Math.sin(angleRad); 

    
    ball.velocity.set(vx, vy, 0);
}
  
}
