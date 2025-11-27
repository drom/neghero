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
          \e----------<---------/
*/

  const turns = 10;
  const spacing = 0.4; // mm
  const length = 10; // mm
  for (let i = 0; i < turns; i++) {
    // extrude line
    res.push('G1 X' + length + ' Y0 Z0.2 F3000'); // Move to the end of the line
    // turn around in 2 30 degree angle moves



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
