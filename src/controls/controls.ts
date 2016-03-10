export class Controls {
  public turn: number = 0;
  public up: number = 0;
}

export function isMobile(): boolean {
  return typeof window.orientation !== 'undefined';
}
