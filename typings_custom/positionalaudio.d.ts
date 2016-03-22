declare module THREE {
  export class PositionalAudio extends THREE.Audio {
    autoplay: boolean;
    constructor(listner: THREE.AudioListener);
    load(path: string);
    setRefDistance(n: number);
    setLoop(x: boolean);
    setVolume(x: number);
    setDistanceModel(x: string);
  }
}
