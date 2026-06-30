import * as THREE from "three";

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 2.8, 0);
  camera.lookAt(0, 0, 0);

  return camera;
}