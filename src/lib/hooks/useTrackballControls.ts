import TrackballControls from "../three/TrackballControls";
import CombinedCamera from "../three/CombinedCamera";
import * as THREE from "three";

export const useTrackballControls = (
  camera:
    | THREE.PerspectiveCamera
    | THREE.OrthographicCamera
    | CombinedCamera
    | undefined,
  renderer: THREE.Renderer | null
) => {
  const defaultOptions = {
    rotateSpeed: 1.0,
    zoomSpeed: 1.2,
    panSpeed: 0.8,
    staticMoving: true,
    dynamicDampingFactor: 0.3,
    keys: [65, 83, 68],
    minDistance: 1,
    maxDistance: 2000,
    target: new THREE.Vector3(0, 0, 0),
  };

  const setControlsTarget = (
    controls: TrackballControls,
    vector: THREE.Vector3
  ) => {
    if (controls) {
      controls.target = vector;
      controls.update();
    }
  };

  const createTrackballControls = (options: any = {}) => {
    if (!camera || !renderer) {
      return;
    }

    const validOptions = Object.assign(defaultOptions, options);
    const newControls = new TrackballControls(
      camera as THREE.PerspectiveCamera | THREE.OrthographicCamera,
      renderer.domElement
    );
    Object.assign(newControls, validOptions);
    newControls.update();
    return newControls;
  };

  const setControlsZoom = (
    controls: TrackballControls | null,
    zoomVariation: number
  ) => {
    if (controls) {
      zoomVariation < 0 ? controls.zoomIn(0.1) : controls.zoomOut(0.1);
      controls.update();
    }
  };

  const resetControl = (
    controls: TrackballControls | null,
    newTarget?: { x: number; y: number; z: number }
  ) => {
    if (!controls) return;
    const originTarget = { ...(newTarget ? newTarget : controls.target) };
    controls.reset();
    controls.target.x = originTarget.x;
    controls.target.y = originTarget.y;
    controls.target.z = originTarget.z;
    controls.update();
  };

  return {
    createTrackballControls,
    setControlsTarget,
    setControlsZoom,
    resetControl,
  };
};
