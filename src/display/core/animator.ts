interface AnimationObject {
  start: number;
  func: Function;
  duration: number;
  resolve: Function;
  object: any;
  loop: boolean;
  timer: boolean;
}

export class Animator {
  private animation: AnimationObject[] = [];

  public play({
    func = (dt) => null,
    duration = 1000,
    object = null,
    loop = false,
    timer = false,
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (object && this.animation.filter(o => o.object == object).length)
        return reject('object already in use');
      this.animation.push({start: Date.now(), func, duration, resolve, object, loop, timer});
    }).catch(error => null);
  }

  public stop(object: any): void {
    let i = this.animation.map(o => o.object).indexOf(object);
    if (i >= 0) this.animation.splice(i, 1);
  }

  public step(): void {
    let t = Date.now();
    for (let i = this.animation.length - 1; i >= 0; i--) {
      let dt = t - this.animation[i].start;
      if (dt <= this.animation[i].duration) {
        if (!this.animation[i].timer)
          this.animation[i].func(dt / this.animation[i].duration);
      } else this.onEnd(i);
    }
  }

  public delay(n: number): Promise<any> {
    return this.play({duration: n});
  }

  private onEnd(i: number): void {
    if (this.animation[i].loop) {
      if (this.animation[i].timer) this.animation[i].func(1);
      this.animation[i].start = Date.now(); // + dt % this.animation[i].duration
    } else {
      this.animation[i].func(1);
      this.animation[i].resolve();
      this.animation.splice(i, 1);
    }
  }
}
