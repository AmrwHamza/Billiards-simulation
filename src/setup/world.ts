import * as THREE from "three";
import { Table } from "../enviroment/Table";
import { Room } from "../enviroment/Room";
import { Lighting } from "../enviroment/Lighting";
import { CueStick } from "../enviroment/Cue_Stick";

export function setupWorld(scene: THREE.Scene) {
  // 🎱 الطاولة
  const table = new Table(2.84, 1.42);
  scene.add(table.mesh);

  // 🏠 الغرفة
  const room = new Room();
  scene.add(room.mesh);

  // 💡 الإضاءة
  Lighting.setupLighting(scene);

  // 🎯 العصا
  const cue = new CueStick();
  scene.add(cue.group);

  return {
    table,
    room,
    cue,
  };
}