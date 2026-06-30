import { Ball } from "./enviroment/Ball";
import { Vector3 } from "./math/Vector3";

export class Physics {
  static gravity = 9.81;
  static friction = 0.2;
  static restitution = 0.9;

  static rollingResistance = 0.01;
  static spinFriction = 0.008;
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

    this.resolveWallCollision(ball);

    const STOP_VELOCITY_THRESHOLD = 0.01;
    const STOP_ANGULAR_THRESHOLD = 0.01;

    if (
      ball.velocity.length() < STOP_VELOCITY_THRESHOLD &&
      ball.angularVelocity.length() < STOP_ANGULAR_THRESHOLD
    ) {
      ball.velocity = new Vector3(0, 0, 0);
      ball.angularVelocity = new Vector3(0, 0, 0);
    }
    // ball.angularVelocity.z = 0;
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
    const slip = this.getSlipVector(ball);
    const slipSpeed = slip.length();
    const vSpeed = ball.velocity.length();

    if (slipSpeed > 1e-6) {
      const direction = slip.normalize();
      const magnitude = this.friction * ball.mass * Physics.gravity;
      return direction.multiplyScalar(-magnitude);
    }

    // if (vSpeed > 0.01) {
    //   const direction = ball.velocity.clone().normalize();
    //   const magnitude = this.rollingFriction * ball.mass * Physics.gravity;
    //   return direction.multiplyScalar(-magnitude);
    // }

    return new Vector3(0, 0, 0);
  }

  static getTorque(ball: Ball): Vector3 {
    const slip = this.getSlipVector(ball);
    const friction = this.getFriction(ball);

    let torque = new Vector3(
      friction.y * ball.radius,
      -friction.x * ball.radius,
      0,
    );

    // 🔥 NEW: rolling resistance (even when slip = 0)
    const omega = ball.angularVelocity;
    const omegaxy = new Vector3(omega.x, omega.y, 0);

    const omegaMag = omegaxy.length();

    if (omegaMag > 1e-6) {
      const normalForce = ball.mass * Physics.gravity;
      const magnitude =
        (2 / 5) * Physics.rollingResistance * normalForce * ball.radius;

      const opp = omegaxy.clone().multiplyScalar(-1 / omegaMag);

      const rollingTorque = opp.multiplyScalar(magnitude);

      torque = torque.add(rollingTorque);
    }
    const spinOmega = new Vector3(0, 0, ball.angularVelocity.z);

    let spinTorque = new Vector3();

    if (spinOmega.length() > 0) {
      spinTorque = spinOmega
        .normalize()
        .multiplyScalar(
          -Physics.spinFriction * ball.mass * Physics.gravity * ball.radius,
        );
    }
    torque = torque.add(spinTorque);
    return torque;
  }
  // static getTorque(ball: Ball): Vector3 {
  //   const slip = this.getSlipVector(ball);
  //   const friction = this.getFriction(ball);

  //   let torque = new Vector3(
  //     friction.y * ball.radius,
  //     -friction.x * ball.radius,
  //     0
  //   );

  //   // 🔥 NEW: rolling resistance (even when slip = 0)
  //   const omega = ball.angularVelocity;
  //   const omegaMag = omega.length();

  //   if (omegaMag > 1e-6) {
  //     const normalForce = ball.mass * Physics.gravity;
  //     const magnitude =
  //       Physics.rollingResistance * normalForce * ball.radius;

  //     const opp = omega.clone().multiplyScalar(-1 / omegaMag);

  //     const rollingTorque = opp.multiplyScalar(magnitude);

  //     torque = torque.add(rollingTorque);
  //   }
  //  const spinTorque = new Vector3(
  //     0,
  //     0,
  //     -Physics.spinFriction * ball.mass * Physics.gravity * ball.radius * Math.sign(ball.angularVelocity.z)
  //   );
  //   torque = torque.add(spinTorque);
  //   return torque;
  // }
  static getSlipVector(ball: Ball): Vector3 {
    const omegaCrossR = new Vector3(
      -ball.angularVelocity.y * ball.radius,
      ball.angularVelocity.x * ball.radius,
      0,
    );

    const slip = ball.velocity.add(omegaCrossR);

    if (slip.length() < 0.01) {
      return new Vector3(0, 0, 0);
    }

    return slip;
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

  static resolveWallCollision(ball: Ball): void {
    const halfX = 2.84 / 2;
    const halfY = 1.42 / 2;
    const r = ball.radius;

    const e = Physics.restitution;
    const mu = 0.15;

    const solveWall = (normal: Vector3, penetration: number) => {
      ball.position = ball.position.add(normal.multiplyScalar(penetration));

      const rContact = normal.multiplyScalar(-r);
      const omegaCrossR = ball.angularVelocity.cross(rContact);

      const vContact = ball.velocity.add(omegaCrossR);

      const vN = vContact.dot(normal);

      if (vN >= 0) return;

      const invMass = 1 / ball.mass;

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
    };

    // جدار يمين
    if (ball.position.x + r > halfX) {
      solveWall(new Vector3(-1, 0, 0), ball.position.x + r - halfX);
    }

    // جدار يسار
    if (ball.position.x - r < -halfX) {
      solveWall(new Vector3(1, 0, 0), -halfX - (ball.position.x - r));
    }

    // جدار أعلى
    if (ball.position.y + r > halfY) {
      solveWall(new Vector3(0, -1, 0), ball.position.y + r - halfY);
    }

    // جدار أسفل
    if (ball.position.y - r < -halfY) {
      solveWall(new Vector3(0, 1, 0), -halfY - (ball.position.y - r));
    }
  }
  static resolveBallCollision(a: Ball, b: Ball): void {
    const delta = b.position.clone().subtract(a.position);
    delta.z = 0;

    const distSq = delta.x * delta.x + delta.y * delta.y;
    const minDist = a.radius + b.radius;

    if (distSq > minDist * minDist || distSq === 0) return;

    const dist = Math.sqrt(distSq);
    const normal = delta.clone().multiplyScalar(1 / dist);

    const rA = normal.clone().multiplyScalar(a.radius);
    const rB = normal.clone().multiplyScalar(-b.radius);

    const crossZ = (omegaZ: number, r: Vector3) =>
      new Vector3(-omegaZ * r.y, omegaZ * r.x, 0);

    const vA_contact = a.velocity
      .clone()
      .add(a.angularVelocity.clone().cross(rA));
    const vB_contact = b.velocity
      .clone()
      .add(b.angularVelocity.clone().cross(rB));
    const relVel = vA_contact.clone().subtract(vB_contact);
    const velAlongNormal = relVel.x * normal.x + relVel.y * normal.y;

    if (velAlongNormal < 0) return; //////////////////////////////
    const e = Physics.restitution;
    const ballFriction = 0.05;

    const invMassA = 1 / a.mass;
    const invMassB = 1 / b.mass;
    const invMassSum = invMassA + invMassB;

    let jN = -(1 + e) * velAlongNormal;
    jN /= invMassSum;

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
    const slipSpeed = this.getSlipVector(ball).length();

    // إيقاف نهائي عند التوقف شبه التام
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
    // جرب هذه القيمة، فهي أقرب لواقع حجم كرات البلياردو
    const holeRadius = 0.045;
    // إحداثيات الثقوب الستة (4 زوايا + 2 في المنتصف)
    const holes = [
      // الثقوب الأربعة للزوايا
      { x: halfX, y: halfY },
      { x: halfX, y: -halfY },
      { x: -halfX, y: halfY },
      { x: -halfX, y: -halfY },
      // الثقبان في منتصف الجوانب الطويلة
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
}
