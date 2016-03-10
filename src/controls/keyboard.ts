import {Controls} from './controls';

export class KeyboardControls extends Controls {
  constructor() {
    super();
    window.onkeydown = (e) => {
      if (e.keyCode == 37) this.turn = -1;
      if (e.keyCode == 38) this.up = 1;
      if (e.keyCode == 39) this.turn = 1;
    };
    window.onkeyup = (e) => {
      if (e.keyCode == 37 || e.keyCode == 39) this.turn = 0;
      if (e.keyCode == 38) this.up = 0;
    };
  }
}
