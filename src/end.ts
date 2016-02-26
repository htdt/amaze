import 'whatwg-fetch';

export class HeadObject{
  geometry: THREE.Geometry;
  origGeometry: THREE.Geometry;
  mesh: THREE.Mesh;
  materialWire: THREE.MeshBasicMaterial;
  materialSolid: THREE.MeshLambertMaterial;
  reduceMap: number[];

  colorize(): void{
    let len = this.geometry.faces.length;
    for (var i = 0; i < len; i++)
      this.geometry.faces[i].color.setHSL(0, 0, Math.random()/5+.8);

    this.geometry.colorsNeedUpdate = true;
  }

  blink(n:number, dt:number): void{
    let len = this.geometry.faces.length;
    for (var i = 0; i < len; i++)
      if (i>=(n-dt/2)*len && i<=(n+dt/2)*len)
        this.geometry.faces[i].color.setHSL(Math.random(), .5, .5);
      else
        this.geometry.faces[i].color.setHSL(1, 1, 1);

    this.geometry.colorsNeedUpdate = true;
  }

  load(): Promise<any>{
    var loader = new THREE.JSONLoader(true);

    return Promise.all([
      window.fetch('media/lowpolymap.txt').then(d=>d.text()).then(d=>this.reduceMap = d.split(",").map(x=>parseInt(x))),

      new Promise((resolve, reject) => {
        loader.load('media/lowpolyhead.js', (geometry) => {
          this.geometry = geometry;
          this.origGeometry = geometry.clone();
          this.mesh = new THREE.Mesh(this.geometry, this.materialWire);
          resolve();
        });
      })

    ]);
  }

  lowpoly(t:number): void{
    var face, oldFace;
    for (var i = 0; i < this.geometry.faces.length; i++) {
      face = this.geometry.faces[i];
      oldFace = this.origGeometry.faces[i];
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

  constructor(){
    this.materialWire = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0xffffff,
      fog: true
    });

    this.materialSolid = new THREE.MeshLambertMaterial({
      shading: THREE.FlatShading,
      vertexColors: THREE.FaceColors,
      fog: true
    });
  }

  getMorphTargets(n): THREE.Vector3[]{
    return this.origGeometry.vertices.slice(0,n);
  }
}