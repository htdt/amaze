import {WorldObject, Vector2d} from './worldobject';
import {Physics} from './physics';
import {Display3D} from '../display/display';

export class Target extends WorldObject {
  constructor(
    private phys: Physics,
    private display: Display3D,
    v: Vector2d
  ) {
    super(display.morphingSphere.add(v.x, v.y), phys.addTarget(v.x, v.y));
  }

  public onHit(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.phys.onHit({
        obj1: this.body,
        obj2: this.phys.player,
        once: true,
        func: () => resolve(this.destroy()),
      });
    });
  }

  private destroy(): Promise<any> {
    this.phys.world.removeBody(this.body);
    this.display.morphingSphere.onDestroy(this.view);
    this.display.container.remove(this.view);
    return this.addGalaxy();
  }

  private addGalaxy(): Promise<any> {
    let pos = this.view.position.clone();
    let physPos = [this.body.position[0], this.body.position[1]];
    return this.display.glitch.play(100).then(() => {
      this.display.delay(1250).then(() => this.display.glitch.play(750));
      let {animation, view} = this.display.galaxy.add(pos);
      return {
        animation,
        galaxy: new WorldObject(view, this.phys.createGalaxy(physPos)),
      };
    });
  }
}
