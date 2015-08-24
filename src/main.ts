import {Physics} from "./physics";
import {Display3D} from "./display";
import {Controls} from "./controls";
import {EllerMaze} from "./ellermaze"


function fullscreen(el){
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  }
}

function InitUI(){
  var fsIcon = document.getElementById("fullscreen");
  if (fsIcon)
    fsIcon.addEventListener("click", () => fullscreen(document.body), false);
}

class WorldObject{
  constructor(public view: THREE.Mesh, public body: p2.Body){}
  up(display: Display3D){display.moveObject(this.view, this.body);}
}

class Player extends WorldObject{
  keyb: Controls;
  angle: number;

  constructor(view: THREE.Mesh, body: p2.Body, pos: number[]){
    super(view, body);
    this.keyb = new Controls();
    this.angle = 0;
    this.body.position = pos;
  }

  move(dt: number){
    this.angle+=dt*this.keyb.turn/500;
    this.body.force[0] = Math.cos(this.angle)*10*this.keyb.up;
    this.body.force[1] = Math.sin(this.angle)*10*this.keyb.up;
  }
}

class World{
  maze: boolean[][];
  phys: Physics;
  display: Display3D;
  me: Player;
  prevLoopTS: number;
  worldObjects: WorldObject[];
  hitCounter: number;
  msg: string[];
  msgDisplay: HTMLElement;

  constructor(){
    this.msg = ["Reality"," does not"," exist"," until"," it is"," measured."];
    this.msgDisplay = document.getElementById("msg");

    this.phys = new Physics();
    this.display = new Display3D();
    this.maze = EllerMaze(10,10);
    
    let ppos = {x:1,y:1};//this.getRandomPosition();
    this.me = new Player(this.display.player, this.phys.player, [ppos.x, ppos.y]);
    this.worldObjects = [this.me];
    this.hitCounter = 0;
    
    this.buildWallsAndFloor();    
    this.addTarget(this.getRandomPosition());
    this.mainLoop();
  }
  
  mainLoop(ts = null) {
    let dt = this.prevLoopTS ? ts - this.prevLoopTS : 1000/60;
    if (dt>100) dt = 100;

    this.phys.world.step(dt/1000);
    this.me.move(dt);
    this.worldObjects.forEach(g=>g.up(this.display));
    this.display.moveCamera(this.me.angle);
    this.display.render();

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
        this.display.scene.remove(d);
        this.display.animator.stop(d);

        if (this.msgDisplay)
          this.msgDisplay.innerText += this.msg[this.hitCounter++];

        this.display.glitchMe(100).then(() => {
          let {animation, view } = this.display.createGalaxy(pos);
          animation.then(() => {
            let body = this.phys.createGalaxy(physPos);
            this.worldObjects.push(new WorldObject(view, body));
          });
        }).then(()=>this.addTarget(this.getRandomPosition()));
    }});
  }
}

InitUI();
new World();
