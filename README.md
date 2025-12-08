# neĝero

SnowFlake G-code generator

For printing on 3D printer with transparent material PETG, Polycarbonate, etc. In a single layer.

Generate set of continious outline paths expanding from center with branches under 30 degrees.

## Examples

```js
./bin/main.js -j "{tree:[7,[4,[5,[7,[5,[2,[5,[6,[6,[7,5,1],7],3],15],2],1],[9,[4,4,2],3]],5],5],3],s:4,l:11,p:2.8}" -o neghero-0005.gcode
```

![](./assets/neghero-0005.jpg)

## CLI usage


## Other

View G-code online: https://ncviewer.com

## TODO

Online version: neghero.drom.io

CLI version `npx neghero`

Printer / material related parameters:

* line spacing
* line width
* layer height
* print speed
