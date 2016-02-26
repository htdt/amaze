class SoundBuffer{
  buffer: any;
  constructor(public url: string, public ctx: AudioContext){}
  load(): Promise <any>{
    return window.fetch(this.url)
      .then(d=>d.arrayBuffer())
      .then(d=>
        new Promise((resolve, reject) =>
          this.ctx.decodeAudioData(d, buffer=>resolve(buffer), ()=>reject())
          ))
      .then(buffer=>this.buffer = buffer);
  }
}

class Sound{
  source: any;
  volume: any;
  panner: any;

  constructor(
    public ctx: AudioContext,
    buffer: any,
    mainVolume: any,
    loop: boolean,
    global: boolean = true)
  {
    this.source = ctx.createBufferSource();
    this.source.loop = loop;
    this.volume = ctx.createGain();
    this.source.connect(this.volume);
    if (global) this.volume.connect(mainVolume);
    else {
      this.panner = ctx.createPanner();
      this.volume.connect(this.panner);
      this.panner.connect(mainVolume);
    }
    this.source.buffer = buffer;
  }

  play(): void{this.source.start()}
  stop(): void{this.source.stop()}
  setPosition(x,y,z): void{this.panner.setPosition(x, y, z)}
}

interface Window { AudioContext: any; webkitAudioContext: any;}

export class AudioPlayer{
  sb: any;
  q: number = 0;

  constructor(){
    window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'] || null;
    if (!AudioContext) throw new Error("AudioContext not supported!");

    var ctx = new AudioContext();
    var mainVolume = ctx.createGain();
    mainVolume.connect(ctx.destination);

    this.sb = {
      bg: new SoundBuffer('media/sound/bg.wav', ctx),
      final: new SoundBuffer('media/sound/final.wav', ctx),
      morphing: new SoundBuffer('media/sound/morphing.wav', ctx),
      generating: new SoundBuffer('media/sound/generating.wav', ctx),
    }

    var makeSome = (c, f) => {for (let i=0;i<c;i++) f(i);}
    var createSomeSB = (name, c) =>
      makeSome(c, i =>
        this.sb[`${name}${i}`] = new SoundBuffer('media/sound/'+name+i+'.wav', ctx));
    
    createSomeSB('hole', 7);
    // createSomeSB('glitchShort', 7);
    // createSomeSB('glitchMed', 2);
    // createSomeSB('glitchLong', 2);
    
    //this.s = new Sound(ctx, mainVolume, true, false);
    //this.s.load().then(()=>this.s.play());
  }

  load(){
    return Promise.all(Object.keys(this.sb).map(i => this.sb[i].load()));
  }

  update(dt:number){
    this.q += dt/5000;
    //this.s.setPosition(Math.cos(this.q),0,0);
  }
}