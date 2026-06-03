// export class Vector3 {
//   public x: number;
//   public y: number;
//   public z: number;

//   constructor(x: number = 0, y: number = 0, z: number = 0) {
//     this.x = x;
//     this.y = y;
//     this.z = z;
//   }

//   public set(x: number, y: number, z: number): Vector3 {
//     this.x = x;
//     this.y = y;
//     this.z = z;

//     return this;
//   }

//   public clone(): Vector3 {
//     return new Vector3(this.x, this.y, this.z);
//   }

//   public add(vector: Vector3): Vector3 {
//     this.x += vector.x;
//     this.y += vector.y;
//     this.z += vector.z;
//     return this;
//   }

//   public subtract(vector: Vector3): Vector3 {
//     this.x -= vector.x;
//     this.y -= vector.y;
//     this.z -= vector.z;
//     return this;
//   }

//   public multiplyScalar(scaler: number): Vector3 {
//     this.x *= scaler;
//     this.y *= scaler;
//     this.z *= scaler;
//     return this;
//   }

//   public length(): number {
//     return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
//   }

//   public normalize(): Vector3 {
//     const length = this.length();
//     if (length === 0) return this;
//     this.x /= length;
//     this.y /= length;
//     this.z /= length;
//     return this;
//   }

//   public distanceTo(vector: Vector3): number {
//     const dx = this.x - vector.x;
//     const dy = this.y - vector.y;
//     const dz = this.z - vector.z;

//     return Math.sqrt(dx * dx + dy * dy + dz * dz);
//   }


//   public dot(vector: Vector3): number {
//     return this.x * vector.x + this.y * vector.y + this.z * vector.z;
//   }

//   public copy(vector: Vector3): Vector3 {

//     this.x = vector.x;
//     this.y = vector.y;
//     this.z = vector.z;

//     return this;

// }
// public cross(vector: Vector3): Vector3 {

//   return new Vector3(
//     this.y * vector.z - this.z * vector.y,
//     this.z * vector.x - this.x * vector.z,
//     this.x * vector.y - this.y * vector.x
//   );
// }

// public lengthSq(): number {

//   return (
//     this.x * this.x +
//     this.y * this.y +
//     this.z * this.z
//   );
// }
// }
export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public copy(v: Vector3): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }


  public add(v: Vector3): Vector3 {
    return new Vector3(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z
    );
  }

  public subtract(v: Vector3): Vector3 {
    return new Vector3(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z
    );
  }

  public multiplyScalar(s: number): Vector3 {
    return new Vector3(
      this.x * s,
      this.y * s,
      this.z * s
    );
  }

  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }


  public length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  public lengthSq(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }

  public normalize(): Vector3 {
    const len = this.length();
    if (len === 0) return new Vector3(0, 0, 0);
    return this.multiplyScalar(1 / len);
  }

  public distanceTo(v: Vector3): number {
    return this.subtract(v).length();
  }
}