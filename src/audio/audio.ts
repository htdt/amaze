// https://github.com/mrdoob/three.js/blob/master/examples/misc_sound.html

import {Animator} from '../display/core/animator';
import {Camera} from '../display/core/camera';
import {Player} from '../display/objects/player';

import '../vendor/audio/Audio';
import '../vendor/audio/AudioAnalyser';
import '../vendor/audio/AudioBuffer';
import '../vendor/audio/AudioListener';
import '../vendor/audio/PositionalAudio';

export class Audio {
  public bgFinal: THREE.Audio;
  public hit: THREE.Audio;
  private bgWind: THREE.Audio;
  private bgBreath: THREE.Audio;
  private glitches: THREE.Audio[] = [];
  private sounds: THREE.PositionalAudio[] = [];
  private listener: THREE.AudioListener;
  private stopped: boolean = false;
  private muted: boolean = false;

  constructor(animator: Animator, scene: THREE.Scene) {
    this.listener = new THREE.AudioListener();
    scene.add(this.listener);
    this.init();
  }

  public toggleMute(): void {
    this.muted = !this.muted;
    (<any>this.listener).setMasterVolume(this.muted ? 0 : 1);
  }

  public glitch(len: number): void {
    let sound = this.glitches[Math.floor(Math.random() * 3)];
    sound.startTime = Math.max((sound.source.buffer.duration - len / 1000), 0) * Math.random();
    sound.play();
    setTimeout(() => sound.stop(), len);
  }

  public getPositionalAudio(name: string): THREE.PositionalAudio {
    let a = new THREE.PositionalAudio(this.listener);
    a.load(`/media/sound/${name}.mp3`);
    a.setDistanceModel('exponential');
    a.setRefDistance(20);
    a.setRolloffFactor(1.15);
    a.setLoop(true);
    a.autoplay = true;
    this.sounds.push(a);
    return a;
  }

  public update(player: Player, camera: Camera) {
    if (!this.stopped) {
      this.listener.position.copy(player.container.position);
      this.listener.rotation.copy(camera.camera.rotation);
      let dt = Math.min(player.rotationV / .02, 1);
      this.bgWind.setVolume(dt * Math.sin(player.container.rotation.y * 3) * .2 + .4);
      (<any>this.bgWind).setPlaybackRate(1 + dt / 1.25);
    }
  }

  public stopAll(): void {
    this.sounds.forEach(x => x.stop());
    this.bgWind.stop();
    this.bgBreath.stop();
    this.stopped = true;
  }

  private init(): void {
    this.hit = this.getAudio('hit');
    for (let i = 0; i < 3; i++) {
      this.glitches[i] = this.getAudio(`glitch${i}`);
      this.glitches[i].setVolume(.66);
    }
    this.initBg();
  }

  private initBg(): void {
    this.bgWind = this.getAudio('bg');
    this.bgWind.autoplay = true;
    this.bgWind.setLoop(true);
    this.bgWind.setVolume(0.4);
    this.bgBreath = this.getAudio('breath');
    this.bgBreath.autoplay = true;
    this.bgBreath.setLoop(true);
    this.bgFinal = this.getAudio('kluchik');
    this.bgFinal.setLoop(true);
  }

  private getAudio(name: string): THREE.Audio {
    let s = new THREE.Audio(this.listener);
    s.load(`/media/sound/${name}.mp3`);
    return s;
  }
}
