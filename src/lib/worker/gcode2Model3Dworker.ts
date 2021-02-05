import * as THREE from 'three';
import GCodeVisualizer from '../gcode/Gcode2Model3D';
import { buryevent } from '../../lib/ganalysis/ganalysis';
const ctx: Worker = self as any;

interface Iparams {
  vertices: number[];
  colors: number[];
  typeCodes: number[];
  layerIndex: number[];
  gcodeSize: { [index: string]: number }
}

ctx.addEventListener("message", (e) => {
  const { gcode, type, lineList } = e.data;
  new GCodeVisualizer({ type, lineList }).render(gcode, ({ vertices, colors, typeCodes, layerIndex, gcodeSize }: Iparams) => {
    const bufferGeometry = new THREE.BufferGeometry();
    const verticesAttribute = new THREE.Float32BufferAttribute(vertices, 3);
    const colorAttribute = new THREE.Uint8BufferAttribute(colors, 3);
    colorAttribute.normalized = true;
    bufferGeometry.addAttribute('position', verticesAttribute);
    bufferGeometry.addAttribute('color', colorAttribute);
    const verticesBuf = bufferGeometry.getAttribute('position').array;
    const colorsBuf = bufferGeometry.getAttribute('color').array;
    ctx.postMessage({ type: 'LOAD_GCODE_LINE', vertices: verticesBuf, colors: colorsBuf, typeCodes, layerIndex, gcodeSize });
  }, (progress: number) => {
    console.log('progress', progress);
    ctx.postMessage({ type: 'LOAD_GCODE_PROGRESS', progress });
  }, (error: string) => {
    console.log('error', error);
    buryevent('status_generating_gcode', { 'event_category': '3dp', 'event_label': 'fail' });
  });
});
