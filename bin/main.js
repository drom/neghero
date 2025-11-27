#!/usr/bin/env node

const generate = require('../lib/index.js');

const main = async () => {
  const args = process.argv.slice(2);
  const options = args.reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    acc[key] = value;
    return acc;
  }, {});
  const gcode = generate(options);
  console.log(gcode);
};

main();
