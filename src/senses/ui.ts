import {Audio} from './audio';

function fullscreen(el) {
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

export function initUI(audio: Audio) {
  let fslink = document.getElementById('fullscreen');
  if (fslink) fslink.addEventListener('click', () => fullscreen(document.body));

  let slink = document.getElementById('sound');
  if (slink) slink.addEventListener('click', () => {
    audio.toggleMute();
    slink.classList.toggle('off');
  });
}
