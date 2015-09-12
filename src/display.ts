//THREE imported globally in webpack.config.js:25

import {Animator} from "./animator";
import {HeadObject} from "./end";
import {spaceVertexShader, spaceFragmentShader} from "./shaders";

import './glitch/CopyShader';
import './glitch/DigitalGlitch';

import './glitch/EffectComposer';
import './glitch/RenderPass';
import './glitch/MaskPass';
import './glitch/ShaderPass';
import './glitch/GlitchPass';


interface galaxyView{
  animation: Promise<any>;
  view: THREE.Mesh;
}

export class Display3D{
  static scale = 50;

  scene: THREE.Scene;
  resolution: THREE.Vector2;
  mazeHolder: THREE.Object3D;
  camera: THREE.PerspectiveCamera;
  cameraRadius: number;
  renderer: THREE.WebGLRenderer;
  animator: Animator;

  playerMeshGeometry: THREE.OctahedronGeometry;
  playerWire: any;//THREE.Mesh;
  player: THREE.Object3D;
  protoGalaxy: THREE.Mesh;
  dustGeometry: THREE.Geometry;
  dustMaterial: THREE.PointCloudMaterial;
  morphingSphere: THREE.Mesh;
  spaceMaterial: THREE.ShaderMaterial;
  finalHead: HeadObject;

  glitch: boolean;
  glitchComposer: THREE.EffectComposer;

  constructor(){
    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene();
    this.cameraRadius = 10;
    this.camera = new THREE.PerspectiveCamera(75, this.resolution.x/this.resolution.y, 1, 1000);
    this.camera.position.y = Display3D.scale*2.5;
    this.renderer = new THREE.WebGLRenderer({precision: "lowp"});
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(this.resolution.x, this.resolution.y);
    this.renderer.setClearColor(0xffffff);
    this.scene.fog = new THREE.FogExp2(0xffffff,0.004);
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener('resize', () => {
      this.resolution.set(window.innerWidth, window.innerHeight);
      this.camera.aspect = this.resolution.x / this.resolution.y;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.resolution.x, this.resolution.y);
    }, false);

    this.mazeHolder = new THREE.Object3D();
    this.scene.add(this.mazeHolder);
     
    this.scene.add(new THREE.AmbientLight(0x999999));
    
    this.animator = new Animator();
    this.glitch = false;
    this.initSpaceMaterial();
    this.initPlayer();
    this.initProtoGalaxy();
    this.initGlitch();
    this.initMorphingSphere();
  }

  initShadowLight(): void{
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFShadowMap;

    var shadowLight = new THREE.DirectionalLight(0,1);
    shadowLight.position.set(this.player.position.x,50*Display3D.scale,this.player.position.z);
    shadowLight.castShadow = true;
    shadowLight.onlyShadow = true;
    shadowLight.shadowDarkness = .25;
    shadowLight.shadowMapWidth = 512;
    shadowLight.shadowMapHeight = 512;
    shadowLight.target = this.player;
    this.scene.add(shadowLight);
  }

  initSpaceMaterial(): void{
    this.spaceMaterial = new THREE.ShaderMaterial({
      vertexShader: spaceVertexShader,
      fragmentShader: spaceFragmentShader,
      uniforms: {
        iResolution: { type: 'v2', value: this.resolution },
        iGlobalTime: { type: 'f', value: 0 },
        fogDensity: { type: "f", value: 0 },
        fogColor: { type: "c", value: new THREE.Vector3() },
      },
      fog: true
    });
  }

  initPlayer(): void{
    var playerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(Display3D.scale/8, 16, 16),
      this.spaceMaterial
    );

    
    this.player = new THREE.Object3D();
    this.player.position.y = 0;
    this.player.add(playerSphere);
    this.scene.add(this.player);

    this.finalHead = new HeadObject();
    this.finalHead.load().then(()=>{
      this.finalHead.lowpoly(6);
      this.finalHead.colorize();

      let meshGeometry = new THREE.OctahedronGeometry(2.33, 0);
      meshGeometry.morphTargets.push({name: "head", vertices: this.finalHead.getMorphTargets(meshGeometry.vertices.length)});

      this.playerWire = new THREE.Mesh(
        meshGeometry,
        new THREE.MeshBasicMaterial({color: 0, wireframe: true, morphTargets: true})
      );

      this.playerWire.scale.set(Display3D.scale/7,Display3D.scale/7,Display3D.scale/7);
      this.player.add(this.playerWire);
      this.finalHead.mesh.scale.set(Display3D.scale/7,Display3D.scale/7,Display3D.scale/7);

      this.animator.play({
        func: dt => {
          this.player.position.y = Math.sin(dt*Math.PI*2)*Display3D.scale/16;
          this.playerWire.rotation.z = dt*Math.PI;
        },
        duration: 2500,
        loop: true,
        object: this.player
      });      
    });
  }

  addEnvironment(w,h): void{
    var plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(w*Display3D.scale, h*Display3D.scale),
      new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.DoubleSide/*, wireframe:true*/})
    );
    plane.rotation.x = Math.PI/2;
    plane.position.x = w*Display3D.scale/2 - Display3D.scale/2;
    plane.position.z = h*Display3D.scale/2 - Display3D.scale/2;
    plane.position.y = -Display3D.scale/2;
    //plane.receiveShadow = true;
    this.mazeHolder.add(plane);
    this.initDust(w,h);
  }

  addWall(x:number, y:number): THREE.Mesh {
    let wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, shading: THREE.FlatShading });
    let curWall = new THREE.Mesh(
      new THREE.BoxGeometry(Display3D.scale, Display3D.scale, Display3D.scale),
      wallMaterial
    );
    curWall.position.x = x*Display3D.scale;
    curWall.position.z = y*Display3D.scale;
    this.mazeHolder.add(curWall);
    return curWall;
  }

  moveObject(displayObj: THREE.Mesh, physObj: p2.Body): void{
    displayObj.position.x = physObj.position[0]*Display3D.scale;
    displayObj.position.z = physObj.position[1]*Display3D.scale;
    displayObj.rotation.y = -physObj.angle;
  }

  moveCamera(q: number, up:boolean): void{
    if (up && this.cameraRadius<3) this.cameraRadius+=.0025;
    if (!up && this.cameraRadius>2) this.cameraRadius-=.01;
    if (this.cameraRadius>3.01) this.cameraRadius-=.05;

    this.camera.position.x = this.player.position.x - Math.cos(q)*Display3D.scale*this.cameraRadius;
    this.camera.position.z = this.player.position.z - Math.sin(q)*Display3D.scale*this.cameraRadius;
    this.camera.position.y = Display3D.scale*(this.cameraRadius+.5);
    this.camera.lookAt(new THREE.Vector3(
      this.player.position.x, Display3D.scale*1.25, this.player.position.z));
  }

  finalCameraMove(t: number, q: number): Promise<any>{  
    var y = Display3D.scale*(this.cameraRadius+.5);
    var y2 = Display3D.scale*1.25;

    return this.animator.play({
      func: dt => {
        this.cameraRadius = dt + 2;
        this.camera.position.x = this.player.position.x - Math.cos(q*(1-dt))*Display3D.scale*this.cameraRadius;
        this.camera.position.z = this.player.position.z - Math.sin(q*(1-dt))*Display3D.scale*this.cameraRadius;
        this.camera.position.y = y * (1-dt);
        this.camera.lookAt(new THREE.Vector3(
          this.player.position.x, y2 * (1-dt), this.player.position.z));
      },
      duration: t
    });
  }


  initProtoGalaxy(): void{
    this.protoGalaxy = new THREE.Mesh(
      new THREE.SphereGeometry(Display3D.scale/1.25, 16, 16),
      this.spaceMaterial
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
    this.mazeHolder.add(g);

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

  initDust(w,h): void{
    this.dustGeometry = new THREE.Geometry();

    for (let i=0;i<w*h;i++)
      this.dustGeometry.vertices.push(new THREE.Vector3(
        Math.random() * (w+6) * Display3D.scale - Display3D.scale*3,
        Math.random() * 6 * Display3D.scale - Display3D.scale*3,
        Math.random() * (h+6) * Display3D.scale - Display3D.scale*3
      ));

    this.dustMaterial = new THREE.PointCloudMaterial({
      size: 1,color:0xaaaaaa,fog: true});

    this.moreDust();
  }

  moreDust(): void{
    let p=[];
    for (let i1=0;i1<5;i1++)
      p[i1] = (Math.random()-.5)*Display3D.scale*6;

    let body = new THREE.PointCloud(this.dustGeometry,this.dustMaterial);
    let v1 = new THREE.Vector3(p[0],Display3D.scale*6,p[1]);
    let v2 = new THREE.Vector3(p[2],p[3],p[4]);
    body.position.copy(v1);
    this.mazeHolder.add(body);

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

    var material = new THREE.MeshPhongMaterial( {
      specular: 0xffffff,
      color: 0,
      shininess: 25});
    this.morphingSphere = new THREE.Mesh(geometry, material);

    //this.morphingSphere.castShadow = true;

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
    this.mazeHolder.add(s);

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

  playFinal(blockGameplay, cameraq): void{

    this.animator.play({duration:3000})
      .then(()=>this.glitchMe(200))
      .then(()=>this.animator.play({duration:1500}))
      .then(()=>this.glitchMe(200))
      .then(()=>this.animator.play({duration:1500}))
      .then(()=>this.glitchMe(700))
      .then(()=>this.animator.play({duration:1500}))
      .then(blockGameplay)
      .then(()=>this.glitchMe(700))
      .then(()=>this.scene.remove(this.mazeHolder))
      .then(()=>this.animator.play({duration:1000}))
      .then(()=>{  
        this.animator.stop(this.player);
        
        let currotz = this.playerWire.rotation.z;
        this.animator.play({
          func: dt => this.playerWire.rotation.z = currotz*(1-dt)
        });

        var rotateme = () => {
          let startq = this.player.rotation.y;
          let duration = Math.random();
          duration=Math.pow(duration,2)*1500;

          this.animator.play({
            func: dt => this.player.rotation.y = startq + dt/5,
            duration: duration
          }).then(()=>rotateme());
        }
        rotateme();
        
        this.finalCameraMove(5000, cameraq);
        return this.animator.play({
            func: dt=>{
              this.playerWire.morphTargetInfluences[0] = dt;
              this.playerWire.position.y = -dt*Display3D.scale*.33;
              this.player.position.y = dt*Display3D.scale*.7;
              var d = dt*3.3+1;
              this.player.scale.set(d,d,d);
            },
            duration:5000
          });
      })
      .then(()=>{
        this.finalHead.mesh.position.y = -Display3D.scale*.33;
        this.player.remove(this.playerWire);
        this.player.add(this.finalHead.mesh);

        return this.animator.play({
          func: d => this.finalHead.lowpoly(d*d * 994 + 6),
          duration: 20000});
      }).then(_=>{
        
        var light = new THREE.PointLight(0xffffff,.25);
        light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.scene.add(light);

        this.finalHead.mesh.material = this.finalHead.materialSolid;
        this.glitchMe(70);

        this.animator.play({
          func: _=> {
            if (Math.random()>.93){
              this.finalHead.lowpoly(Math.pow(Math.random(),2) * 994 + 6)
              this.glitchMe(200);
            }
          },
          duration: 1000, timer: true, loop: true});
        
        this.animator.play({
          func: _=> {
            var rnd = Math.random();
            var curmat = this.finalHead.mesh.material;

            if (rnd<.075) this.finalHead.mesh.material = this.finalHead.materialSolid;
            else if (rnd>.075 && rnd<.15) this.finalHead.mesh.material = this.finalHead.materialWire;
            else if (rnd>.15 && rnd<.225) this.finalHead.mesh.material = this.spaceMaterial;

            if (curmat != this.finalHead.mesh.material) this.glitchMe(70);
          },
          duration: 1000, timer: true, loop: true});
     });
  }

  render(dt:number): void{
    this.spaceMaterial.uniforms.iGlobalTime.value += dt/1000;
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