import THREE from "three.js/build/three"

class ProtoObject{
  constructor(pos:THREE.Vector2, ch:string){
    this.position = pos;
    this.char = ch;
  }
}
class Player extends ProtoObject{
  constructor(...args) { super(...args); }
}

var actorChars = {
  
};

var staticChars = {
  "#": ProtoObject,
  "@": Player
};

export default class World{
  constructor(plan){
    this.width = plan[0].length;
    this.height = plan.length;
    this.grid = [];
    this.actors = [];

    for (let y = 0; y < this.height; y++)
    for (let x = 0; x < this.width; x++) {
      let ch = plan[y][x];
      if (ch in actorChars) this.actors.push(new actorChars[ch](new THREE.Vector2(x, y), ch));
      else if (ch in staticChars) this.grid.push(new staticChars[ch](new THREE.Vector2(x, y), ch));
    }
  }
}