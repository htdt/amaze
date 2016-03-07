export class GameMessage {
  public container: HTMLElement = document.getElementById('msg');
  private parts: string[] = ['Reality', ' does&nbsp;not', ' exist', ' until', ' you', ' look', ' at&nbsp;it'];
  private counter: number = 0;

  public next(): boolean {
    this.container.innerHTML += this.parts[this.counter++];
    return this.counter < this.parts.length;
  }

  public final(): void {
    this.container.classList.remove('msg-game');
    this.container.classList.add('msg-fin');
    this.container.innerHTML = this.parts.join('<br>').replace(/ /g, '').replace('u<br>l', 'u&nbsp;l');
  }

  public hide(): void {
    this.container.style.display = 'none';
  }

  public show(): void {
    this.container.style.display = 'block';
  }
}
