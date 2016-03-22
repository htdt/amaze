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
import {Final} from './core/final';
import {Audio} from '../senses/audio';
import {GameMessage} from '../engine/msg';
import {initUI} from '../senses/ui';
import {isMobile} from '../controls/controls';

export const SCALE = 50;

export class Display3D {
  public galaxy: Galaxy;
  public player: Player;
  public camera: Camera;
  public morphingSphere: MorphingSphere;
  public container: THREE.Object3D;
  public glitch: GlitchEffect;
  public final: Final;

  private animator: Animator;
  private scene: THREE.Scene;
  private renderer: Renderer;
  private spaceMaterial: THREE.ShaderMaterial;
  private wallMaterial: THREE.MeshLambertMaterial;
  private dust: Dust;
  private audio: Audio;

  constructor(msg: GameMessage) {
    let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    let pixelRatio = window.devicePixelRatio;
    this.animator = new Animator();
    this.camera = new Camera(resolution, this.animator);
    this.renderer = new Renderer(resolution, pixelRatio);
    this.scene = this.initScene();
    this.container = new THREE.Object3D();
    this.scene.add(this.container);
    this.audio = new Audio(this.animator, this.scene);
    this.glitch = new GlitchEffect(this.animator, resolution, this.renderer.renderer,
      this.scene, this.camera.camera, this.audio, pixelRatio);
    this.spaceMaterial = this.initSpaceMaterial(resolution);
    this.player = this.initPlayer(this.spaceMaterial);
    this.galaxy = new Galaxy(this.animator, this.spaceMaterial, this.container, this.audio);
    this.wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, shading: THREE.FlatShading });
    this.morphingSphere = new MorphingSphere(this.animator, this.container, this.audio);
    this.dust = new Dust(this.animator, this.container);
    this.final = new Final(this, this.animator, msg, this.audio);
    this.colorTransitionLoop();
    initUI(this.audio);
  }

  public render(dt: number): void {
    this.spaceMaterial.uniforms.iGlobalTime.value += dt / 1000;
    this.player.update(dt);
    this.audio.update(this.player, this.camera);
    this.animator.step();
    if (!this.glitch.render()) this.renderer.render(this.scene, this.camera.camera);
  }

  public rmContainer(): void {
    this.scene.remove(this.container);
  }

  public addFinalLight(): void {
    let light = new THREE.PointLight(0xffffff, .25);
    light.position.copy(this.camera.camera.position);
    this.scene.add(light);
  }

  public addEnvironment(w: number, h: number): void {
    let plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(w * SCALE, h * SCALE),
      this.wallMaterial
    );
    plane.rotation.x = Math.PI / 2;
    plane.position.x = w * SCALE / 2 - SCALE / 2;
    plane.position.z = h * SCALE / 2 - SCALE / 2;
    plane.position.y = -SCALE / 2;
    this.container.add(plane);
    this.dust.init(w, h);
  }

  public addWall(x: number, y: number): THREE.Mesh {
    let wall = new THREE.Mesh(
      new THREE.BoxGeometry(SCALE, SCALE, SCALE),
      this.wallMaterial
    );
    wall.position.x = x * SCALE;
    wall.position.z = y * SCALE;
    this.container.add(wall);
    return wall;
  }

  public moveObject(displayObj: THREE.Mesh, physObj: p2.Body): void {
    displayObj.position.x = physObj.position[0] * SCALE;
    displayObj.position.z = physObj.position[1] * SCALE;
    displayObj.rotation.y = -physObj.angle;
  }

  public delay(n: number) { return this.animator.delay(n); }

  private initScene(): THREE.Scene {
    let scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.004);
    scene.add(new THREE.AmbientLight(0x999999));
    return scene;
  }

  private initPlayer(spaceMaterial: THREE.ShaderMaterial): Player {
    let player = new Player(this.animator, spaceMaterial);
    this.scene.add(player.container);
    this.camera.target = player.container;
    return player;
  }

  private colorTransitionLoop(): void {
    this.animator.play({
      func: x => {
        let c = new THREE.Color().setHSL(x, .5, .85);
        this.wallMaterial.color.copy(c);
        this.dust.material.color.copy(c);
        this.scene.fog.color.copy(c);
        this.renderer.setClearColor(c);
      },
      duration: 200000,
      loop: true,
    });
  }

  private initSpaceMaterial(resolution: THREE.Vector2): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: spaceVertexShader,
      fragmentShader: spaceFragmentShader,
      uniforms: {
        iResolution: { type: 'v2', value: resolution },
        iGlobalTime: { type: 'f', value: 0 },
        fogDensity: { type: 'f', value: 0 },
        fogColor: { type: 'c', value: new THREE.Vector3() },
      },
      fog: true,
    });
  }
}
