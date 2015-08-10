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
  timer: boolean;
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
  
  play({func=(dt)=>null, duration=1000, object=null, loop=false, timer=false}): Promise<any>{
    var animation = this.animation;
    return new Promise(function(resolve, reject){
      if (object && animation.filter(o=>o.object==object).length)
        return reject("object already in use");
      animation.push({start: Date.now(), func, duration, resolve, object, loop, timer});
      //if (loop) reject("endless animation");
    }).catch(error => null);
  }

  stop(object:any){
    let i = this.animation.map(o=>o.object).indexOf(object);
    if (i>=0) this.animation.splice(i,1);
  }

  step(): void{
    for (let i=0, len = this.animation.length;i<len;i++){
      let dt = Date.now() - this.animation[i].start;

      if (dt<=this.animation[i].duration){
        if (!this.animation[i].timer)
          this.animation[i].func(dt/this.animation[i].duration);
      }
      else if (this.animation[i].loop) {
        if (this.animation[i].timer)
           this.animation[i].func(1);

        this.animation[i].start = Date.now();//+ dt % this.animation[i].duration
      }
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
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  animator: Animator;

  light: THREE.Light;
  //shadowLight: THREE.DirectionalLight;
  playerMaterial: THREE.MeshPhongMaterial;
  player: THREE.Mesh;
  protoGalaxy: THREE.Mesh;
  glitch: boolean;
  glitchComposer: THREE.EffectComposer;
  morphingSphere: THREE.Mesh;


  constructor(){
    let w,h;
    if (typeof PRODUCTION == 'undefined') {w=800; h=300;}
    else{
      w = window.innerWidth;
      h = window.innerHeight;
      window.addEventListener('resize', () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }, false);
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, w/h, 1, 1000);
    this.camera.position.y = Display3D.scale*3/2;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( w, h );
    this.renderer.setClearColor(0xffffff);
    this.scene.fog = new THREE.FogExp2(0xffffff,0.004);
    //this.renderer.shadowMapEnabled = true;
    //this.renderer.shadowMapType = THREE.PCFShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.renderer.domElement.addEventListener("click",
      () => fullscreen(this.renderer.domElement), false);

    this.animator = new Animator();

    this.glitch = false;

    this.initPlayer();
    this.initLight();
    this.initProtoGalaxy();
    this.initGlitch();
    this.initMorphingSphere();
  }

  initLight(): void{
    this.scene.add(new THREE.AmbientLight(0xaaaaaa));

    this.light = new THREE.PointLight(0xffffff, .5);
    this.light.position.y = 50*Display3D.scale;
    this.scene.add(this.light);

    /*
    this.shadowLight = new THREE.DirectionalLight(0,1);
    this.shadowLight.position.set(0,50*Display3D.scale,0);
    this.shadowLight.castShadow = true;
    this.shadowLight.onlyShadow = true;
    this.shadowLight.shadowDarkness = .25;
    this.shadowLight.shadowMapWidth = 1024;
    this.shadowLight.shadowMapHeight = 1024;
    //this.shadowLight.shadowCascade = true;
    this.shadowLight.target = this.player;
    this.scene.add(this.shadowLight);*/
  }

  initPlayer(): void{
    this.playerMaterial = new THREE.MeshPhongMaterial({color: 0, wireframe:true});
    this.player = new THREE.Mesh(new THREE.OctahedronGeometry(Display3D.scale/4, 0), this.playerMaterial);

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
    //this.shadowLight.position.x = w*Display3D.scale/2;
    //this.shadowLight.position.z = h*Display3D.scale/2;

    this.addDiffusedDust(w,h);
  }

  addWall(x:number, y:number): THREE.Mesh {
    let wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    let curWall = new THREE.Mesh(
      new THREE.BoxGeometry(Display3D.scale, Display3D.scale, Display3D.scale),
      wallMaterial
    );
    curWall.position.x = x*Display3D.scale;
    curWall.position.z = y*Display3D.scale;
    this.scene.add(curWall);
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
      func: dt => {this.glitch = false},
      timer: true
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
      let s1 = Math.random()*Display3D.scale/10;
      let s2 = (Math.random()+.5)*Display3D.scale;
      geometry.vertices.push(
        (new THREE.Vector3()).fromArray(sphericalTo3d(a, b, s1)),
        (new THREE.Vector3()).fromArray(sphericalTo3d(a, b, s2))
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
          let ql = dt*50+1;
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
    let dustGeometry = new THREE.Geometry();

    //console.log(w,h);
    for (let i=0;i<w*h;i++)
      dustGeometry.vertices.push(new THREE.Vector3(
        Math.random() * (w+6) * Display3D.scale - Display3D.scale*3,
        Math.random() * 6 * Display3D.scale - Display3D.scale*3,
        Math.random() * (h+6) * Display3D.scale - Display3D.scale*3
      ));

    let material = new THREE.PointCloudMaterial({size: 1, color:0x666666});

    var moreDust = () => {
      let p=[];
      for (let i1=0;i1<5;i1++)
        p[i1] = (Math.random()-.5)*Display3D.scale*6;

      let body = new THREE.PointCloud(dustGeometry,material);
      let v1 = new THREE.Vector3(p[0],Display3D.scale*6,p[1]);
      let v2 = new THREE.Vector3(p[2],p[3],p[4]);
      body.position.copy(v1);
      this.scene.add(body);

      let changeSpeed = 5000 + 30000 * Math.random();

      this.animator.play({
        func: dt => {
          let v = new THREE.Vector3();
          let dtEasing = -2*dt*dt*(2*dt-3)/2;
          v.subVectors(v2,v1).multiplyScalar(dtEasing).add(v1);
          body.position.copy(v);
        },
        duration: changeSpeed,
        loop: true
      });

      this.animator.play({
        func: _=> {
         v1.copy(v2);
         v2.set(
            (Math.random()-.5)*Display3D.scale*6,
            (Math.random()-.5)*Display3D.scale*6,
            (Math.random()-.5)*Display3D.scale*6
          );
        },
        duration: changeSpeed,
        loop: true,
        timer: true
      });
    }

    moreDust();
    
    this.animator.play({
      func: _=> moreDust(),
      duration: 5000,
      loop: true,
      timer: true
    });
  }

  generateSphere(vertices, ilen, klen, rr){
    for (let i = 0; i < ilen; i++)
    for (let k = 0; k < klen; k++)
    {
      let i1 = i==ilen-1 ? 0 : i+1;
      let k1 = k==klen-1 ? 0 : k+1;

      let q1 = i / ilen * Math.PI * 2;
      let q2 = k / klen * Math.PI;
      let q3 = i1 / ilen * Math.PI * 2;
      let q4 = k1 / klen * Math.PI;

      let v1 = sphericalTo3d(q1,q2, rr[i+k*ilen]);
      let v2 = sphericalTo3d(q3,q2, rr[i1+k*ilen]);
      let v3 = sphericalTo3d(q1,q4, rr[i+k1*ilen]);
      let v4 = sphericalTo3d(q3,q4, rr[i1+k1*ilen]);

      let offset = (k*ilen+i)*6*3;
      
      copy3array(vertices, offset, v3);
      copy3array(vertices, offset+3, v2);
      copy3array(vertices, offset+6, v1);
      copy3array(vertices, offset+9, v2);
      copy3array(vertices, offset+12, v3);
      copy3array(vertices, offset+15, v4);
    }
  }
  

  initMorphingSphere(){
    var ilen = 10, klen = 10, r = Display3D.scale/4;
    var calm = true, morphing = false;
    var rr = [];
    var vertices = new Float32Array(ilen * klen * 6*3);
    for (let i=0;i<ilen*klen;i++) rr[i] = r;
    this.generateSphere(vertices, ilen, klen, rr);

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();

    var material = new THREE.MeshPhongMaterial( {color: 0, shininess: 250});
    this.morphingSphere = new THREE.Mesh(geometry, material);

    var morph = () => {
      morphing = true;
      this.animator.play({
      func: (dt) => {
        if (Math.random()>.7){
          for (let i = 0; i < ilen; i++)
          for (let k = 0; k < klen; k++){
            let q = calm ? dt*dt : 1 - dt*dt;
            if (i%2 == 0 && k%2 == 0) rr[i+k*ilen] = r + Math.random()*r*q*2;
            else rr[i+k*ilen] = r * (1-q/2);
          }
          this.generateSphere(vertices, ilen, klen, rr);
          geometry.attributes['position'].needsUpdate = true;
          geometry.computeVertexNormals();
        }
      },
      duration: 2500,
      object: this.morphingSphere
    }).then(()=>{morphing=false;calm=!calm;});}


    this.animator.play({
      func: (dt) => {
        if (Math.random()>.8 && !morphing) morph();
      },
      duration: 500,
      loop: true,
      timer: true
    });
  }

  addMorphingSphere(x: number, y:number): THREE.Mesh{
    let s = this.morphingSphere.clone();
    s.position.x = x*Display3D.scale;
    s.position.z = y*Display3D.scale;
    this.scene.add(s);

    this.animator.play({
      func: (dt) => {
        s.rotation.x = dt*Math.PI;
        s.rotation.z = dt*Math.PI*2;
      },
      duration: 20000,
      loop: true
    });

    return s;
  }

  render(): void{
    this.animator.step();
    if (this.glitch) this.glitchComposer.render();
    else this.renderer.render(this.scene, this.camera);
  }
}

function sphericalTo3d(a,b,r): number[]{
  return [
    r * Math.cos(a) * Math.sin(b),
    r * Math.sin(a) * Math.sin(b),
    r * Math.cos(b)
  ];
}

function copy3array(a,offset,b){
  a[offset] = b[0];
  a[offset+1] = b[1];
  a[offset+2] = b[2];
}

function fullscreen(el){
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  }
}