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

export function InitUI(){
  var fsIcon = document.getElementById("fullscreen");
  if (fsIcon)
    fsIcon.addEventListener("click", () => fullscreen(document.body), false);
}