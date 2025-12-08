#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const json5 = require('json5');
const commander = require('commander');
const {generate} = require('../lib/');

const main = async () => {
  const program = new commander.Command();

  program
    .option('-c, --config <file>', 'config file (JSON5)')
    .option('-j, --json <string>', 'config string (JSON5)')
    .option('-p, --profile <file>', 'printer / material profile file (JSON5)')
    .option('-o, --output <file>', 'output G-code file')
    .parse(process.argv);

  const opts = program.opts();

  opts.dna = { // default settings
    s: 4, // scale
    l: 4, // num layers
    p: 2 // print line step
  };

  if (opts.config) {
    const configBody = await fs.promises.readFile(opts.config, 'utf8');
    const configObj = json5.parse(configBody);
    Object.assign(opts.dna, configObj);
  } else if (opts.json) {
    const configObj = json5.parse(opts.json);
    Object.assign(opts.dna, configObj);
  } else {
    program.help();
    return;
  }

  opts.pcfg = { // printer settings
    extrusionRate: 0.03326, // from my settings
    xoffset: 250,
    yoffset: 250,
    bedTemperature: 70,
    printTemperature: 245
  };

  if (opts.profile) {
    const profileBody = await fs.promises.readFile(opts.profile, 'utf8');
    const profileObj = json5.parse(profileBody);
    Object.assign(opts.pcfg, profileObj);
  }

  const gcode = generate(opts);

  if (opts.output) {
    await fs.promises.writeFile(opts.output, gcode);
    return;
  }
  console.log(gcode);

};

main();
