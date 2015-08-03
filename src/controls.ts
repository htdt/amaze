export default class Controls{
  left: boolean;
  right: boolean;
  up: boolean;
  spaceFunc: Function;
  
  constructor(spaceFunc){
    this.left = false;
    this.right = false;
    this.up = false;
    this.spaceFunc = spaceFunc;

    window.onkeydown = (e) => {
      if (e.keyCode == 37) this.left = true;
      if (e.keyCode == 38) this.up = true;
      if (e.keyCode == 39) this.right = true;
    }

    window.onkeyup = (e) => {
      if (e.keyCode == 37) this.left = false;
      if (e.keyCode == 38) this.up = false;
      if (e.keyCode == 39) this.right = false;
      if (e.keyCode == 32) this.spaceFunc();
    }
  }

}