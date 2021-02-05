import * as THREE from "three";
import TrackballControls from "../../lib/three/TrackballControls";

export const updateZoom = (
  controls: TrackballControls,
  zoomVariation: number
) => {
  if (controls.noZoom) {
    return;
  }
  zoomVariation < 0 ? controls.zoomIn(0.1) : controls.zoomOut(0.1);
  controls.update();
};

export const getSceneMeshByNames = (
  scene: any,
  name: Array<string> = [],
  exclude: Array<string> = [],
  customKey: string = "name"
) => {
  const objects: Array<any> = [];
  const forEachChildren = (scene: any) => {
    scene.children.forEach((child: any) => {
      if (
        child instanceof THREE.Mesh &&
        (name.indexOf(child[customKey]) !== -1 || name.length === 0) &&
        exclude.indexOf(child[customKey]) === -1
      ) {
        objects.push(child);
      } else if (child instanceof THREE.Group) {
        forEachChildren(child);
      }
    });
  };
  forEachChildren(scene);
  return objects;
};
