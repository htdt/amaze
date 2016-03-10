import {WorldObject} from './worldobject';
import {Vector2d} from './worldobject';
import {isMobile, Controls} from '../controls/controls';
import {KeyboardControls} from '../controls/keyboard';
import {MobileControls} from '../controls/mobile';

export class Player extends WorldObject {
  public keyb: Controls;
  public angle: number = 0;

  constructor(view: THREE.Object3D, body: p2.Body, pos: Vector2d) {
    super(view, body);
    if (isMobile()) this.keyb = new MobileControls();
    else this.keyb = new KeyboardControls();
    this.body.position = [pos.x, pos.y];
  }

  public move(dt: number): void {
    this.angle += dt * this.keyb.turn / 500;
    this.body.force[0] = Math.cos(this.angle) * 10 * this.keyb.up;
    this.body.force[1] = Math.sin(this.angle) * 10 * this.keyb.up;
  }
}
