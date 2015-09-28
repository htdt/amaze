declare module THREE{
  export class RenderPass{
    constructor(scene: Scene, camera: Camera);
  }
  
  export class EffectComposer{
    constructor(renderer: Renderer);
    render(): void;
    addPass(pass: RenderPass);
    setSize(x:Number, y:Number);
  }

  export class GlitchPass{
    renderToScreen: boolean;
    goWild: boolean;
  }
}
