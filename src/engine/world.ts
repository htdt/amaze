import {Display3D} from '../display/display';
import {Physics} from './physics';
import {EllerMaze} from './ellermaze';
import {GameMessage} from './msg';
import {WorldObject, Vector2d} from './worldobject';
import {Player} from './player';
import {Target} from './target';
import {isMobile} from '../controls/controls';

export class World {
  private maze: boolean[][];
  private phys: Physics;
  private display: Display3D;
  private me: Player;
  private prevLoopTS: number;
  private worldObjects: WorldObject[];
  private msg: GameMessage;
  private stopped: boolean = false;

  constructor() {
    this.msg = new GameMessage();
    this.phys = new Physics();
    this.display = new Display3D(this.msg);
    this.maze = isMobile() ? EllerMaze(9, 9) : EllerMaze(12, 12);
    this.me = new Player(this.display.player.container, this.phys.player, this.getRandomPosition());
    this.worldObjects = [this.me];
    this.buildWallsAndFloor();
    this.addTarget();
    this.mainLoop();
  }

  private mainLoop(ts = null): void {
    let dt = this.prevLoopTS ? ts - this.prevLoopTS : 1000 / 60;
    if (dt > 100) dt = 100;
    if (!this.stopped) this.gameStep(dt);
    this.display.render(dt);
    this.prevLoopTS = ts;
    requestAnimationFrame(x => this.mainLoop(x));
  }

  private gameStep(dt: number): void {
    this.phys.world.step(dt / 1000);
    this.me.move(dt);
    this.worldObjects.forEach(x => x.update(this.display));
    this.display.camera.move(
      this.me.angle,
      this.me.keyb.up > 0,
      this.me.keyb.turn);
  }

  private addTarget(): void {
    let target = new Target(this.phys, this.display, this.getRandomPosition());
    target.onHit().then(({animation, galaxy}) => {
      this.worldObjects.push(galaxy);
      let end = !this.msg.next();
      animation.then(() => this.nextLevel(end, target));
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

  private nextLevel(isEnd: boolean, oldTarget: Target): void {
    if (!isEnd) {
      this.rmWorldObject(oldTarget);
      this.addTarget();
    }
    else this.display.final.into().then(() => {
      this.stopped = true;
      this.display.final.play();
    });
  }

  private rmWorldObject(obj: WorldObject): void {
    let i = this.worldObjects.map(o => o.view.id).indexOf(obj.view.id);
    if (i >= 0) this.worldObjects.splice(i, 1);
  }
}
