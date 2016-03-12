import {Animator} from './animator';
import {SCALE} from './display';

export class Dust {
  public material: THREE.PointCloudMaterial;
  private geometry: THREE.Geometry;

  constructor(
    private animator: Animator,
    private container: THREE.Object3D
  ) {}

  public init(w: number, h: number): void {
    this.geometry = new THREE.Geometry();
    for (let i = 0; i < w * h * 3; i++)
      this.geometry.vertices.push(new THREE.Vector3(
        Math.random() * (w + 6) * SCALE - SCALE * 3,
        Math.random() * 6 * SCALE - SCALE * 3,
        Math.random() * (h + 6) * SCALE - SCALE * 3
      ));
    this.material = new THREE.PointCloudMaterial({
      size: 1, color: 0xaaaaaa, fog: true,
    });
    this.start();
  }

  private start(): void {
    let counter = 0;
    this.add();
    this.animator.play({
      func: _ => {
        this.add();
        if (++counter >= 20) this.animator.stop(this.material);
      },
      duration: 10000,
      loop: true,
      timer: true,
      object: this.material,
    });
  }

  private add(): void {
    let body = new THREE.PointCloud(this.geometry, this.material);
    body.position.set(this.randomInRange(), SCALE * 6, this.randomInRange());
    this.container.add(body);
    this.move(body);
  }

  private move(body: THREE.PointCloud): void {
    let v1 = body.position.clone();
    let v2 = this.Vector3InRange();
    let changeSpeed = 5000 + 30000 * Math.random();
    this.animator.play({
      func: dt => body.position.copy(this.lerp(dt, v1, v2)),
      duration: changeSpeed,
      loop: true,
    });
    this.animator.play({
      func: _ => { v1.copy(v2); v2 = this.Vector3InRange(); },
      duration: changeSpeed,
      loop: true,
      timer: true,
    });
  }

  private lerp(dt: number, v1: THREE.Vector3, v2: THREE.Vector3): THREE.Vector3 {
    let v = new THREE.Vector3();
    let dtEasing = -2 * dt * dt * (2 * dt - 3) / 2;
    return v.subVectors(v2, v1).multiplyScalar(dtEasing).add(v1);
  }

  private randomInRange(): number {
    return (Math.random() - .5) * SCALE * 6;
  }

  private Vector3InRange(): THREE.Vector3 {
    return new THREE.Vector3(this.randomInRange(), this.randomInRange(), this.randomInRange());
  }
}
