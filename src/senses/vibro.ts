export class Vibro {
  constructor() {
    navigator.vibrate = navigator.vibrate || (<any>navigator).webkitVibrate || (<any>navigator).mozVibrate || (<any>navigator).msVibrate;
  }

  public play(duration: number): void {
    if (navigator.vibrate) navigator.vibrate(duration);
  }
}
