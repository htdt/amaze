// THREE imported globally in webpack.config.js:25

import {Animator} from './core/animator';
import {Camera} from './core/camera';
import {HeadObject} from './core/end';
import {spaceVertexShader, spaceFragmentShader} from './sfx/shaders';
import {GameMessage} from '../engine/msg';
import {Dust} from './objects/dust';
import {sphericalTo3d} from './core/math';
import {MorphingSphere} from './objects/morphing-sphere';

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

export class Display3D {
  scene: THREE.Scene;
  container: THREE.Object3D;
  camera: Camera;
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
    let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.animator = new Animator();
    this.scene = new THREE.Scene();
    this.camera = new Camera(resolution, this.animator);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(resolution.x, resolution.y);
    this.renderer.setClearColor(0xffffff);
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.004);
    document.body.appendChild(this.renderer.domElement);
    // window.addEventListener('resize', () => {
    //   this.renderer.setSize(this.resolution.x, this.resolution.y);
    // }, false);

    this.container = new THREE.Object3D();
    this.scene.add(this.container);
    this.scene.add(new THREE.AmbientLight(0x999999));

    this.glitch = false;
    this.initSpaceMaterial(resolution);
    this.initPlayer();
    this.camera.target = this.player;
    this.initProtoGalaxy();
    this.initGlitch(resolution);
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

  initSpaceMaterial(resolution: THREE.Vector2): void{
    this.spaceMaterial = new THREE.ShaderMaterial({
      vertexShader: spaceVertexShader,
      fragmentShader: spaceFragmentShader,
      uniforms: {
        iResolution: { type: 'v2', value: resolution },
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

  initProtoGalaxy(): void{
    this.protoGalaxy = new THREE.Mesh(
      new THREE.SphereGeometry(SCALE/1.25, 16, 16),
      this.spaceMaterial
    );
  }

  initGlitch(resolution: THREE.Vector2): void{
    this.glitchComposer = new THREE.EffectComposer( this.renderer );
    this.glitchComposer.addPass( new THREE.RenderPass( this.scene, this.camera.camera ) );

    var glitchPass = new THREE.GlitchPass();
    glitchPass.renderToScreen = true;
    glitchPass.goWild = true;
    this.glitchComposer.addPass(glitchPass);
    this.glitchComposer.setSize(
      resolution.x * window.devicePixelRatio,
      resolution.y * window.devicePixelRatio);
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
        
        this.camera.final(5000, cameraq);
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
        // light.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
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
    else this.renderer.render(this.scene, this.camera.camera);
  }
}
