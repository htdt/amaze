// THREE imported globally in webpack.config.js:25

import {Animator} from './core/animator';
import {Camera} from './core/camera';
import {Renderer} from './core/renderer';
import {MorphingSphere} from './objects/morphing-sphere';
import {Dust} from './objects/dust';
import {Galaxy} from './objects/galaxy';
import {GlitchEffect} from './sfx/glitch';
import {spaceVertexShader, spaceFragmentShader} from './sfx/shaders';
import {Player} from './objects/player';

export const SCALE = 50;

export class Display3D {
  scene: THREE.Scene;
  container: THREE.Object3D;
  camera: Camera;
  renderer: Renderer;
  animator: Animator;
  player: Player;
  galaxy: Galaxy;
  morphingSphere: MorphingSphere;
  spaceMaterial: THREE.ShaderMaterial;
  wallMaterial: THREE.MeshLambertMaterial;
  dust: Dust;
  glitch: GlitchEffect;

  constructor() {
    let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.animator = new Animator();
    this.camera = new Camera(resolution, this.animator);
    this.renderer = new Renderer(resolution);
    this.initSceneAndContainer();
    this.glitch = new GlitchEffect(this.animator, resolution, this.renderer.renderer, this.scene, this.camera.camera);
    this.initSpaceMaterial(resolution);
    this.initPlayer();
    this.galaxy = new Galaxy(this.animator, this.spaceMaterial, this.container);
    this.initWallMaterial();
    this.morphingSphere = new MorphingSphere(this.animator, this.container);
    this.dust = new Dust(this.animator, this.container);
  }

  public rmContainer(): void {
    this.scene.remove(this.container);
  }

  private initSceneAndContainer(): void {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.004);
    this.scene.add(new THREE.AmbientLight(0x999999));
    this.container = new THREE.Object3D();
    this.scene.add(this.container);
  }

  private initPlayer(): void {
    this.player = new Player(this.animator, this.spaceMaterial);
    this.scene.add(this.player.container);
    this.camera.target = this.player.container;
  }


  initWallMaterial(): void {
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


  render(dt: number): void {
    this.spaceMaterial.uniforms.iGlobalTime.value += dt / 1000;
    this.animator.step();
    if (!this.glitch.render())
      this.renderer.render(this.scene, this.camera.camera);
  }
}
