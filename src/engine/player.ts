import {WorldObject} from "./worldobject";
import {Controls} from "../controls/controls";

export class Player extends WorldObject {
  keyb: Controls;
  angle: number = 0;

  constructor(view: THREE.Object3D, body: p2.Body, pos: number[]){
    super(view, body);
    this.keyb = new Controls();
    this.body.position = pos;
  }

  move(dt: number){
    this.angle+=dt*this.keyb.turn/500;
    this.body.force[0] = Math.cos(this.angle)*10*this.keyb.up;
    this.body.force[1] = Math.sin(this.angle)*10*this.keyb.up;
  }
}
