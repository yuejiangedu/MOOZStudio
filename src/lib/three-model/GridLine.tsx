import * as THREE from 'three';

class GridLine extends THREE.Group {
  group: THREE.Object3D = new THREE.Object3D();

  colorCenterLine: THREE.Color = new THREE.Color(0x444444);

  colorGrid: THREE.Color = new THREE.Color(0x888888);

  constructor(sizeX: number, stepX: number, sizeY: number, stepY: number, colorCenterLine: THREE.Color, colorGrid: THREE.Color) {
    super();

    colorCenterLine = new THREE.Color(colorCenterLine) || this.colorCenterLine;
    colorGrid = new THREE.Color(colorGrid) || this.colorGrid;

    sizeY = (typeof sizeY === 'undefined') ? sizeX : sizeY;
    stepY = (typeof stepY === 'undefined') ? stepX : stepY;

    for (let i = 0; i <= sizeX; i += stepX) {
      const geometry = new THREE.Geometry();
      const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors
      });
      const color = (i === 0) ? colorCenterLine : colorGrid;

      geometry.vertices.push(
        new THREE.Vector3(0, i, 0),
        new THREE.Vector3(sizeX, i, 0),
      );
      geometry.colors.push(color, color);

      this.group.add(new THREE.Line(geometry, material));
    }

    for (let i = 0; i <= sizeY; i += stepY) {
      const geometry = new THREE.Geometry();
      const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors
      });
      const color = (i === 0) ? colorCenterLine : colorGrid;

      geometry.vertices.push(
        new THREE.Vector3(i, 0, 0),
        new THREE.Vector3(i, sizeY, 0),
      );
      geometry.colors.push(color, color);

      this.group.add(new THREE.Line(geometry, material));
    }

    return this.group;
  }
}

export default GridLine;
