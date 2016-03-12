export function sphericalTo3d(a, b, r): number[] {
  return [
    r * Math.cos(a) * Math.sin(b),
    r * Math.sin(a) * Math.sin(b),
    r * Math.cos(b),
  ];
}
