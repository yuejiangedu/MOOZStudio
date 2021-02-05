import * as THREE from "three";

export const getSceneMeshByNames = (
  scene: any,
  name: Array<string> = [],
  exclude: Array<string> = []
) => {
  const objects: Array<any> = [];
  const forEachChildren = (scene: any) => {
    scene.children.forEach((child: any) => {
      if (
        child instanceof THREE.Mesh &&
        (name.indexOf(child.name) !== -1 || name.length === 0) &&
        exclude.indexOf(child.name) === -1
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
