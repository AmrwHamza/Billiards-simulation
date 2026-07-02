import * as THREE from "three";
import { Table } from "../environment/Table";
import { Room } from "../environment/Room";
import { Lighting } from "../environment/Lighting";
import { CueStick } from "../environment/Cue_Stick";

export function setupWorld(scene: THREE.Scene) {
  const table = new Table(2.84, 1.42);
  scene.add(table.mesh);

  const room = new Room();
  scene.add(room.mesh);

  
  Lighting.setupLighting(scene);

  const cue = new CueStick();
  scene.add(cue.group);

  return {
    table,
    room,
    cue,
  };
}
