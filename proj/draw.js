import THREE from "three.js/build/three";
import OrbitControlsPackage from 'three-orbit-controls';
import FPControlsPackage from 'three-first-person-controls'
import World from "proj/world";

const OrbitControls = OrbitControlsPackage(THREE);
FPControlsPackage(THREE);

export default class Display{
  constructor(w){
    this.cellSize = 10;

    this.world = w;
    this.objList = {}

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    this.controls = new THREE.FirstPersonControls(this.camera);
    this.controls.lookSpeed = 0.5;
    this.controls.movementSpeed = 10;
    this.controls.noFly = true;
    //this.controls.lookVertical = false;

    this.clock = new THREE.Clock();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.precision = "lowp";
    document.body.appendChild( this.renderer.domElement );


    this.scene.add( new THREE.AmbientLight(0x333333) );
    this.scene.fog = new THREE.Fog(0, 30,100);

    let light = new THREE.PointLight( 0xffffff, 0.5 );
    light.position.set( 50, 20, 0 );
    light.castShadow = true;
    this.lightHolder = new THREE.Object3D();
    this.scene.add( this.lightHolder );
    this.lightHolder.add( light );
    this.lightHolder.position.set(w.width*this.cellSize/2, 0, w.height*this.cellSize/2);


    let geometry = new THREE.PlaneGeometry( w.width*this.cellSize, w.height*this.cellSize, 20, 20 );
    let material = new THREE.MeshBasicMaterial( {color: 0x7200FC, side: THREE.DoubleSide, wireframe:true} );
    let plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI/2;
    plane.position.x = w.width*this.cellSize/2;
    plane.position.z = w.height*this.cellSize/2;
    plane.position.y = -this.cellSize/2;

    this.scene.add( plane );

    geometry = new THREE.BoxGeometry( 10, 10, 10 );
    material = new THREE.MeshPhongMaterial( { color: 0x7200FC } );
    this.objList['#'] = new THREE.Mesh( geometry, material );

    geometry = new THREE.IcosahedronGeometry( 5, 1 );
    material = new THREE.MeshPhongMaterial( { color: 0x00ff00, shading : THREE.FlatShading } );
    this.objList['@'] = new THREE.Mesh( geometry, material );


    w.grid.forEach((s) => {
      let o = this.objList[s.char].clone();
      o.position.x = s.position.x * this.cellSize;
      o.position.z = s.position.y * this.cellSize;
      this.scene.add( o );
      if (s.char == "@") {this.camera.position.x = o.position.x;this.camera.position.z = o.position.z;}
    });

 }
  
  render(){
    this.lightHolder.rotation.y += .01;
    this.objList['#'].rotation.y += .01;
    this.objList['#'].rotation.z += .01;
    this.controls.update( this.clock.getDelta() );
    this.camera.position.y = this.cellSize/3;
    this.renderer.render(this.scene, this.camera);
  }
}