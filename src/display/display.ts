// THREE imported globally in webpack.config.js:25

import {Animator} from './animator';
import {HeadObject} from './end';
import {spaceVertexShader, spaceFragmentShader} from './shaders';
import {GameMessage} from '../engine/msg';
import {Dust} from './dust';
import {sphericalTo3d} from './math';
import {MorphingSphere} from './morphing-sphere';

import '../vendor/glitch/CopyShader';
import '../vendor/glitch/DigitalGlitch';
import '../vendor/glitch/EffectComposer';
import '../vendor/glitch/RenderPass';
import '../vendor/glitch/MaskPass';
import '../vendor/glitch/ShaderPass';
import '../vendor/glitch/GlitchPass';

export const SCALE = 50;

interface GalaxyView {
  animation: Promise<any>;
  view: THREE.Mesh;
}

export class Display3D{

  scene: THREE.Scene;
  resolution: THREE.Vector2;
  container: THREE.Object3D;
  camera: THREE.PerspectiveCamera;
  cameraRadius: number = 10;
  cameraQ: number = 0;
  renderer: THREE.WebGLRenderer;
  animator: Animator;

  playerMeshGeometry: THREE.OctahedronGeometry;
  playerWire: any;//THREE.Mesh;
  player: THREE.Object3D;
  protoGalaxy: THREE.Mesh;
  morphingSphere: MorphingSphere;
  spaceMaterial: THREE.ShaderMaterial;
  finalHead: HeadObject;
  wallMaterial: THREE.MeshLambertMaterial;
  dust: Dust;

  glitch: boolean;
  glitchComposer: THREE.EffectComposer;

  constructor() {
    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.resolution.x/this.resolution.y, 1, 1000);
    this.camera.position.y = SCALE*2.5;
    this.renderer = new THREE.WebGLRenderer();
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

    this.container = new THREE.Object3D();
    this.scene.add(this.container);
    this.scene.add(new THREE.AmbientLight(0x999999));

    this.animator = new Animator();
    this.glitch = false;
    this.initSpaceMaterial();
    this.initPlayer();
    this.initProtoGalaxy();
    this.initGlitch();
    this.initWallMaterial();
    this.morphingSphere = new MorphingSphere(this.animator, this.container);
    this.dust = new Dust(this.animator, this.container);
  }


  initWallMaterial(): void{
    this.wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, shading: THREE.FlatShading });
    this.animator.play({
      func: x => {
        this.wallMaterial.color.setHSL(x,.5,.85);
        this.dust.material.color.setHSL(x,.5,.85);
        this.scene.fog.color.setHSL(x,.5,.85);
        this.renderer.setClearColor(this.scene.fog.color);
      },
      duration: 200000,
      loop: true
    });
  }

  initShadowLight(): void{
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFShadowMap;

    var shadowLight = new THREE.DirectionalLight(0,1);
    shadowLight.position.set(this.player.position.x,50*SCALE,this.player.position.z);
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
      new THREE.SphereGeometry(SCALE/8, 16, 16),
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
        new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true, morphTargets: true})
      );

      this.playerWire.scale.set(SCALE/7,SCALE/7,SCALE/7);
      this.player.add(this.playerWire);
      this.finalHead.mesh.scale.set(SCALE/7,SCALE/7,SCALE/7);

      this.animator.play({
        func: dt => {
          this.player.position.y = Math.sin(dt*Math.PI*2)*SCALE/16;
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
      new THREE.PlaneBufferGeometry(w*SCALE, h*SCALE),
      this.wallMaterial
      // new THREE.MeshLambertMaterial({color: 0xffffff, side: THREE.DoubleSide/*, wireframe:true*/})
    );
    plane.rotation.x = Math.PI/2;
    plane.position.x = w*SCALE/2 - SCALE/2;
    plane.position.z = h*SCALE/2 - SCALE/2;
    plane.position.y = -SCALE/2;
    //plane.receiveShadow = true;
    this.container.add(plane);
    this.dust.init(w, h);
  }

  addWall(x:number, y:number): THREE.Mesh {
    let curWall = new THREE.Mesh(
      new THREE.BoxGeometry(SCALE, SCALE, SCALE),
      this.wallMaterial
    );
    curWall.position.x = x*SCALE;
    curWall.position.z = y*SCALE;
    this.container.add(curWall);
    return curWall;
  }

  moveObject(displayObj: THREE.Mesh, physObj: p2.Body): void{
    displayObj.position.x = physObj.position[0]*SCALE;
    displayObj.position.z = physObj.position[1]*SCALE;
    displayObj.rotation.y = -physObj.angle;
  }

  moveCamera(q: number, up:boolean, turn:number): void{
    if (up && this.cameraRadius<3) this.cameraRadius+=.0025;
    if (!up && this.cameraRadius>2) this.cameraRadius-=.01;
    if (this.cameraRadius>3.01) this.cameraRadius-=.05;

    if (turn > 0 && this.cameraQ < .1) this.cameraQ+=.0012;
    if (turn < 0 && this.cameraQ > -.1) this.cameraQ-=.0012;
    if (turn == 0 && Math.abs(this.cameraQ) > 0) this.cameraQ*=.9;  

    this.camera.position.x = this.player.position.x - Math.cos(q)*SCALE*this.cameraRadius;
    this.camera.position.z = this.player.position.z - Math.sin(q)*SCALE*this.cameraRadius;
    this.camera.position.y = SCALE*(this.cameraRadius+.5);
    this.camera.lookAt(new THREE.Vector3(
      this.player.position.x, SCALE*1.25, this.player.position.z));
    
    this.camera.rotation.z += this.cameraQ;
  }

  finalCameraMove(t: number, q: number): Promise<any>{  
    var y = SCALE*(this.cameraRadius+.5);
    var y2 = SCALE*1.25;

    return this.animator.play({
      func: dt => {
        dt = -2*dt*dt*(2*dt-3)/2; //easing
        this.cameraRadius = dt + 2;
        this.camera.position.x = this.player.position.x - Math.cos(q*(1-dt))*SCALE*this.cameraRadius;
        this.camera.position.z = this.player.position.z - Math.sin(q*(1-dt))*SCALE*this.cameraRadius;
        this.camera.position.y = y * (1-dt);
        this.camera.lookAt(new THREE.Vector3(
          this.player.position.x, y2 * (1-dt), this.player.position.z));
      },
      duration: t
    });
  }


  initProtoGalaxy(): void{
    this.protoGalaxy = new THREE.Mesh(
      new THREE.SphereGeometry(SCALE/1.25, 16, 16),
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
    this.glitchComposer.setSize(
      this.resolution.x * window.devicePixelRatio,
      this.resolution.y * window.devicePixelRatio);
  }

  glitchMe(dt:number): Promise<any>{
    this.glitch = true;
    return this.animator.play({
      duration: dt,
      func: dt => {this.glitch = false},
      timer: true
    });
  }

  createGalaxy(pos: THREE.Vector3): GalaxyView{
    var material = new THREE.LineBasicMaterial({
      color: 0x666666,
      linewidth: 1,
      fog: true
    });

    var geometry = new THREE.Geometry();

    for (let i=0;i<20;i++){
      let a = Math.random()*Math.PI;
      let b = Math.random()*Math.PI;
      let s1 = Math.random()*SCALE/10;
      let s2 = (Math.random()+.5)*SCALE;
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
    this.container.add(g);

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



  playFinal(blockGameplay: () => any, cameraq: number, msg: GameMessage): void{
    
    this.animator.play({duration:3000})
      .then(()=>this.glitchMe(200))
      .then(()=>this.animator.play({duration:1500}))
      .then(()=>this.glitchMe(200))
      .then(()=>this.animator.play({duration:1500}))
      .then(()=>this.glitchMe(700))
      .then(()=>this.animator.play({duration:1500}))
      .then(blockGameplay)
      .then(()=>this.glitchMe(700))
      .then(()=>{
        this.scene.remove(this.container);
        msg.hide();
      })
      .then(()=>this.animator.play({duration:1000}))
      .then(()=>{  
        this.animator.stop(this.player);
        
        let currotz = this.playerWire.rotation.z;
        this.animator.play({
          func: dt => this.playerWire.rotation.z = currotz*(1-dt)
        });

        var rotateme = () => {
          let startq = this.player.rotation.y;
          let duration = Math.pow(Math.random(),2)*1500;
          let direction = Math.random()>.2 ? 1 : -1;

          this.animator.play({
            func: dt => this.player.rotation.y = startq + dt/5*direction,
            duration: duration
          }).then(()=>rotateme());
        }
        rotateme();
        
        this.finalCameraMove(5000, cameraq);
        return this.animator.play({
            func: dt=>{
              this.playerWire.morphTargetInfluences[0] = dt;
              this.playerWire.position.y = -dt*SCALE*.33;
              this.player.position.y = dt*SCALE*.7;
              var d = dt*3.3+1;
              this.player.scale.set(d,d,d);
            },
            duration:5000
          });
      })
      .then(()=>{
        this.finalHead.mesh.position.y = -SCALE*.33;
        this.player.remove(this.playerWire);
        this.player.add(this.finalHead.mesh);

        return this.animator.play({
          func: d => this.finalHead.lowpoly(d*d * 994 + 6),
          duration: 20000});
      }).then(_=>{
        
        var light = new THREE.PointLight(0xffffff,.25);
        light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.scene.add(light);

        msg.final();
        msg.show();

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

            if (rnd < .075) {
              msg.show();
              this.finalHead.mesh.material = this.finalHead.materialSolid;
            }
            else if (rnd > .075 && rnd < .15) {
              msg.hide();
              this.finalHead.mesh.material = this.finalHead.materialWire;
            }
            else if (rnd > .15 && rnd < .225) {
              msg.show();
              this.finalHead.mesh.material = this.spaceMaterial;
            }

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
