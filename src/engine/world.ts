import {Display3D} from '../display/display';
import {Final} from '../display/core/final';
import {Physics} from './physics';
import {EllerMaze} from './ellermaze';
import {GameMessage} from './msg';
import {WorldObject, Vector2d} from './worldobject';
import {Player} from './player';
import {Target} from './target';

export class World {
  private maze: boolean[][];
  private phys: Physics;
  private display: Display3D;
  private me: Player;
  private prevLoopTS: number;
  private worldObjects: WorldObject[];
  private msg: GameMessage;
  private stoped: boolean = false;
  private final: Final;

  constructor() {
    this.phys = new Physics();
    this.display = new Display3D();
    this.maze = EllerMaze(10, 10);
    this.msg = new GameMessage();
    this.me = new Player(this.display.player.container, this.phys.player, this.getRandomPosition());
    this.final = new Final(this.display, this.msg);
    this.worldObjects = [this.me];
    this.addTarget();
    this.buildWallsAndFloor();
    this.mainLoop();
  }

  private gameStep(dt: number): void {
    this.phys.world.step(dt / 1000);
    this.me.move(dt);
    this.worldObjects.forEach(x => x.up(this.display));
    this.display.camera.move(
      this.me.angle,
      this.me.keyb.up > 0,
      this.me.keyb.turn);
  }

  private mainLoop(ts = null): void {
    let dt = this.prevLoopTS ? ts - this.prevLoopTS : 1000 / 60;
    if (dt > 100) dt = 100;
    if (!this.stoped) this.gameStep(dt);
    this.display.render(dt);
    this.prevLoopTS = ts;
    requestAnimationFrame(x => this.mainLoop(x));
  }

  private addTarget(): void {
    let target = new Target(this.phys, this.display, this.getRandomPosition());
    target.onHit().then(({animation, galaxy}) => {
      this.worldObjects.push(galaxy);
      animation.then(() => this.scorePoint(target));
    });
    this.worldObjects.push(target);
  }

  private getRandomPosition(): Vector2d {
    let w = this.maze[0].length, h = this.maze.length, x, y;
    do {
      x = Math.floor(Math.random() * w);
      y = Math.floor(Math.random() * h);
    } while (this.maze[y][x]);
    return {x, y};
  }

  private buildWallsAndFloor(): void {
    let w = this.maze[0].length, h = this.maze.length;
    for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
    if (this.maze[y][x]) {
      this.phys.addWall(x, y);
      this.display.addWall(x, y);
    }
    this.display.addEnvironment(w, h);
  }

  private scorePoint(oldTarget: Target): void {
    if (this.msg.next()) {
      this.rmWorldObject(oldTarget);
      this.addTarget();
    } else
      this.final.into().then(() => {
        this.stoped = true;
        this.final.play();
      });
  }

  private rmWorldObject(obj: WorldObject): void {
    let i = this.worldObjects.map(o => o.view.id).indexOf(obj.view.id);
    if (i >= 0) this.worldObjects.splice(i, 1);
  }
}
