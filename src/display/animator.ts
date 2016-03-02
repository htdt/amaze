interface AnimationObject{
  start: number;
  func: Function;
  duration: number;
  resolve: Function;
  object: any;
  loop: boolean;
  timer: boolean;
}

export class Animator{
  animation: AnimationObject[];

  constructor(){
    this.animation = [];
  }
  
  play({func=(dt)=>null, duration=1000, object=null, loop=false, timer=false}): Promise<any>{
    var animation = this.animation;
    return new Promise(function(resolve, reject){
      if (object && animation.filter(o=>o.object==object).length)
        return reject("object already in use");
      animation.push({start: Date.now(), func, duration, resolve, object, loop, timer});
      //if (loop) reject("endless animation");
    }).catch(error => null);
  }

  stop(object:any){
    let i = this.animation.map(o=>o.object).indexOf(object);
    if (i>=0) this.animation.splice(i,1);
  }

  step(): void{
    for (let i=0, len = this.animation.length;i<len;i++){
      let dt = Date.now() - this.animation[i].start;

      if (dt<=this.animation[i].duration){
        if (!this.animation[i].timer)
          this.animation[i].func(dt/this.animation[i].duration);
      }
      else if (this.animation[i].loop) {
        if (this.animation[i].timer)
           this.animation[i].func(1);

        this.animation[i].start = Date.now();//+ dt % this.animation[i].duration
      }
      else {
        this.animation[i].func(1);
        this.animation[i].resolve();
        this.animation.splice(i,1);
        i--;len--;
      }
    }
  }
}