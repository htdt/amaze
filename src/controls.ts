export class Controls{
  turn: number;
  up: number;
  
  constructor(){
    this.turn = 0;
    this.up = 0;

    if (!Controls.isMobile()) this.listenDesktopEvents();
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
      if(window.innerHeight > window.innerWidth){ //portret
        this.turn = e.gamma/45;        
        if (e.beta<75) this.up =  Math.min((75-e.beta)/60,1);
        else this.up = 0;
      }else{
        if (e.gamma<0){
          this.turn = e.beta/45;
          if (e.gamma>=-60) this.up = Math.min((e.gamma+60)/40,1);
          else this.up = 0;
        }else{
          this.turn = -e.beta/45;
          if (e.gamma<=60) this.up = Math.min((60-e.gamma)/40,1);
          else this.up = 0;
        }
      }
    }, true);
  }

  static isMobile(): boolean {
    return typeof window.orientation !== 'undefined';
  }
}
