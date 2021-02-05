import * as THREE from 'three';

interface Iprops {
  sizeX: number;
  stepX: number;
  sizeY: number;
  stepY: number;
  height: number;
  color: string;
}
class CubeGridLine extends THREE.Group {
  constructor({ sizeX, stepX, sizeY, stepY, color, height }: Iprops) {
    super();
    const group = new THREE.Group();

    const colorGrid = new THREE.Color(color) || new THREE.Color(0x888888);

    sizeY = (typeof sizeY === 'undefined') ? sizeX : sizeY;
    stepY = (typeof stepY === 'undefined') ? stepX : stepY;

    for (let i = 0; i <= sizeX; i += stepX) {
      const geometry = new THREE.Geometry();
      const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors
      });
      const color = colorGrid;

      geometry.vertices.push(
        new THREE.Vector3(0, i, 0),
        new THREE.Vector3(sizeX, i, 0),
      );
      geometry.colors.push(color, color);

      group.add(new THREE.Line(geometry, material));
    }

    for (let i = 0; i <= sizeY; i += stepY) {
      const geometry = new THREE.Geometry();
      const material = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors
      });
      const color = colorGrid;

      geometry.vertices.push(
        new THREE.Vector3(i, 0, 0),
        new THREE.Vector3(i, sizeY, 0),
      );
      geometry.colors.push(color, color);

      group.add(new THREE.Line(geometry, material));
    }
    const cubeGeometry = new THREE.CubeGeometry(sizeX, sizeY, height);
    const cube = new THREE.Mesh(cubeGeometry,
      new THREE.MeshBasicMaterial({
        opacity: 0,
      }));
    cube.name = 'collisionObj';
    const edges = new THREE.EdgesGeometry(cubeGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: colorGrid
    });
    const edgeLines = new THREE.LineSegments(edges, edgesMaterial);
    cube.position.set(sizeX / 2, sizeY / 2, height / 2);
    edgeLines.position.set(sizeX / 2, sizeY / 2, height / 2);
    group.add(cube, edgeLines);

    //箭头坐标轴
    const creatarrow = (pos1: any, color: any) => {
      const dir = new THREE.Vector3(pos1[0], pos1[1], pos1[2]);
      const origin = new THREE.Vector3(0, 0, 0);
      const headLength = 2.5;
      const headWidth = 2.2;
      const length = 20;
      const hex = color;
      const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, headLength, headWidth);
      return arrowHelper;
    };
    const arrowHelper = creatarrow([0, 20, 0], 0x00ff00);
    const arrowHelper1 = creatarrow([20, 0, 0], 0xff0000);
    const arrowHelper2 = creatarrow([0, 0, 20], 0x0000ff);
    group.add(arrowHelper, arrowHelper1, arrowHelper2);

    //坐标轴描述
    const createtext = (text: string, color: string, position: any) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.fillStyle = color;
      ctx.font = 'Bold 30px Arial';
      ctx.lineWidth = 4;
      ctx.fillText(text, 100, 100);
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter;

      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const textObj = new THREE.Sprite(material);
      textObj.scale.set(0.5 * 100, 0.25 * 100, 0.75 * 100);
      textObj.position.set(position[0], position[1], position[2]);
      return textObj;
    };
    const textObj1 = createtext('X', '#ff0000', [30, 0, 0]);
    const textObj2 = createtext('Y', '#00FF00', [0, 15, 0]);
    const textObj3 = createtext('Z', '#0000ff', [0, 0, 20]);
    group.add(textObj1, textObj2, textObj3);

    return group;
  }
}

export default CubeGridLine;
