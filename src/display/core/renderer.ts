export class Renderer {
  public renderer: THREE.WebGLRenderer;

  constructor(resolution: THREE.Vector2, pixelRatio: number) {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(resolution.x, resolution.y);
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener('resize', () =>
      this.renderer.setSize(window.innerWidth, window.innerHeight));
  }

  public render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  public setClearColor(c: THREE.Color): void {
    this.renderer.setClearColor(c);
  }
}
