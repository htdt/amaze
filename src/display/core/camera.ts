import {Animator} from '../core/animator';
import {SCALE} from '../display';

export class Camera {
  public camera: THREE.PerspectiveCamera;
  public target: THREE.Object3D;
  private radius: number = 10;
  private angleZ: number = 0;

  constructor(
    resolution: THREE.Vector2,
    private animator: Animator
  ) {
    this.camera = new THREE.PerspectiveCamera(
      75, resolution.x / resolution.y, 1, 1000);
    this.camera.position.y = SCALE * 2.5;
    this.addResizeListener();
  }

  public move(angle: number, up: boolean, turn: number): void {
    this.updateEasing(up, turn);
    this.updateCamera(angle);
  }

  public final(duration: number, angle: number): Promise<any> {
    let y = SCALE * (this.radius + .5);
    let y2 = SCALE * 1.25;
    return this.animator.play({
      func: dt => {
        dt = -2 * dt * dt * (2 * dt - 3) / 2; // easing
        this.radius = dt + 2;
        this.camera.position.x = this.target.position.x - Math.cos(angle * (1 - dt)) * SCALE * this.radius;
        this.camera.position.z = this.target.position.z - Math.sin(angle * (1 - dt)) * SCALE * this.radius;
        this.camera.position.y = y * (1 - dt);
        this.camera.lookAt(new THREE.Vector3(
          this.target.position.x, y2 * (1 - dt), this.target.position.z));
      },
      duration,
    });
  }

  private addResizeListener() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  private updateEasing(up: boolean, turn: number): void {
    if (up && this.radius < 3) this.radius += .0025;
    if (!up && this.radius > 2) this.radius -= .01;
    if (this.radius > 3.01) this.radius -= .05;
    if (turn > 0 && this.angleZ < .1) this.angleZ += .0012;
    if (turn < 0 && this.angleZ > -.1) this.angleZ -= .0012;
    if (turn == 0 && Math.abs(this.angleZ) > 0) this.angleZ *= .9;
  }

  private updateCamera(angle: number): void {
    this.camera.position.x = this.target.position.x - Math.cos(angle) * SCALE * this.radius;
    this.camera.position.z = this.target.position.z - Math.sin(angle) * SCALE * this.radius;
    this.camera.position.y = SCALE * (this.radius + .5);
    this.camera.lookAt(new THREE.Vector3(
      this.target.position.x, SCALE * 1.25, this.target.position.z));
    this.camera.rotation.z += this.angleZ;
  }
}
