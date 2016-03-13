import {SCALE} from '../display';
import {Animator} from '../core/animator';
import {Head} from './head';

export class Player {
  public container: THREE.Object3D;
  private geometry: THREE.OctahedronGeometry;
  private wire: THREE.Mesh = null;

  constructor(private animator: Animator, spaceMaterial: THREE.ShaderMaterial) {
    this.container = new THREE.Object3D();
    this.container.add(new THREE.Mesh(
      new THREE.SphereGeometry(SCALE / 8, 16, 16), spaceMaterial));
    this.runAnimation();
  }

  public initWire(h: Head): void {
    this.geometry = new THREE.OctahedronGeometry(2.33, 0);
    this.geometry.morphTargets.push({
      name: 'head',
      vertices: h.getMorphTargets(this.geometry.vertices.length),
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
