import {Controls} from './controls';
import {NoSleep} from './nosleep';

export class MobileControls extends Controls {
  constructor() {
    super();
    window.addEventListener('deviceorientation', e => this.computeControls(e));
    new NoSleep().enableOnTouch();
  }

  private computeControls(e: DeviceOrientationEvent): void {
    if (this.isPortret()) this.computePortret(e);
    else this.computeLandscape(e);
    if (Math.abs(this.turn) > 2) this.turn = 0;
  }

  private computePortret(e: DeviceOrientationEvent): void {
    if (e.beta <= 75) {
      this.turn = e.gamma / 45;
      this.up =  (75 - e.beta) / 60;
    }
  }

  private computeLandscape(e: DeviceOrientationEvent): void {
    if (Math.abs(e.gamma) <= 60) {
      let dir = e.gamma > 0 ? -1 : 1;
      this.turn = e.beta * dir / 45;
      this.up = (e.gamma * dir + 60) / 40;
    }
  }

  private isPortret(): boolean {
    return window.innerHeight > window.innerWidth;
  }
}
