import {Animator} from '../core/animator';
import {Audio} from '../../senses/audio';
import {Vibro} from '../../senses/vibro';

import '../../vendor/glitch/CopyShader';
import '../../vendor/glitch/DigitalGlitch';
import '../../vendor/glitch/EffectComposer';
import '../../vendor/glitch/RenderPass';
import '../../vendor/glitch/MaskPass';
import '../../vendor/glitch/ShaderPass';
import '../../vendor/glitch/GlitchPass';

export class GlitchEffect {
  private active: boolean;
  private composer: THREE.EffectComposer;
  private vibro: Vibro;

  constructor(
    private animator: Animator,
    resolution: THREE.Vector2,
    renderer: THREE.Renderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    private audio: Audio,
    pixelRatio: number
  ) {
    this.vibro = new Vibro();
    this.composer = new THREE.EffectComposer(renderer);
    this.composer.addPass(new THREE.RenderPass(scene, camera));
    let glitchPass = new THREE.GlitchPass();
    glitchPass.renderToScreen = true;
    glitchPass.goWild = true;
    this.composer.addPass(glitchPass);
    this.composer.setSize(resolution.x * pixelRatio, resolution.y * pixelRatio);
  }

  public play(duration: number): Promise<any> {
    this.active = true;
    this.audio.glitch(duration);
    this.vibro.play(duration);
    return this.animator.play({
      duration,
      func: _ => this.active = false,
      timer: true,
    });
  }

  public render(): boolean {
    if (!this.active) return false;
    this.composer.render();
    return true;
  }
}
