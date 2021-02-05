import CombinedCamera from "../../lib/three/CombinedCamera";

const PERSPECTIVE_FOV = 20;
const PERSPECTIVE_NEAR = 0.1;
const PERSPECTIVE_FAR = 2000;
const ORTHOGRAPHIC_FOV = 30;
const ORTHOGRAPHIC_NEAR = 0.1;
const ORTHOGRAPHIC_FAR = 2000;

export const useCombinedCamera = () => {
  const changeCombinedCamera = (
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera | CombinedCamera,
    type: string = "orthographic"
  ) => {
    if (type === "orthographic") {
      (camera as CombinedCamera).toOrthographic();
      (camera as CombinedCamera).setZoom(2);
      (camera as CombinedCamera).setFov(ORTHOGRAPHIC_FOV);
    } else {
      (camera as CombinedCamera).toPerspective();
      (camera as CombinedCamera).setZoom(2);
      (camera as CombinedCamera).setFov(PERSPECTIVE_FOV);
    }
  };

  const createCombinedCamera = (width: number, height?: number) => {
    const frustumWidth = width / 2;
    const frustumHeight = (height || width) / 2; // same to width if height is 0
    const fov = PERSPECTIVE_FOV;
    const near = PERSPECTIVE_NEAR;
    const far = PERSPECTIVE_FAR;
    const orthoNear = ORTHOGRAPHIC_NEAR;
    const orthoFar = ORTHOGRAPHIC_FAR;

    const cbCamera = new CombinedCamera(
      frustumWidth,
      frustumHeight,
      fov,
      near,
      far,
      orthoNear,
      orthoFar
    );
    return cbCamera;
  };

  const setCombinedCameraPos = (
    cbCamera: CombinedCamera,
    vector: THREE.Vector3
  ) => {
    cbCamera.setPosition(vector.x, vector.y, vector.z);
    // cbCamera.position.set(vector.x, vector.y, vector.z);
  };

  const updateCameraLookAt = (
    aspect: string,
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    workSize: { width: number; height: number },
    originOffset = { x: 0, y: 0 }
  ) => {
    const aspectData: { [index: string]: { pos: number[]; up: number[] } } = {
      front: {
        pos: [
          workSize.width / 2 + originOffset.x,
          -2 * workSize.width + originOffset.y,
          (workSize.height * 2) / 3,
        ],
        up: [0, 0, 1],
      },
      top: {
        pos: [
          workSize.width / 2 + originOffset.x,
          workSize.width / 2 + originOffset.y,
          3 * workSize.height,
        ],
        up: [0, 1, 0],
      },
      "3d": {
        pos: [
          2 * workSize.width + originOffset.x,
          -2 * workSize.width + originOffset.y,
          2 * workSize.height,
        ],
        up: [0, 0, 1],
      },
      left: {
        pos: [
          -2 * workSize.width + originOffset.x,
          workSize.width / 2 + originOffset.y,
          workSize.height / 2,
        ],
        up: [0, 0, 1],
      },
      right: {
        pos: [
          3 * workSize.width + originOffset.x,
          workSize.width / 2 + originOffset.y,
          workSize.height / 2,
        ],
        up: [0, 0, 1],
      },
    };
    const [x, y, z] = aspectData[aspect].pos;
    const [x2, y2, z2] = aspectData[aspect].up;
    camera.position.set(x, y, z);
    camera.up.set(x2, y2, z2);
  };

  return {
    setCombinedCameraPos,
    createCombinedCamera,
    changeCombinedCamera,
    updateCameraLookAt,
  };
};
