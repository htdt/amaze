import * as p2 from 'p2';

interface InteractObject {
  obj1: p2.Body;
  obj2: p2.Body;
  func: Function;
  once: boolean;
}

export class Physics {
  public world: p2.World;
  public player: p2.Body;
  private interact: InteractObject[] = [];
  private wallMaterial: p2.Material = new p2.Material();
  private galaxyMaterial: p2.Material = new p2.Material();
  private targetMaterial: p2.Material = new p2.Material();
  private playerMaterial: p2.Material = new p2.Material();

  constructor() {
    this.world = new p2.World({gravity: [0, 0]});
    this.initContactMaterials();
    this.initPlayer();
    this.initImpact();
  }

  public addWall(x, y): p2.Body {
      let wall = new p2.Body({mass: 0, position: [x, y]});
      let wallShape = new p2.Box({width: 1, height: 1});
      wallShape.material = this.wallMaterial;
      wall.addShape(wallShape);
      this.world.addBody(wall);
      return wall;
  }

  public addTarget(x, y): p2.Body {
      let t = new p2.Body({mass: 50, position: [x, y]});
      let tShape = new p2.Circle({radius: .5});
      tShape.material = this.targetMaterial;
      t.addShape(tShape);
      this.world.addBody(t);
      return t;
  }

  public onHit({obj1, obj2, func, once = false}): number {
    return this.interact.push({obj1, obj2, func, once}) - 1;
  }

  public createGalaxy(pos: number[]): p2.Body {
    let shape = new p2.Circle({radius: 1 / 1.25});
    let g = new p2.Body({mass: 25, position: pos});
    shape.material = this.galaxyMaterial;
    g.addShape(shape);
    g.damping = 0;
    this.world.addBody(g);
    return g;
  }

  private initPlayer() {
    let playerShape = new p2.Circle({radius: 1 / 3});
    playerShape.material = this.playerMaterial;
    this.player = new p2.Body({mass: 1, position: [0, 0]});
    this.player.addShape(playerShape);
    this.player.damping = .5;
    this.world.addBody(this.player);
  }

  private initContactMaterials(): void {
    this.world.addContactMaterial(new p2.ContactMaterial(
      this.wallMaterial, this.playerMaterial,
      {restitution : 1, stiffness : 500}));
    this.world.addContactMaterial(new p2.ContactMaterial(
      this.wallMaterial, this.galaxyMaterial,
      {restitution : 1, stiffness : 50}));
    this.world.addContactMaterial(new p2.ContactMaterial(
      this.playerMaterial, this.galaxyMaterial,
      {restitution : 1, stiffness : 7}));
    this.world.addContactMaterial(new p2.ContactMaterial(
      this.targetMaterial, this.playerMaterial,
      {restitution : 2, stiffness : Number.MAX_VALUE}));
  }

  private initImpact(): void {
    this.world.on('impact', (evt) => {
      for (let i = this.interact.length - 1; i >= 0; i--)
      if ((evt.bodyA.id == this.interact[i].obj1.id && evt.bodyB.id == this.interact[i].obj2.id) ||
        (evt.bodyA.id == this.interact[i].obj2.id && evt.bodyB.id == this.interact[i].obj1.id)) {
        this.interact[i].func();
        if (this.interact[i].once) this.interact.splice(i, 1);
        break;
      }
    });
  }
}
