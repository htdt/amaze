import {Animator} from '../core/animator';

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

  constructor(
    private animator: Animator,
    resolution: THREE.Vector2,
    renderer: THREE.Renderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.composer = new THREE.EffectComposer(renderer);
    this.composer.addPass(new THREE.RenderPass(scene, camera));
    let glitchPass = new THREE.GlitchPass();
    glitchPass.renderToScreen = true;
    glitchPass.goWild = true;
    this.composer.addPass(glitchPass);
    this.composer.setSize(
      resolution.x * window.devicePixelRatio,
      resolution.y * window.devicePixelRatio);
  }

  public play(dt: number): Promise<any> {
    this.active = true;
    return this.animator.play({
      duration: dt,
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
