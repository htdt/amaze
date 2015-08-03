import Controls from "./controls";
import Physics from "./physics";
import Display3D from "./display";

export default class Player{
  static CHARGE_TIME = 1000;

  keyb: Controls;
  charged: boolean;
  angle: number;
  body: p2.Body;
  display: Display3D;

  charge(): void{
    this.charged = false;
    this.display.animator.play({
      func: dt => this.display.playerMaterial.color.setRGB(1-dt, 1-dt, 1-dt),
      duration: Player.CHARGE_TIME})
      .then(() => this.charged = true);
  }

  constructor(body: Physics, display: Display3D, pos: number[], fire:Function){
    this.keyb = new Controls(() => {
      if (this.charged){
        fire();
        this.charge();
      }
    });

    this.angle = 0;
    this.body = body.player;
    this.body.position = pos;
    this.display = display;
    
    this.charge();
  }

  step(dt): void{
    if (this.keyb.left) this.angle-=dt/500;
    if (this.keyb.right) this.angle+=dt/500;
    if (this.keyb.up) {
      this.body.force[0] = Math.cos(this.angle)*10;
      this.body.force[1] = Math.sin(this.angle)*10;
    }
  }
}