'use strict';


const genHeader = (opts) => [
  'G21', // set units to millimeters
  'G28', // home all axes
  'G90', // set to absolute positioning
  'G92 E0', // zero the extruded length
  'G1 F200 E3', // extrude 3mm of feed stock
  'G92 E0', // zero the extruded length again
];

const genFooter = (opts) => [
  'G0 Z2.00', // Raise the tool to a safe height
  // 'G92 E0', // zero the extruded length
  // 'G1 F200 E-3', // retract 3mm of feed stock
  // 'G92 E0', // zero the extruded length again
  // 'G28', // home all axes
  'M2', // End of program
];

const genBasicLine = (opts) => {
  const res = [
    'G1 X0 Y0 Z0.2 F3000', // Move to the starting position
  ];
/*
          /----->---------------\
         /                       \
        /  /----------->-------\  \
       /  /                     \  \
      /  /  /------------->---\  \  \
     <  <  0                   >  >  >
      \  \--1---------<-------/  /  /
       \                        /  /
        \--2-----<-------------/  /
                                 /
          e-----------<---------/
*/

  const turns = 20;
  const spacing = 0.5; // mm
  const length = 30; // mm
  for (let i = 0; i < turns; i++) {
    // extrude short segment
    const ya = (i + 0.5) * spacing;
    const xd = Math.tan(Math.PI / 6);
    const xa = xd * ya;
    // extrude short segment 1
    res.push('G1 X' + (-xa) + ' Y' + (-ya));
    // extrude line 1
    res.push('G1 X' + (length + xa) + ' Y' + (-ya));
    // turn around in 2 30 degree angle moves
    res.push('G1 X' + (length + 2 * xa) + ' Y0');
    res.push('G1 X' + (length + xa) + ' Y' + ya);
    if (i === turns - 1) {
      // tail
      res.push('G1 X' + (-xa) + ' Y' + ya);
      break;
    }
    // get ready for next turn
    res.push('G1 X' + (-xa - xd) + ' Y' + ya);
    res.push('G1 X' + (-xa * 2 - xd) + ' Y0');
  }
  return res;
};

const generate = (opts) => {
  const res = [
    ...genHeader(opts),
    ...genBasicLine(opts),
    ...genFooter(opts),
  ];
  return res.join('\n');
};

module.exports = generate;
