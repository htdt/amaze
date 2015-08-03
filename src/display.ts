import * as THREE from "three";

import './glitch/CopyShader';
import './glitch/DigitalGlitch';

import './glitch/EffectComposer';
import './glitch/RenderPass';
import './glitch/MaskPass';
import './glitch/ShaderPass';
import './glitch/GlitchPass';

declare var PRODUCTION;

interface AnimationObject{
  start: number;
  func: Function;
  duration: number;
  resolve: Function;
  object: any;
  loop: boolean;
}

interface galaxyView{
  animation: Promise<any>;
  view: THREE.Mesh;
}


class Animator{
  animation: AnimationObject[];

  constructor(){
    this.animation = [];
  }
  
  play({func=(dt)=>null, duration=1000, object=null, loop=false}): Promise<any>{
    var animation = this.animation;
    return new Promise(function(resolve, reject){
      if (object && animation.filter(o=>o.object==object).length)
        return reject("object already in use");
      animation.push({start: Date.now(), func, duration, resolve, object, loop});
      //if (loop) reject("endless animation");
    }).catch(error => console.log("catch: ", error));
  }

  stop(object:any){
    let i = this.animation.map(o=>o.object).indexOf(object);
    if (i>=0) this.animation.splice(i,1);
  }

  step(): void{
    for (let i=0, len = this.animation.length;i<len;i++){
      let dt = Date.now() - this.animation[i].start;
      if (dt<=this.animation[i].duration)
        this.animation[i].func(dt/this.animation[i].duration);
      else if (this.animation[i].loop) this.animation[i].start = Date.now();//+ dt % this.animation[i].duration
      else {
        this.animation[i].func(1);
        this.animation[i].resolve();
        this.animation.splice(i,1);
        i--;len--;
      }
    }
  }
}  

export default class Display3D{
  static scale = 50;

  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  animator: Animator;

  light: THREE.Light;
  shadowLight: THREE.DirectionalLight;
  playerMaterial: THREE.MeshPhongMaterial;
  player: THREE.Mesh;
  protoGalaxy: THREE.Mesh;
  glitch: boolean;
  glitchComposer: THREE.EffectComposer;


  constructor(){
    let w,h;

    if (typeof PRODUCTION == 'undefined') {w=800; h=300;}
    else{
      w = window.innerWidth;
      h = window.innerHeight;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, w/h, 1, 1000);
    this.camera.position.y = Display3D.scale;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( w, h );
    this.renderer.setClearColor(0xffffff);
    this.scene.fog = new THREE.FogExp2(0xffffff,0.006);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.animator = new Animator();

    this.glitch = false;

    this.initPlayer();
    this.initLight();
    this.initProtoGalaxy();
    this.initGlitch();
  }

  initLight(): void{
    this.scene.add(new THREE.AmbientLight(0xaaaaaa));

    this.light = new THREE.PointLight(0xffffff, .5);
    this.light.position.y = 50*Display3D.scale;
    this.scene.add(this.light);

    this.shadowLight = new THREE.DirectionalLight(0,1);
    this.shadowLight.position.set(0,50*Display3D.scale,0);
    this.shadowLight.castShadow = true;
    this.shadowLight.onlyShadow = true;
    this.shadowLight.shadowDarkness = .25;
    this.shadowLight.shadowMapWidth = 1024;
    this.shadowLight.shadowMapHeight = 1024;
    //this.shadowLight.shadowCascade = true;
    this.shadowLight.target = this.player;
    this.scene.add(this.shadowLight);
  }

  initPlayer(): void{
    this.playerMaterial = new THREE.MeshPhongMaterial({color: 0, wireframe:true});
    this.player = new THREE.Mesh(new THREE.OctahedronGeometry(Display3D.scale/3, 0), this.playerMaterial);

    //this.player.castShadow = true;
    this.player.position.y = 0;
    this.scene.add(this.player);

    this.animator.play({
      func: dt => this.player.position.y = Math.sin(dt*Math.PI*2)*Display3D.scale/16,
      duration: 2500,
      loop: true});
  }

  addEnvironment(w,h): void{
    var plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(w*Display3D.scale, h*Display3D.scale),
      new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.DoubleSide/*, wireframe:true*/})
    );
    plane.rotation.x = Math.PI/2;
    plane.position.x = w*Display3D.scale/2;
    plane.position.z = h*Display3D.scale/2;
    plane.position.y = -Display3D.scale/2;
    plane.receiveShadow = true;
    this.scene.add(plane);

    this.light.position.x = w*Display3D.scale/2;
    this.light.position.z = h*Display3D.scale/2;
    this.shadowLight.position.x = w*Display3D.scale/2;
    this.shadowLight.position.z = h*Display3D.scale/2;

    this.addDiffusedDust(w,h);
  }

  addWall(x:number, y:number, glitchy:boolean=false): THREE.Mesh {
    let wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent:true });
    let curWall = new THREE.Mesh(
      new THREE.BoxGeometry(Display3D.scale, Display3D.scale, Display3D.scale),
      wallMaterial
    );
    curWall.receiveShadow = true;
    curWall.position.x = x*Display3D.scale;
    curWall.position.z = y*Display3D.scale;
    //if (glitchy) curWall.castShadow = true;
    this.scene.add(curWall);

    if (glitchy) this.animator.play({func: dt => {
        if (dt==1){
          if (Math.random()>.8)
            curWall.rotation.set(Math.random()*2*Math.PI, Math.random()*2*Math.PI, Math.random()*2*Math.PI);
          
          if (Math.random()>.8)
            curWall.position.y = (Math.random()-.5)*Display3D.scale/2;

          /*if (Math.random()>.8){
            let s = Math.random()/2+.5;
            curWall.scale.set(s,s,s);}*/

        }
      }, duration: 100, loop: true, object: curWall});

    return curWall;
  }

  moveObject(displayObj: THREE.Mesh, physObj: p2.Body): void{
    displayObj.position.x = physObj.position[0]*Display3D.scale;
    displayObj.position.z = physObj.position[1]*Display3D.scale;
    displayObj.rotation.y = -physObj.angle;
  }

  moveCamera(q: number): void{
    this.camera.position.x = this.player.position.x - Math.cos(q)*Display3D.scale*2;
    this.camera.position.z = this.player.position.z - Math.sin(q)*Display3D.scale*2;
    this.camera.lookAt(new THREE.Vector3(
      this.player.position.x, 0, this.player.position.z));
  }


  initProtoGalaxy(): void{
    var textureEquirec = THREE.ImageUtils.loadTexture("media/space.jpg");
    textureEquirec.minFilter = THREE.NearestFilter;// or THREE.LinearFilter
    textureEquirec.format = THREE.RGBAFormat;
    textureEquirec.mapping = THREE.EquirectangularRefractionMapping;
    this.protoGalaxy = new THREE.Mesh(
      new THREE.SphereGeometry(Display3D.scale, 16, 16),
      new THREE.MeshBasicMaterial({envMap:textureEquirec})
    );
  }

  initGlitch(): void{
    this.glitchComposer = new THREE.EffectComposer( this.renderer );
    this.glitchComposer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

    var glitchPass = new THREE.GlitchPass();
    glitchPass.renderToScreen = true;
    glitchPass.goWild = true;
    this.glitchComposer.addPass(glitchPass);
  }

  glitchMe(dt:number): Promise<any>{
    this.glitch = true;
    return this.animator.play({
      duration: dt,
      func: dt => {if (dt==1) this.glitch = false;}
    });
  }

  createGalaxy(pos: THREE.Vector3): galaxyView{
    var material = new THREE.LineBasicMaterial({
      color: 0x666666,
      linewidth: 1,
      fog: true
    });

    var geometry = new THREE.Geometry();

    for (let i=0;i<20;i++){
      let a = Math.random()*Math.PI;
      let b = Math.random()*Math.PI;
      let s1 = Math.random()*Display3D.scale/5;
      let s2 = (Math.random()+.5)*Display3D.scale;

      geometry.vertices.push(
        sphericalTo3d(a, b, s1),
        sphericalTo3d(a, b, s2)
      );
    }

    var lines = new THREE.Line( geometry, material, THREE.LinePieces );
    lines.position.set(pos.x, pos.y, pos.z);
    this.scene.add( lines );

    let g = this.protoGalaxy.clone();
    g.position.set(pos.x, pos.y, pos.z);
    this.scene.add(g);

    return {
      animation: this.animator.play({
        func: dt => {
          let ql = 1/dt;//dt*50+1;
          lines.scale.set(ql, ql, ql);
          
          let qg = dt*dt*dt;
          g.scale.set(qg, qg, qg);

          if (dt>.5) this.glitch = true;
        },
        duration: 2000})
      .then(() => {
        this.scene.remove(lines);
        this.glitch = false;
      }),
      view: g
    }
  }


  addDiffusedDust(w,h): void{
    let particlesGeometry = new THREE.Geometry();

    for (let i=0;i<3000;i++){
      let x = Math.random() * (w+6) * Display3D.scale - Display3D.scale*3;
      let z = Math.random() * (h+6) * Display3D.scale - Display3D.scale*3;
      let y = Math.random() * 3 * Display3D.scale;
      particlesGeometry.vertices.push(new THREE.Vector3(x,y,z));
    }

    let material = new THREE.PointCloudMaterial({size: 1, color:0x666666});

    let particles1 = new THREE.PointCloud(particlesGeometry,material);
    let particles2 = new THREE.PointCloud(particlesGeometry,material);
    let particles3 = new THREE.PointCloud(particlesGeometry,material);
    
    this.scene.add(particles1);
    this.scene.add(particles2);
    this.scene.add(particles3);

    this.animator.play({
      func: dt => {
        let q = dt*Math.PI*2;
        particles1.position.set(Math.cos(q)*Display3D.scale*3, 0, Math.sin(q)*Display3D.scale*3);
        particles2.position.set(Math.cos(q)*Display3D.scale*3, Math.sin(q)*Display3D.scale*3, 0);
        particles3.position.set(0, Math.cos(q)*Display3D.scale*3, Math.sin(q)*Display3D.scale*3);
        //material.color.setHSL(0, 0, Math.random());
      },
      duration: 50000,
      loop: true});
  }

  render(): void{
    this.animator.step();
    if (this.glitch) this.glitchComposer.render();
    else this.renderer.render(this.scene, this.camera);
  }
}

function sphericalTo3d(a,b,r): THREE.Vector3{
  return new THREE.Vector3(
    r * Math.cos(a) * Math.sin(b),
    r * Math.sin(a) * Math.sin(b),
    r * Math.cos(b)
  );
}

/*
  wallCollapse(w: THREE.Mesh): Promise<any>{
    w.position.y = Display3D.scale;
    //w.rotation.set(0,0,0);
    return this.delayedRecursion(w,1,12);
  }

  delayedRecursion(obj, depth:number, maxdepth:number): Promise<any>{
    if (depth >= maxdepth) return;
    return this.animator.play({duration: 500}).then(() => {
      var [a1,a2] = this.sliceObject(obj, depth);
      depth++;
      this.delayedRecursion(a1, depth, maxdepth);
      return this.delayedRecursion(a2, depth, maxdepth);
    });
  }

  sliceObject(w: THREE.Mesh, depth:number): THREE.Mesh[]{
    //depth+=1;
    let s = 1/(depth*depth);
    w.scale.set(s,s,s);
    let n = w.clone(), x, dt = Display3D.scale/depth*1.5;
    switch (depth%3){
      case 0:
        x = new THREE.Vector3(dt,0,0);
        break;
      case 1:
        x = new THREE.Vector3(0,0,dt);
        break;
      case 2:
        x = new THREE.Vector3(0,dt,0);
        break;
    }

    w.position.add(x);
    n.position.sub(x);
    this.scene.add(n);
    return [w,n];
  }
*/
/*
createDust(pos: THREE.Vector3): Promise<any>{
    let geometry = new THREE.Geometry();
    let x=[];
    for (let i=0;i<2000;i++){
      for (let i1=0; i1<3; i1++) x[i1] = (Math.random()-.5) * Display3D.scale;
      geometry.vertices.push(new THREE.Vector3(x[0], x[1], x[2]));
    }
    let material = new THREE.PointCloudMaterial({size: 1, color:0});

    let particles = [];
    let velocities = [];

    for (let i=0;i<10;i++){
      particles[i] = new THREE.PointCloud(geometry,material);
      particles[i].position.set(pos.x, pos.y, pos.z);
      this.scene.add(particles[i]);

      velocities[i] = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
    }

    return this.animator.play({
      func: dt => {
        var s = dt*10 + 1;
        for (let i=0;i<particles.length;i++) {
          velocities[i].setLength(dt*Display3D.scale);
          particles[i].position.addVectors(pos, velocities[i]);
          particles[i].scale.set(s, s, s);
        }
      },
      duration: 1000})
    .then(()=>particles.forEach((p)=>this.scene.remove(p)));
  }
  */