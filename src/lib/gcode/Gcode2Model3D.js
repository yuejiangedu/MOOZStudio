import colornames from 'colornames';
import * as THREE from 'three';
import isEmpty from 'lodash/isEmpty';
import Toolpath from './Toolpath';

const defaultColor = new THREE.Color(colornames('lightgrey'));
const motionColor = {
  'G0': [250, 250, 250],
  'G1': [0, 0, 0],
  'G2': [3, 169, 244],
  'G3': [33, 150, 243]
};
class GCodeVisualizer {
  constructor({ type, lineList }) {
    this.geometry = new THREE.BufferGeometry();
    this.frameIndex = 0;
    this.type = type || 'LOAD_WORKSPACE_MODEL';
    this.lineList = lineList;
    this.prevTypeCode = null;
    this.vertices = [];
    this.colors = [];
    this.typeCodes = [];
    this.layerIndexs = [];
    this.gcodeSize = {
      xmin: -0,
      ymin: -0,
      zmin: -0,
      xmax: 0,
      ymax: 0,
      zmax: 0
    };
    return this;
  }

  getTypeSetting = (typeCode) => {
    for (let index = 0; index < this.lineList.length; index++) {
      if (this.lineList[index].typeCode === typeCode) {
        return this.lineList[index].color;
      }
    }
    return null;
  };

  rgb2Hex = (r, g, b) => {
    r = ('0' + (Math.round(r) || 0).toString(16)).slice(-2);
    g = ('0' + (Math.round(g) || 0).toString(16)).slice(-2);
    b = ('0' + (Math.round(b) || 0).toString(16)).slice(-2);
    return '#' + r + g + b;
  }

  filterLineColor = (typeCode) => {
    const modelColor = this.getTypeSetting(typeCode); //[0,0,0]
    if (modelColor) {
      return modelColor;
    } else {
      return [255, 255, 255];
    }
  }

  updateGcodeSize = (point) => {
    if ((point.x && point.y && point.z) || (!point.z && point.s > 0)) {
      const { xmin, ymin, zmin, xmax, ymax, zmax } = this.gcodeSize;
      Object.assign(this.gcodeSize, {
        xmin: xmin === -0 ? point.x : Math.min(xmin, point.x),
        ymin: ymin === -0 ? point.y : Math.min(ymin, point.y),
        zmin: zmin === -0 ? point.z : Math.min(zmin, point.z),
        xmax: xmax === 0 ? point.x : Math.max(xmax, point.x),
        ymax: ymax === 0 ? point.y : Math.max(ymax, point.y),
        zmax: zmax === 0 ? point.z : Math.max(zmax, point.z)
      });
    }
  }

  render(gcode, onParsed, onProgress, onError) {
    if (isEmpty(gcode)) {
      onError(new Error('gcode is empty'));
      return;
    }

    let progress = 0;

    const toolpath = new Toolpath({
      // @param {object} modal The modal object.
      // @param {object} v1 A 3D vector of the start point.
      // @param {object} v2 A 3D vector of the end point.
      addLine: (modal, v1, v2) => {


        const { motion } = modal;
        let color = null;
        if (v2.s && v2.s !== 0) {
          color = [255 - v2.s, 255 - v2.s, 255 - v2.s];
        } else {
          color = motionColor[motion] || defaultColor;
        }

        this.type === 'LOAD_PRINTING_MODEL' && (color = this.filterLineColor(v2.type));

        if (this.prevTypeCode !== v2.type && this.vertices.lenght !== 0) {
          // use: prev position + current color + current layer index + current type code
          const prevZ = this.vertices[this.vertices.length - 1];
          const prevY = this.vertices[this.vertices.length - 2];
          const prevX = this.vertices[this.vertices.length - 3];
          if (prevZ && prevY && prevX) {
            this.vertices.push(prevX);
            this.vertices.push(prevY);
            this.vertices.push(prevZ);
            this.colors.push(...color);
            this.layerIndexs.push(modal.layer || 0);
            this.typeCodes.push(v2.type);
          }
        }

        this.prevTypeCode = v2.type;

        this.updateGcodeSize(v2);
        this.layerIndexs.push(modal.layer || 0);
        this.typeCodes.push(v2.type);
        this.vertices.push(v2.x, v2.y, v2.z);
        this.colors.push(...color);
      },
      // @param {object} modal The modal object.
      // @param {object} v1 A 3D vector of the start point.
      // @param {object} v2 A 3D vector of the end point.
      // @param {object} v0 A 3D vector of the fixed point.
      addArcCurve: (modal, v1, v2, v0) => {
        const { motion, plane } = modal;
        const isClockwise = (motion === 'G2');
        const radius = Math.sqrt(
          ((v1.x - v0.x) ** 2) + ((v1.y - v0.y) ** 2)
        );
        const startAngle = Math.atan2(v1.y - v0.y, v1.x - v0.x);
        let endAngle = Math.atan2(v2.y - v0.y, v2.x - v0.x);

        // Draw full circle if startAngle and endAngle are both zero
        if (startAngle === endAngle) {
          endAngle += (2 * Math.PI);
        }

        const arcCurve = new THREE.ArcCurve(
          v0.x, // aX
          v0.y, // aY
          radius, // aRadius
          startAngle, // aStartAngle
          endAngle, // aEndAngle
          isClockwise // isClockwise
        );
        const divisions = 30;
        const points = arcCurve.getPoints(divisions);
        const color = motionColor[motion] || defaultColor;

        for (let i = 0; i < points.length; ++i) {
          const point = points[i];
          const z = ((v2.z - v1.z) / points.length) * i + v1.z;

          if (plane === 'G17') { // XY-plane
            this.vertices.push(point.x, point.y, z);
          } else if (plane === 'G18') { // ZX-plane
            this.vertices.push(point.x, point.y, z);
          } else if (plane === 'G19') { // YZ-plane
            this.vertices.push(point.x, point.y, z);
          }
          this.colors.push(color[0], color[1], color[2]);
        }
      }
    });
    toolpath.loadFromStringSync(gcode, (line, i, length) => {
      const curProgress = i / length;
      if ((curProgress - progress > 0.01)) {
        progress = curProgress;
        onProgress(progress);
      }
    });

    onParsed({ vertices: this.vertices, colors: this.colors, typeCodes: this.typeCodes, layerIndex: this.layerIndexs, gcodeSize: this.gcodeSize });

    onProgress(1);
  }
}

export default GCodeVisualizer;
