export class GameMessage {
  parts: string[] = ["Reality"," does&nbsp;not"," exist"," until"," you"," look"," at&nbsp;it"];
  container: HTMLElement = document.getElementById("msg");
  counter: number = 0;

  next(): boolean {
    this.container.innerHTML += this.parts[this.counter++];
    return this.counter < this.parts.length;
  }

  final(): void {
    this.container.classList.remove('msg-game');
    this.container.classList.add('msg-fin');
    this.container.innerHTML = this.parts.join('<br>').replace(/ /g,'').replace("u<br>l","u&nbsp;l");
  }

  hide(): void {
    this.container.style.display = 'none';
  }

   show(): void {
     this.container.style.display = 'block';
   }
}