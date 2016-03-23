// Based on NoSleep.js git.io/vfn01 by Rich Tibbett

export class NoSleep {
  private isAndroid: boolean = /Android/ig.test(navigator.userAgent);
  private isIOS: boolean = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  private noSleepTimer: number = null;
  private noSleepVideo: HTMLVideoElement;
  /* tslint:disable */
  private media = {
    WebM: "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=",
    MP4: "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw=="
  };
  /* tslint:enable */

  constructor() {
    if (this.isAndroid) {
      this.noSleepVideo = document.createElement('video');
      this.noSleepVideo.setAttribute('loop', '');
      this.addSourceToVideo(this.noSleepVideo, 'webm', this.media.WebM);
      this.addSourceToVideo(this.noSleepVideo, 'mp4', this.media.MP4);
    }
  }

  public enable(duration = 15000): void {
    if (this.isIOS) {
      this.disable();
      this.noSleepTimer = window.setInterval(() => {
        window.location.href = '/';
        window.setTimeout((<any>window).stop, 0);
      }, duration);
    } else if (this.isAndroid) {
      this.noSleepVideo.play();
    }
  };

  public disable(): void {
    if (this.isIOS) {
      if (this.noSleepTimer) {
        window.clearInterval(this.noSleepTimer);
        this.noSleepTimer = null;
      }
    } else if (this.isAndroid) {
      this.noSleepVideo.pause();
    }
  }

  public enableOnTouch(): void {
    let f = () => {
      this.enable();
      document.removeEventListener('touchstart', f);
    };
    document.addEventListener('touchstart', f);
  }

  private addSourceToVideo(element, type, dataURI): void {
    let source = document.createElement('source');
    source.src = dataURI;
    source.type = 'video/' + type;
    element.appendChild(source);
  }
}
