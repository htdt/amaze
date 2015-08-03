export default class Controls{
  turn: number;
  up: number;
  
  constructor(){
    this.turn = 0;
    this.up = 0;

    if (!this.isMobile()) this.listenDesktopEvents();
    else this.listenMobileEvents();
  }

  listenDesktopEvents(){
    window.onkeydown = (e) => {
      if (e.keyCode == 37) this.turn = -1;
      if (e.keyCode == 38) this.up = 1;
      if (e.keyCode == 39) this.turn = 1;
    }

    window.onkeyup = (e) => {
      if (e.keyCode == 37 || e.keyCode == 39) this.turn = 0;
      if (e.keyCode == 38) this.up = 0;
    }
  }

  listenMobileEvents(){
    window.addEventListener("deviceorientation", (e) => {
      this.turn = e.beta/45;
      if (e.gamma<0 && e.gamma>=-60) this.up = (e.gamma+60)/60;
      else this.up = 0;
    }, true);
  }

  isMobile(): boolean {
    return typeof window.orientation !== 'undefined';
  }
}
