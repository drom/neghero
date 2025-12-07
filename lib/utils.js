'use strict';

const dirLut = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];

// translate snowflake tree data structure into set of line calls
const tr2lines = (line) => {
  const rec = (node, x, y, dir) => {
    const len = Array.isArray(node) ? node[0] : node;
    const [xm, ym] = line(x, y, dir, len);
    if (Array.isArray(node)) {
      const [, l, r] = node;
      rec(l, xm, ym, dir);
      rec(r, xm, ym, dir + 1);
      rec(r, xm, ym, dir - 1);
    }
  };
  rec(tr, 0, 0, 0);
};

// line function that creates SVG path
const svgPathLine = (d) => {
  d = d || [];
  const line = (x1, y1, dir, len) => {
    const c = dirLut[(dir + 600) % 6];
    const xm = x1 + c[0] * len;
    const ym = y1 + c[1] * len;
    if ((y1 < 0) || (ym < 0)) {
      return [xm, ym];
    }
    d.push('M', x1, y1, 'L', xm, ym);
    return [xm, ym];
  };
  return {line, d};
};

// line function that creates dot array
const dotLine = (arr) => {
  if (typeof arr === 'number') {
    arr = new Uint8Array(arr * arr); // square array
  }
  arr.fill(255);
  const line = (x1, y1, dir, len) => {
    const c = dirLut[(dir + 600) % 6];
    const xm = x1 + c[0] * len;
    const ym = y1 + c[1] * len;
    for (let i = 0; i <= len; i++) {
      const x = x1 + c[0] * i;
      const y = y1 + c[1] * i;
      if ((x >= 0) && (y >= 0)) {
        arr[x + w * y] = 1;
      }
    }
    return [xm, ym];
  };
  return {line, arr};
};

const treeScale = (root, scale) => {
  const rec = (node) => {
    if (typeof node === 'number') {
      return node * scale;
    }
    return node.map(rec);
  };
  return rec(root);
};

const nut = (mat, w, x, y, r) => {
  mat[x + w * y] = 0; // center
  for (let i = 1; i <= r; i++) { // layers
    for (let j = 0; j < 6; j++) { // 6 edges
      const jlut = [
        [ 1, -1,  0,  1], // 0
        [ 0, -1,  1,  0], // 1
        [-1,  0,  1, -1], // 2
        [-1,  1,  0, -1], // 3
        [ 0,  1, -1,  0], // 4
        [ 1,  0, -1,  1]  // 5
      ];
      const jc = jlut[j];
      for (let k = 0; k < i; k++) {
        const x1 = x + jc[0] * i + jc[1] * k;
        const y1 = y + jc[2] * i + jc[3] * k;
        const xy1 = x1 + w * y1;
        if (mat[xy1] > i) {
          mat[xy1] = i;
        }
      }
    }
  }
};

const tr2dt = (tr, layers) => {
  const w = 1024;
  const mat = new Uint8Array(w * w);
  mat.fill(255);
  const line = (x1, y1, dir, len) => {
    const c = dirLut[(dir + 600) % 6];
    const xm = x1 + c[0] * len;
    const ym = y1 + c[1] * len;
    for (let i = 0; i <= len; i++) {
      const x = x1 + c[0] * i;
      const y = y1 + c[1] * i;
      if ((x >= 0) && (y >= 0)) {
        nut(mat, w, x, y, layers);
      }
    }
    return [xm, ym];
  };
  const rec = (node, x, y, dir) => {
    const len = Array.isArray(node) ? node[0] : node;
    const [xm, ym] = line(x, y, dir, len);
    if (Array.isArray(node)) {
      const [s, l, r] = node;
      rec(l, xm, ym, dir);
      rec(r, xm, ym, dir + 1);
      rec(r, xm, ym, dir - 1);
    }
  };
  rec(tr, 0, 0, 0);
  return mat;
};

const dt2cr = (dt, numLayers) => {
  const w = Math.sqrt(dt.length);
  const res = [];
  for (let l = 1; l <= numLayers; l += 2) { // trace only odd layers
    const d = [];
    res.push(d);
    // find starting point
    let x = 0;
    let y = 0;
    for (let i = 0; i < w; i++) {
      if (dt[i] === l) {
        x = i;
        break;
      }
    }
    d.push([x, y]); // start point
    dt[x + y * w] = 255;
    let dir = 1;
    loop1: for (let i = 0; i < 200000; i++) { // max number of points
      for (const j of [0, 4, 5, 1, 2, 3]) { // delta directions to try
        let dir1 = (dir + j) % 6; // direction to try
        const c = dirLut[dir1];
        const xm = x + c[0];
        const ym = y + c[1];
        if ((x > 0) && (ym > 0) && (dt[xm + ym * w] === l)) { // found a way
          x = xm;
          y = ym;
          if (j === 0) { // straight line
            d[d.length - 1] = [x, y];
          } else { // new point for turn
            d.push([x, y]);
          }
          dt[xm + ym * w] = 255;
          if (x === y) {
            break loop1;
          }
          dir = dir1;
          break;
        }
      }
    }
  }
  return res;
};

const cr2hex = (segments) => {
  const tx = 0.5; // Math.sin(Math.PI / 6);
  const ty = Math.cos(Math.PI / 6); // 0.866
  const res = [];
  segments.map((points) => {
    const seg = [];
    res.push(seg);
    const $ = points.map((point) => [point[0] + tx * point[1], point[1] *  ty]);

    for (let q = 0; q < 6; q++) {
      for (let i = 0; i < $.length; i++) {
        const a = (q / 3) * Math.PI;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const [x, y] = $[i];
        seg.push([
          ca * x - sa * y,
          sa * x + ca * y
        ]);
      }
      for (let i = ($.length - 1); i >= 0; i--) {
        const a = ((q + 1) / 3) * Math.PI;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const [x, y] = $[i];
        seg.push([
          ca * x - sa * -y,
          sa * x + ca * -y
        ]);
      }
    }
  });
  return res;
};

const hex2gcode = (hex, opts) => {
  const {pcfg, dna} = opts;
  const {xoffset, yoffset, extrusionRate} = pcfg;
  const scale = dna.p;
  const res = [];
  let e = 0;
  hex.map((points, si) => { // each segment
    let xprev = 0;
    let yprev = 0;
    points.map((point, pi) => { // each point
      let [x, y] = point;
      x = point[0] * scale / 10;
      y = point[1] * scale / 10;
      if (pi === 0) { // move to start point
        res.push([
          'G0', // rapid move
          'F' + 6000, // feed rate
          'X' + (x + xoffset).toFixed(3), // x position
          'Y' + (y + yoffset).toFixed(3), // y position
          ...(pi === 0 ? ['Z0.2'] : [])
        ].join(' '));
        if (si === 0) { // first segment
          res.push('G1 F2700 E0 ;reset extruder position');
        }
      } else { // extrude line to next point
        e += Math.sqrt((x - xprev) ** 2 + (y - yprev) ** 2);
        res.push([
          'G1', // extrude move
          ...(pi === 1 ? ['F' + 900] : []), // feed rate
          'X' + (x + xoffset).toFixed(3), // x position
          'Y' + (y + yoffset).toFixed(3), // y position
          'E' + (e * extrusionRate).toFixed(5) // extrusion
        ].join(' '));
      }
      xprev = x;
      yprev = y;
    });
  });
  return res;
};

// const genBasicLine = (opts) => {
//   const res = [
//     'G1 X0 Y0 Z0.2 F3000', // Move to the starting position
//   ];
// /*
//           /----->---------------\
//          /                       \
//         /  /----------->-------\  \
//        /  /                     \  \
//       /  /  /------------->---\  \  \
//      <  <  0                   >  >  >
//       \  \--1---------<-------/  /  /
//        \                        /  /
//         \--2-----<-------------/  /
//                                  /
//           e-----------<---------/
// */

//   const turns = 20;
//   const spacing = 0.5; // mm
//   const length = 30; // mm
//   for (let i = 0; i < turns; i++) {
//     // extrude short segment
//     const ya = (i + 0.5) * spacing;
//     const xd = Math.tan(Math.PI / 6);
//     const xa = xd * ya;
//     // extrude short segment 1
//     res.push('G1 X' + (-xa) + ' Y' + (-ya));
//     // extrude line 1
//     res.push('G1 X' + (length + xa) + ' Y' + (-ya));
//     // turn around in 2 30 degree angle moves
//     res.push('G1 X' + (length + 2 * xa) + ' Y0');
//     res.push('G1 X' + (length + xa) + ' Y' + ya);
//     if (i === turns - 1) {
//       // tail
//       res.push('G1 X' + (-xa) + ' Y' + ya);
//       break;
//     }
//     // get ready for next turn
//     res.push('G1 X' + (-xa - xd) + ' Y' + ya);
//     res.push('G1 X' + (-xa * 2 - xd) + ' Y0');
//   }
//   return res;
// };



exports.tr2lines = tr2lines;
exports.svgPathLine = svgPathLine;
exports.dotLine = dotLine;
exports.treeScale = treeScale;
exports.tr2dt = tr2dt;
exports.dt2cr = dt2cr;
exports.cr2hex = cr2hex;
exports.hex2gcode = hex2gcode;

// exports.genBasicLine = genBasicLine;
