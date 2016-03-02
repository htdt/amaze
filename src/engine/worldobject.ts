import {Display3D} from "../display/display";

export class WorldObject {
  constructor(public view: any, public body: p2.Body) {}
  public up(display: Display3D) {
    display.moveObject(this.view, this.body);
  }
}
