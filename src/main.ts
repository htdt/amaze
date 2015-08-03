import Physics from "./physics";
import Display3D from "./display";
import Player from "./player";

class WorldObject{
  constructor(private view: THREE.Mesh, private body: p2.Body){}
  up(display: Display3D){display.moveObject(this.view, this.body);}
}

class World{
  maze: string[];
  phys: Physics;
  display: Display3D;
  me: Player;
  prevLoopTS: number;
  galaxies: WorldObject[];

  constructor(){
    this.phys = new Physics();
    this.display = new Display3D();
    this.me = new Player(this.phys, this.display, [2,2], () => {
      let {animation, view } = this.display.createGalaxy(this.display.player.position);
      animation.then(() => {
        let body = this.phys.createGalaxy(this.phys.player.position);
        this.galaxies.push(new WorldObject(view, body));
      });
    });

    this.galaxies = [];

    this.generateMaze();
    this.buildWallsAndFloor();
    this.mainLoop();
  }
  
  mainLoop(ts = null) {
    let dt = this.prevLoopTS ? ts - this.prevLoopTS : 1000/60;

    this.me.step(dt);
    this.phys.world.step(dt/1000);
    this.display.moveObject(this.display.player, this.me.body);
    this.galaxies.forEach(g=>g.up(this.display));
    this.display.moveCamera(this.me.angle);
    this.display.render();

    this.prevLoopTS = ts;
    requestAnimationFrame((ts) => this.mainLoop(ts));
  }

  generateMaze(): void{
    this.maze =
      ["############################",
      "#      #    #             ##",
      "#     *                    #",
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
      "#     *    #####           #",
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

  getRandomPosition(): number[]{
    let w = this.maze[0].length, h = this.maze.length, x, y;
    do{
      x = Math.floor(Math.random()*w);
      y = Math.floor(Math.random()*h);
    }while(this.maze[y][x]!=" ");
    return [x,y];
  }

  buildWallsAndFloor(): void{
    let w = this.maze[0].length, h = this.maze.length;

    for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++){
      if (this.maze[y][x] == "#" || this.maze[y][x] == "*"){
        var wallPhys = this.phys.addWall(x,y);
        var wallView = this.display.addWall(x,y, this.maze[y][x] == "*");        
        if (this.maze[y][x] == "*") this.destroyOnHit(wallPhys, wallView);
      }
    }
    this.display.addEnvironment(w,h);
  }

  destroyOnHit(p:p2.Body, d:THREE.Mesh): void{
    this.phys.onHit({
      obj: p,
      once: true,
      func: () => {
        let pos = d.position.clone();
        let physPos = p.position.slice(); //array clone
        this.phys.world.removeBody(p);
        this.display.scene.remove(d);
        this.display.animator.stop(d);

        this.display.glitchMe(100).then(() => {
          let {animation, view } = this.display.createGalaxy(pos);
          animation.then(() => {
            let body = this.phys.createGalaxy(physPos);
            this.galaxies.push(new WorldObject(view, body));
          });
        });
    }});
  }
}

let w = new World();