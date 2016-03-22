import {SCALE} from '../display';
import {Animator} from '../core/animator';
import {sphericalTo3d} from '../core/math';
import {Audio} from '../../senses/audio';

const ANIMATION_DURATION = 2000;

interface GalaxyView {
  animation: Promise<any>;
  view: THREE.Mesh;
}

export class Galaxy {
  private proto: THREE.Mesh;

  constructor(
    private animator: Animator,
    private spaceMaterial: THREE.ShaderMaterial,
    private container: THREE.Object3D,
    private audio: Audio
  ) {
    this.proto = new THREE.Mesh(
      new THREE.SphereGeometry(SCALE / 1.25, 16, 16), spaceMaterial);
  }

  public add(pos: THREE.Vector3): GalaxyView {
    this.explodeLines(pos);
    let g = this.proto.clone();
    g.position.set(pos.x, pos.y, pos.z);
    let s = this.audio.getPositionalAudio('galaxies');
    s.setVolume(2.5);
    g.add(s);
    this.container.add(g);
    return {
      animation: this.animator.play({
        func: dt => g.scale.fromArray(toArray3(dt * dt * dt)),
        duration: ANIMATION_DURATION,
      }),
      view: g,
    };
  }

  private explodeLines(pos: THREE.Vector3): Promise<any> {
    let lines = this.getLines();
    lines.position.set(pos.x, pos.y, pos.z);
    this.container.add(lines);
    return this.animator.play({
        func: dt => lines.scale.fromArray(toArray3(dt * 50 + 1)),
        duration: ANIMATION_DURATION,
      }).then(() => this.container.remove(lines));
  }

  private getLines(): THREE.Line {
    let material = new THREE.LineBasicMaterial({color: 0x666666, linewidth: 1, fog: true});
    let geometry = new THREE.Geometry();
    for (let i = 0; i < 20; i++) {
      let a = Math.random() * Math.PI;
      let b = Math.random() * Math.PI;
      let s1 = Math.random() * SCALE / 10;
      let s2 = (Math.random() + .5) * SCALE;
      geometry.vertices.push(
        (new THREE.Vector3()).fromArray(sphericalTo3d(a, b, s1)),
        (new THREE.Vector3()).fromArray(sphericalTo3d(a, b, s2))
      );
    }
    return new THREE.Line(geometry, material, THREE.LinePieces);
  }
}

function toArray3(a) { return [a, a, a]; }
