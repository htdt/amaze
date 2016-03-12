import {Animator} from '../core/animator';
import {SCALE} from '../display';
import {generateSphere} from './sphere';

const SECTORS_I = 10;
const SECTORS_K = 10;
const SECTORS_IK = SECTORS_I * SECTORS_K;
const BASE_RADIUS = 12.5; // SCALE / 4

export class MorphingSphere {
  private calm: boolean = true;
  private morphing: boolean = false;
  private radiuses: number[] = [];
  private vertices: Float32Array;
  private geometry: THREE.BufferGeometry;
  private mesh: THREE.Mesh;

  constructor(
    private animator: Animator,
    private container: THREE.Object3D
  ) {
    this.init();
  }

  public add(x: number, y: number): THREE.Mesh {
    let s = this.mesh.clone();
    s.position.x = x * SCALE;
    s.position.z = y * SCALE;
    this.container.add(s);
    this.rotate(s);
    return s;
  }

  private init(): void {
    this.vertices = new Float32Array(SECTORS_IK * 6 * 3);
    for (let i = 0; i < SECTORS_IK; i++) this.radiuses[i] = BASE_RADIUS;
    generateSphere(this.vertices, SECTORS_I, SECTORS_K, this.radiuses);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.addAttribute( 'position', new THREE.BufferAttribute(this.vertices, 3));
    this.geometry.computeVertexNormals();
    let material = new THREE.MeshPhongMaterial({
      specular: 0xffffff,
      color: 0,
      shininess: 25,
    });
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.playMorphingLoops();
  }

  private rotate(s: THREE.Mesh): void {
    this.animator.play({
      func: (dt) => {
        s.rotation.x = dt * Math.PI;
        s.rotation.z = dt * Math.PI * 2;
      },
      duration: 20000,
      loop: true,
    });
  }

  private computeRadiuses(dt: number): void {
    for (let i = 0; i < SECTORS_I; i++)
    for (let k = 0; k < SECTORS_K; k++) {
      let q = this.calm ? dt * dt : 1 - dt * dt;
      if (i % 2 == 0 && k % 2 == 0)
        this.radiuses[i + k * SECTORS_I] = BASE_RADIUS + Math.random() * BASE_RADIUS * q * 2;
      else
        this.radiuses[i + k * SECTORS_I] = BASE_RADIUS * (1 - q / 2);
    }
  }

  private morph(): void {
      this.morphing = true;
      this.animator.play({
      func: (dt) => {
        if (Math.random() > .7) {
          this.computeRadiuses(dt);
          generateSphere(this.vertices, SECTORS_I, SECTORS_K, this.radiuses);
          /* tslint:disable:no-string-literal */
          this.geometry.attributes['position'].needsUpdate = true;
          /* tslint:enable:no-string-literal */
          this.geometry.computeVertexNormals();
        }
      },
      duration: 2500,
      object: this.mesh,
    }).then(() => {
      this.morphing = false;
      this.calm = !this.calm;
    });
  }

private playMorphingLoops(): void {
    this.animator.play({
      func: (dt) => {
        if (Math.random() > .8 && !this.morphing) this.morph();
      },
      duration: 500,
      loop: true,
      timer: true,
    });
  }
}
