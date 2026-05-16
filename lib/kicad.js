'use strict';

const {treeScale, tr2dt, dt2cr, cr2hex, hex2gcode} = require('./utils.js');

const grLiner = (cfg) => (pos) => `
  (gr_line
    (start ${pos.start.x} ${pos.start.y})
    (end ${pos.end.x} ${pos.end.y})
    (stroke (width ${cfg.width}) (type default))
    (layer "${cfg.layer}")
  )`;

// generate KiCAD trace with snowflake pattern
const kicad = (spec) => {
  const {tree, s, l, p, center} = spec;
  const grLine = grLiner({layer: 'F.Cu', width: 0.16});
  const tree1 = treeScale(tree, s);
  const dt = tr2dt(tree1, l);
  const cr = dt2cr(dt, l);
  const hex = cr2hex(cr);

  const scale = p;
  const xx = (x) => (x * scale + center.x).toFixed(2);
  const yy = (y) => (y * scale + center.y).toFixed(2);

  const res = [];
  for (const seg of hex) {
    for (let i = 1; i < seg.length; i++) {
      const p1 = seg[i - 1];
      const p2 = seg[i];
      res.push(grLine({
        start: {x: xx(p1[0]), y: yy(p1[1])},
        end:   {x: xx(p2[0]), y: yy(p2[1])}}
      ));
    }
  }

  return res.join('\n');
};

module.exports = kicad;
