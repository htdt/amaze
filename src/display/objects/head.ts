import {SCALE} from '../display';
import 'whatwg-fetch';

export enum HeadMaterials {Wire, Solid, Space}

export class Head {
  private mesh: THREE.Mesh;
  private geometry: THREE.Geometry;
  private originalGeometry: THREE.Geometry;
  private materials: (THREE.MeshBasicMaterial | THREE.MeshLambertMaterial | THREE.ShaderMaterial)[] = [];
  private currentMaterial: HeadMaterials = HeadMaterials.Wire;
  private reduceMap: number[];

  constructor(materialSpace: THREE.ShaderMaterial) {
    this.materials[HeadMaterials.Wire] = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xffffff,
      fog: true,
    });
    this.materials[HeadMaterials.Solid] = new THREE.MeshLambertMaterial({
      shading: THREE.FlatShading,
      vertexColors: THREE.FaceColors,
      fog: true,
    });
    this.materials[HeadMaterials.Space] = materialSpace;
  }

  public show(container: THREE.Object3D): void {
    container.add(this.mesh);
  }

  public setMaterial(newMaterial: HeadMaterials): boolean {
    if (this.currentMaterial == newMaterial) return false;
    this.mesh.material = this.materials[newMaterial];
    this.currentMaterial = newMaterial;
    return true;
  }

  public load(): Promise<any> {
    return Promise.all([this.loadMap(), this.loadObject()]).then(() => this.postLoad());
  }

  public getMorphTargets(n: number): THREE.Vector3[] {
    return this.originalGeometry.vertices.slice(0, n);
  }

  public lowpoly(t: number): void {
    let face, oldFace;
    for (let i = 0; i < this.geometry.faces.length; i++) {
      face = this.geometry.faces[i];
      oldFace = this.originalGeometry.faces[i];
      face.a = oldFace.a;
      face.b = oldFace.b;
      face.c = oldFace.c;
      while (face.a > t) face.a = this.reduceMap[face.a];
      while (face.b > t) face.b = this.reduceMap[face.b];
      while (face.c > t) face.c = this.reduceMap[face.c];
    }
    this.geometry.verticesNeedUpdate = true;
    this.geometry.elementsNeedUpdate = true;
  }

  private loadMap(): Promise<any> {
    return window.fetch('media/lowpolymap.txt').then(d => d.text())
      .then(d => this.reduceMap = d.split(',').map(x => parseInt(x, 10)));
  }

  private loadObject(): Promise<any> {
    let loader = new THREE.JSONLoader(true);
    return new Promise((resolve, reject) => {
      loader.load('media/lowpolyhead.js', (geometry) => {
        this.geometry = geometry;
        this.originalGeometry = geometry.clone();
        this.mesh = new THREE.Mesh(this.geometry, this.materials[HeadMaterials.Wire]);
        resolve();
      });
    });
  }

  private postLoad(): void {
    this.mesh.scale.set(SCALE / 7, SCALE / 7, SCALE / 7);
    this.mesh.position.y = -SCALE * .33;
    this.colorize();
    this.lowpoly(6);
  }

  private colorize(): void {
    let len = this.geometry.faces.length;
    for (let i = 0; i < len; i++)
      this.geometry.faces[i].color.setHSL(0, 0, Math.random() * .2 + .8);
    this.geometry.colorsNeedUpdate = true;
  }
}
