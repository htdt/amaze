import Physics from "./physics";
import Display3D from "./display";
import Controls from "./controls";

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
  maze: string[];
  phys: Physics;
  display: Display3D;
  me: Player;
  prevLoopTS: number;
  worldObjects: WorldObject[];

  constructor(){
    this.phys = new Physics();
    this.display = new Display3D();
    this.me = new Player(this.display.player, this.phys.player, [2,2]);

    this.worldObjects = [this.me];

    this.generateMaze();
    this.buildWallsAndFloor();
    this.addTarget(this.getRandomPosition());
    this.mainLoop();
  }
  
  mainLoop(ts = null) {
    let dt = this.prevLoopTS ? ts - this.prevLoopTS : 1000/60;

    this.phys.world.step(dt/1000);
    //this.display.moveObject(this.display.player, this.me.body);
    this.me.move(dt);
    this.worldObjects.forEach(g=>g.up(this.display));
    this.display.moveCamera(this.me.angle);
    this.display.render();

    this.prevLoopTS = ts;
    requestAnimationFrame((ts) => this.mainLoop(ts));
  }

  generateMaze(): void{
    this.maze =
      ["############################",
      "#      #    #             ##",
      "#                          #",
      "#          #####           #",
      "##         #   #    ##     #",
      "###    *      ##     #     #",
      "#           ###      #     #",
      "#   ####                   #",
      "#   ##        ######       #",
      "#    #   ######     ###### #",
      "#    #                     #",
      "#      #    #             ##",
      "#                          #",
      "#          #####           #",
      "##         #   #    ##     #",
      "###           ##     #     #",
      "#           ###      #     #",
      "#   ####                   #",
      "#   ##        ######       #",
      "#    #   ######     ###### #",
      "#    #                     #",
      "############################"];
  }

  /*generateMaze(width=11, height=11, complexity=.75, density=.75){

    var shape = [(height >> 1 << 1) + 1, (width >> 1 << 1) + 1];

    complexity = Math.floor(complexity * (5 * (shape[0] + shape[1])));
    density  = Math.floor(density * (shape[0] >> 1) * (shape[1] >> 1));

    var Z = Array(shape[0]*shape[1]).fill(0);
    var i, j, x, y, x_, y_;
    var neighbours = [];

    for (i=0; i<width; i++) Z[i] = Z[i + width*(height-1)] = "1";
    for (i=1; i<height-1; i++) Z[width*i] = Z[width*(i+1)-2] = "1";

    for (i=0;i<density;i++){
      x = Math.round(Math.random() * (shape[1] >> 1))*2;
      y = Math.round(Math.random() * (shape[0] >> 1))*2;
      Z[x+y*width] = 1;

      for (j=0;j<complexity;j++){
        neighbours = []
        if (x > 1)          neighbours.push([y, x-2]);
        if (x < shape[1]-2) neighbours.push([y, x+2]);
        if (y > 1)          neighbours.push([y-2, x]);
        if (y < shape[0]-2) neighbours.push([y+2, x]);

        if (neighbours.length){
          [y_,x_] = neighbours[Math.floor(Math.random()*neighbours.length)];
          if (Z[y_*width + x_] == 0){
            Z[y_*width + x_] = 1;
            Z[(y_ + (y - y_) >> 1)*width + x_ + (x - x_) >> 1] = 1;
            [x, y] = [x_, y_];
          }
        }
      }
    }

    console.log(density, complexity);

    for (i=0; i<height; i++){
      console.log(Z.slice(i*width, (i+1)*width-1).join(""));
    }
  }
/*
    Z[0, :] = Z[-1, :] = 1
    Z[:, 0] = Z[:, -1] = 1
    # Make aisles
    for i in range(density):
        x, y = rand(0, shape[1] // 2) * 2, rand(0, shape[0] // 2) * 2
        Z[y, x] = 1
        for j in range(complexity):
            neighbours = []
            if x > 1:             neighbours.append((y, x - 2))
            if x < shape[1] - 2:  neighbours.append((y, x + 2))
            if y > 1:             neighbours.append((y - 2, x))
            if y < shape[0] - 2:  neighbours.append((y + 2, x))
            if len(neighbours):
                y_,x_ = neighbours[rand(0, len(neighbours) - 1)]
                if Z[y_, x_] == 0:
                    Z[y_, x_] = 1
                    Z[y_ + (y - y_) // 2, x_ + (x - x_) // 2] = 1
                    x, y = x_, y_
*/

  getRandomPosition(){
    let w = this.maze[0].length, h = this.maze.length, x, y;
    do{
      x = Math.floor(Math.random()*w);
      y = Math.floor(Math.random()*h);
    }while(this.maze[y][x]!=" ");
    return {x,y};
  }

  buildWallsAndFloor(): void{
    let w = this.maze[0].length, h = this.maze.length;

    for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
    if (this.maze[y][x] == "#"){
      this.phys.addWall(x,y);
      this.display.addWall(x,y);
    }

    this.display.addEnvironment(w,h);
  }

  addTarget({x,y}){
      var p = this.phys.addWall(x,y);
      var o = this.display.addMorphingSphere(x,y);
      this.destroyOnHit(p, o);
  }

  destroyOnHit(p:p2.Body, d:THREE.Mesh): void{
    this.phys.onHit({
      obj1: p,
      obj2: this.phys.player,
      once: true,
      func: () => {
        let pos = d.position.clone();
        let physPos = [];
        physPos[0] = p.position[0];
        physPos[1] = p.position[1];
        //.slice(0); //array clone
        this.phys.world.removeBody(p);
        this.display.scene.remove(d);
        this.display.animator.stop(d);

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

new World();