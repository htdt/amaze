import {Display3D} from '../display/display';

export class WorldObject {
  constructor(public view: any, public body: p2.Body) {}
  public update(display: Display3D) {
    display.moveObject(this.view, this.body);
  }
}

export interface Vector2d {
  x: number;
  y: number;
}
