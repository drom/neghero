# neĝero

SnowFlake G-code generator

For printing on 3D printer with transparent material PETG, Polycarbonate, etc. In a single layer.

Generate set of continious outline paths expanding from center with branches under 30 degrees.

## Examples

```js
npx neghero -j "{tree:[7,[4,[5,[7,[5,[2,[5,[6,[6,[7,5,1],7],3],15],2],1],[9,[4,4,2],3]],5],5],3],s:4,l:11,p:2.8}" -o neghero-0005.gcode
```

![](./assets/neghero-0005.jpg)

```js
npx neghero -j "{tree:[7,[5,[11,[12,[4,[6,[9,4,4],10],15],13],16],5],3],l:15,p:2.8}" -o neghero-0006.gcode
```

![](./assets/neghero-0006.jpg)

```js
npx neghero -j "{tree:[7,[5,[11,[11,[10,[9,[7,2,1],5],[5,4,1]],[6,[5,5,1],1]],[7,[7,4,2],3]],8],4],l:9,p:2.8}" -o neghero-0007.gcode
```

![](./assets/neghero-0007.jpg)


## CLI usage

`npx neghero`

```txt
Usage: neghero [options]

Options:
  -c, --config <file>   config file (JSON5)
  -j, --json <string>   config string (JSON5)
  -p, --profile <file>  printer / material profile file (JSON5)
  -o, --output <file>   output G-code file
  -h, --help            display help for command
```

## SnowFlake configuration format

Each unique snoflake is defined by object with following properties:

### tree:

A structure, defining topology of snowflake arms.
It is a recursive structure of nodes, where node is a 3 element array:

#### Node

```
[trunk, center, side]
```

* trunk - natural number defining length of trunk line.
* center - element defining center branch. Could be:
  - natural number, for a final central branch.
  - Node, for a next level of the tree.
* side - element defining two side branches. Could be:
  - natural number, for a final side branches.
  - Node, for a next level of the tree.

### s:

Tree scale. natural number to scale tree numbers. (optional, default: 4)

### l:

Layer count. natural number defining number of layers lines around the skeleton of the tree. (optional, default: 4)

### p:

display/print grid pitch. (optional, default: 2)

## Online version

https://observablehq.com/@drom/heghero

## Other

View G-code online: https://ncviewer.com

## TODO

Online version: neghero.drom.io

Printer / material related parameters:

* line spacing
* line width
* layer height
* print speed
