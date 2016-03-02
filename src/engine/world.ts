import {Display3D} from "../display/display";
import {Physics} from "./physics";
import {EllerMaze} from "./ellermaze";
import {GameMessage} from "./msg";
import {WorldObject} from "./worldobject";
import {Player} from "./player";

export class World {
  maze: boolean[][];
  phys: Physics;
  display: Display3D;
  me: Player;
  prevLoopTS: number;
  worldObjects: WorldObject[];
  msg: GameMessage;
  fin: boolean = false;

  constructor(){
    this.phys = new Physics();
    this.display = new Display3D();
    this.maze = EllerMaze(10,10);
    this.msg = new GameMessage();
    let ppos = this.getRandomPosition();
    this.me = new Player(this.display.player, this.phys.player, [ppos.x, ppos.y]);
    this.worldObjects = [this.me];
    this.buildWallsAndFloor();    
    this.addTarget(this.getRandomPosition());
    this.mainLoop();

    let dustCounter = 0;
    this.display.animator.play({
      func: _=> {
        this.display.moreDust();
        console.log(dustCounter);
        if (++dustCounter >= 20)
          this.display.animator.stop(this.display.dustMaterial);
      },
      duration: 10000,
      loop: true,
      timer: true,
      object: this.display.dustMaterial
    });
  }
  
  mainLoop(ts = null) {
    let dt = this.prevLoopTS ? ts - this.prevLoopTS : 1000/60;
    if (dt>100) dt = 100;

    if (!this.fin){
      this.phys.world.step(dt/1000);
      this.me.move(dt);
      this.worldObjects.forEach(x=>x.up(this.display));
      this.display.moveCamera(
        this.me.angle,
        this.me.keyb.up>0,
        this.me.keyb.turn);
    }

    this.display.render(dt);
    this.prevLoopTS = ts;
    requestAnimationFrame((ts) => this.mainLoop(ts));
  }

  getRandomPosition(){
    let w = this.maze[0].length, h = this.maze.length, x, y;
    do{
      x = Math.floor(Math.random()*w);
      y = Math.floor(Math.random()*h);
    }while(this.maze[y][x]);
    return {x,y};
  }

  buildWallsAndFloor(): void{
    let w = this.maze[0].length, h = this.maze.length;
    for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
    if (this.maze[y][x]){
      this.phys.addWall(x,y);
      this.display.addWall(x,y);
    }
    this.display.addEnvironment(w,h);
  }

  addTarget({x,y}){
      var p = this.phys.addTarget(x,y);
      var o = this.display.addMorphingSphere(x,y);
      this.worldObjects.push(new WorldObject(o, p));
      this.destroyOnHit(p, o);
  }

  final() {
    this.display.playFinal(() => this.fin = true, this.me.angle, this.msg);
  }

  destroyOnHit(p:p2.Body, d:THREE.Mesh): void{
    this.phys.onHit({
      obj1: p,
      obj2: this.phys.player,
      once: true,
      func: () => {
        let pos = d.position.clone();
        let physPos = [p.position[0], p.position[1]];
        let i = this.worldObjects.map(o=>o.view.id).indexOf(d.id);
        if (i>=0) this.worldObjects.splice(i,1);

        this.phys.world.removeBody(p);
        this.display.mazeHolder.remove(d);
        this.display.animator.stop(d);

        if (this.msg.next()) 
          this.display.glitchMe(100).then(() => {
            let {animation, view } = this.display.createGalaxy(pos);
            return animation.then(() => {
              let body = this.phys.createGalaxy(physPos);
              this.worldObjects.push(new WorldObject(view, body));
            });
          }).then(() => this.addTarget(this.getRandomPosition()));
        else
          this.final();
    }});
  }
}