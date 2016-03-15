import {SCALE} from '../display';
import {Animator} from '../core/animator';
import {Head} from './head';

export class Player {
  public container: THREE.Object3D;
  public head: Head;
  private geometry: THREE.OctahedronGeometry;
  private wire: THREE.Mesh = null;

  constructor(private animator: Animator, spaceMaterial: THREE.ShaderMaterial) {
    this.container = new THREE.Object3D();
    this.container.add(new THREE.Mesh(
      new THREE.SphereGeometry(SCALE / 8, 16, 16), spaceMaterial));
    this.runAnimation();
    this.head = new Head(spaceMaterial);
    this.head.load().then(() => this.initWire());
  }

  public final(n: number): Promise<any> {
    this.stopRotation();
    this.finalRotation();
    return this.morphToHead(n).then(() => {
        this.container.remove(this.wire);
        this.head.show(this.container);
    });
  }

  private stopRotation(): void {
    this.animator.stop(this.container);
    let z = this.wire.rotation.z;
    this.animator.play({func: dt => this.wire.rotation.z = z * (1 - dt)});
  }

  private finalRotation(): void {
    let rotateme = () => {
      let startq = this.container.rotation.y;
      let duration = Math.pow(Math.random(), 2) * 1500;
      let direction = Math.random() > .2 ? 1 : -1;
      this.animator.play({
        func: dt => this.container.rotation.y = startq + dt / 5 * direction,
        duration: duration,
      }).then(() => rotateme());
    };
    rotateme();
  }

  private morphToHead(n: number): Promise<any> {
    return this.animator.play({
        func: dt => {
          (<any>this.wire).morphTargetInfluences[0] = dt;
          this.wire.position.y = -dt * SCALE * .33;
          this.container.position.y = dt * SCALE * .7;
          let d = dt * 3.3 + 1;
          this.container.scale.set(d, d, d);
        },
        duration: n,
      });
  }

  private initWire(): void {
    this.geometry = new THREE.OctahedronGeometry(2.33, 0);
    this.geometry.morphTargets.push({
      name: 'head',
      vertices: this.head.getMorphTargets(this.geometry.vertices.length),
    });
    this.wire = new THREE.Mesh(this.geometry,
      new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true, morphTargets: true}));
    this.wire.scale.set(SCALE / 7, SCALE / 7, SCALE / 7);
    this.container.add(this.wire);
  }

  private runAnimation() {
    this.animator.play({
      func: dt => {
        this.container.position.y = Math.sin(dt * Math.PI * 2) * SCALE / 16;
        if (this.wire) this.wire.rotation.z = dt * Math.PI;
      },
      duration: 2500,
      loop: true,
      object: this.container,
    });
  }
}
