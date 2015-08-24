import * as p2 from "p2";


interface InteractObject {
  obj1: p2.Body;
  obj2: p2.Body;
  func: Function;
  once: boolean;
}


export class Physics{

  world: p2.World;
  interact: InteractObject[];
  player: p2.Body;
  wallMaterial: p2.Material;
  galaxyMaterial: p2.Material;

  constructor(){
    this.world = new p2.World({gravity:[0,0]});
    this.interact = [];

    var playerShape = new p2.Circle({radius:.25});
    this.player = new p2.Body({mass:1, position:[0,0]});
    this.player.addShape(playerShape);
    this.player.damping = .7;
    this.world.addBody(this.player);

    let playerMaterial = new p2.Material();
    this.wallMaterial = new p2.Material();
    this.galaxyMaterial = new p2.Material();
    
    playerShape.material = playerMaterial;

    this.world.addContactMaterial(new p2.ContactMaterial(
      this.wallMaterial, playerMaterial,
      {restitution : .6, stiffness : Number.MAX_VALUE}));

    this.world.addContactMaterial(new p2.ContactMaterial(
      this.wallMaterial, this.galaxyMaterial,
      {restitution : 1, stiffness : 100}));

    this.world.addContactMaterial(new p2.ContactMaterial(
      playerMaterial, this.galaxyMaterial,
      {restitution : 1, stiffness : 10}));

    this.world.on("impact", (evt) => {
      for (let i=0, len=this.interact.length;i<len;i++)
      if ((evt.bodyA.id == this.interact[i].obj1.id && evt.bodyB.id == this.interact[i].obj2.id) ||
        (evt.bodyA.id == this.interact[i].obj2.id && evt.bodyB.id == this.interact[i].obj1.id)){
        this.interact[i].func();
        if (this.interact[i].once) this.interact.splice(i,1);
        break;
      }
    });
  }

  addWall(x,y){
      let wall = new p2.Body({mass:0, position:[x,y]});
      let wallShape = new p2.Box({width:1, height:1});
      wallShape.material = this.wallMaterial;
      wall.addShape(wallShape);
      this.world.addBody(wall);

      return wall;
  }

  addTarget(x,y){
      let t = new p2.Body({mass:50, position:[x,y]});
      let tShape = new p2.Circle({radius:.5});
      tShape.material = this.wallMaterial;
      t.addShape(tShape);
      this.world.addBody(t);
      return t;
  }

  onHit({obj1, obj2, func, once=false}){
    return this.interact.push({obj1, obj2, func, once}) - 1;
  }

  createGalaxy(pos: number[]){
    let shape = new p2.Circle({radius:1});
    let g = new p2.Body({mass:25, position: pos});
    shape.material = this.galaxyMaterial;
    g.addShape(shape);
    g.damping = 0;
    this.world.addBody(g);
    return g;
  }
}