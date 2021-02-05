import * as THREE from 'three';

interface Iprops {
  radius: number;
  longitude: number;
  latitude: number;
  height: number;
  color: string;
  postion: {
    x: number;
    y: number;
    z: number;
  };
}
class CyclinderGridLine extends THREE.Group {
  constructor({ radius, longitude, latitude, color, height, postion }: Iprops) {
    super();
    const group = new THREE.Group();
    const colorGrid = new THREE.Color(color) || new THREE.Color(0x888888);
    const borderColor = 0x999999;
    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height + 1, longitude, latitude);
    const cylinderMat = new THREE.MeshBasicMaterial({
      color: colorGrid,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinderMesh.position.set(postion.x, postion.y, height / 2);
    cylinderMesh.rotation.set(0.5 * Math.PI, 0, 0);
    cylinderMesh.name = 'collisionObj';

    //顶部圆线
    const circlesegments = 64;
    const circleMaterial = new THREE.LineBasicMaterial({ color: borderColor });
    const circleGeometry = new THREE.CircleGeometry(radius, circlesegments);
    circleGeometry.vertices.shift();
    const circle = new THREE.Line(circleGeometry, circleMaterial);
    circle.position.set(postion.x, postion.y, height);


    //添加底部辅助线
    const radials = 8;
    const circles = 4;
    const divisions = 64;
    const helper = new THREE.PolarGridHelper(radius, radials, circles, divisions, borderColor, borderColor);
    helper.position.set(postion.x, postion.y, 0);
    helper.rotation.set(0.5 * Math.PI, 0, 0);

    group.add(circle);
    group.add(helper as THREE.Object3D);
    group.add(cylinderMesh);

    return group;
  }
}

export default CyclinderGridLine;
