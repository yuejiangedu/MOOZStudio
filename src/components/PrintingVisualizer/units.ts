import * as THREE from 'three';
import TrackballControls from '../../lib/three/TrackballControls';

export const updateCameraLookAt = (aspect: string, camera: THREE.PerspectiveCamera, workSize: { width: number; height: number }) => {
  const aspectData: { [index: string]: { pos: number[]; lookAt: number[]; up: number[] } } = {
    'front': {
      pos: [workSize.width / 2, -2 * workSize.width, workSize.height * 2 / 3],
      lookAt: [workSize.width / 2, workSize.width / 2, workSize.height / 2],
      up: [0, 0, 1]
    },
    'top': {
      pos: [workSize.width / 2, workSize.width / 2, 3 * workSize.height],
      lookAt: [workSize.width / 2, workSize.width / 2, workSize.height / 2],
      up: [0, 1, 0]
    },
    '3d': {
      pos: [-workSize.width, -workSize.width, 2 * workSize.height],
      lookAt: [workSize.width / 2, workSize.width / 2, workSize.height / 2],
      up: [0, 0, 1]
    },
    'left': {
      pos: [-2 * workSize.width, workSize.width / 2, workSize.height / 2],
      lookAt: [workSize.width / 2, workSize.width / 2, workSize.height / 2],
      up: [0, 0, 1]
    },
    'right': {
      pos: [3 * workSize.width, workSize.width / 2, workSize.height / 2],
      lookAt: [workSize.width / 2, workSize.width / 2, workSize.height / 2],
      up: [0, 0, 1]
    }
  };
  const [x, y, z] = aspectData[aspect].pos;
  const [x1, y1, z1] = aspectData[aspect].lookAt;
  const [x2, y2, z2] = aspectData[aspect].up;
  camera.position.set(x, y, z);
  camera.lookAt(x1, y1, z1);
  camera.up.set(x2, y2, z2);
};

export const updateZoom = (controls: TrackballControls, zoomVariation: number) => {
  if (controls.noZoom) {
    return;
  }
  zoomVariation < 0 ? controls.zoomIn(0.1) : controls.zoomOut(0.1);
  controls.update();
};
