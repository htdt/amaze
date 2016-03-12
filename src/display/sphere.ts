import {sphericalTo3d} from './math';

export function generateSphere(vertices: Float32Array, ilen: number, klen: number, rr: number[]) {
  for (let i = 0; i < ilen; i++)
  for (let k = 0; k < klen; k++)
  {
    let i1 = i == ilen - 1 ? 0 : i + 1;
    let k1 = k == klen - 1 ? 0 : k + 1;

    let q1 = i / ilen * Math.PI * 2;
    let q2 = k / klen * Math.PI;
    let q3 = i1 / ilen * Math.PI * 2;
    let q4 = k1 / klen * Math.PI;

    let v1 = sphericalTo3d(q1, q2, rr[i + k * ilen]);
    let v2 = sphericalTo3d(q3, q2, rr[i1 + k * ilen]);
    let v3 = sphericalTo3d(q1, q4, rr[i + k1 * ilen]);
    let v4 = sphericalTo3d(q3, q4, rr[i1 + k1 * ilen]);

    let offset = (k * ilen + i) * 6 * 3;

    copy3array(vertices, offset, v3);
    copy3array(vertices, offset + 3, v2);
    copy3array(vertices, offset + 6, v1);
    copy3array(vertices, offset + 9, v2);
    copy3array(vertices, offset + 12, v3);
    copy3array(vertices, offset + 15, v4);
  }
}

function copy3array(a, offset, b) {
  a[offset] = b[0];
  a[offset + 1] = b[1];
  a[offset + 2] = b[2];
}
