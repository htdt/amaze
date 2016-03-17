import {Animator} from '../core/animator';
import {Display3D} from '../display';
import {GameMessage} from '../../engine/msg';
import {Player} from '../objects/player';
import {Camera} from './camera';
import {HeadMaterials} from '../objects/head';

export class Final {
  private animator: Animator;
  private player: Player;
  private camera: Camera;

  constructor(private display: Display3D, private msg: GameMessage) {
    this.animator = this.display.animator;
    this.player = this.display.player;
    this.camera = this.display.camera;
  }

  public into(): Promise<any> {
    return this.animator.delay(3000)
      .then(() => this.display.glitch.play(200))
      .then(() => this.animator.delay(1500))
      .then(() => this.display.glitch.play(200))
      .then(() => this.animator.delay(1500))
      .then(() => this.display.glitch.play(700))
      .then(() => this.animator.delay(1500));
  }

  public play(): void {
      this.display.glitch.play(700).then(() => {
        this.display.rmContainer();
        this.msg.hide();
        return this.animator.delay(1000);
      }).then(() => {
        this.camera.final(5000);
        return this.player.final(5000);
      })
      .then(() => this.fadeinHeadPoly(20000))
      .then(() => {
        this.display.addFinalLight();
        this.msg.final();
        this.msg.show();
        this.display.glitch.play(70);
        this.rndHeadPoly();
        this.rndHeadMaterial();
     });
  }

  private fadeinHeadPoly(duration: number): Promise<any> {
    return this.animator.play({
        func: d => this.player.head.lowpoly(d * d * 994 + 6),
        duration,
      });
  }

  private rndHeadPoly(): void {
    this.animator.play({
      func: _ => {
        if (Math.random() > .93) {
          this.player.head.lowpoly(Math.pow(Math.random(), 2) * 994 + 6);
          this.display.glitch.play(200);
        }
      },
      duration: 1000, timer: true, loop: true,
    });
  }

  private rndHeadMaterial(): void {
    this.player.head.setMaterial(HeadMaterials.Solid);
    this.animator.play({
      func: _ => {
        let rnd = Math.random();
        let updated = false;
        if (rnd < .075) {
          this.msg.show();
          updated = this.player.head.setMaterial(HeadMaterials.Solid);
        }
        else if (rnd > .075 && rnd < .15) {
          this.msg.hide();
          updated = this.player.head.setMaterial(HeadMaterials.Wire);
        }
        else if (rnd > .15 && rnd < .225) {
          this.msg.show();
          updated = this.player.head.setMaterial(HeadMaterials.Space);
        }
        if (updated) this.display.glitch.play(70);
      },
      duration: 1000, timer: true, loop: true,
    });
  }
}
