/**
 *    @author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 *
 *    A general perpose camera, for setting FOV, Lens Focal Length,
 *        and switching between perspective and orthographic views easily.
 *        Use this only if you do not wish to manage
 *        both a Orthographic and Perspective Camera
 *
 */

import * as THREE from 'three';

interface ClassCombinedCamera {
  fov: number;
  far: number;
  near: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  aspect: number;
  zoom: number;
  cameraO: THREE.OrthographicCamera;
  cameraP: THREE.PerspectiveCamera;
  view: {
    enabled: boolean;
    fullWidth: number;
    fullHeight: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  } | null;
  inPerspectiveMode: boolean;
  inOrthographicMode: boolean;
}

class CombinedCamera extends THREE.Camera implements ClassCombinedCamera {
  constructor(
    width: number,
    height: number,
    fov: number,
    near: number,
    far: number,
    orthoNear: number,
    orthoFar: number
  ) {
    super();

    this.fov = fov;

    this.far = far;
    this.near = near;

    this.left = -(width / 2);
    this.right = width / 2;
    this.top = height / 2;
    this.bottom = -(height / 2);

    this.aspect = width / height;
    this.zoom = 1;
    this.view = null;
    // We could also handle the projectionMatrix internally, but just wanted to test nested camera objects

    this.cameraO = new THREE.OrthographicCamera(
      this.left,
      this.right,
      this.top,
      this.bottom,
      orthoNear,
      orthoFar
    );
    this.cameraP = new THREE.PerspectiveCamera(fov, width / height, near, far);
  }

  inOrthographicMode = true;

  inPerspectiveMode = false;

  view: {
    enabled: boolean;
    fullWidth: number;
    fullHeight: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  } | null;

  cameraO: THREE.OrthographicCamera;

  cameraP: THREE.PerspectiveCamera;

  fov: number;

  far: number;

  near: number;

  left: number;

  right: number;

  top: number;

  bottom: number;

  aspect: number;

  zoom: number;

  get orgCamera() {
    return this.inOrthographicMode ? this.cameraO : this.cameraP;
  }

  toPerspective() {
    // Switches to the Perspective Camera

    this.near = this.cameraP.near;
    this.far = this.cameraP.far;

    this.cameraP.aspect = this.aspect;
    this.cameraP.fov = this.fov / this.zoom;

    this.cameraP.updateProjectionMatrix();
    this.projectionMatrix = this.cameraP.projectionMatrix;

    this.inPerspectiveMode = true;
    this.inOrthographicMode = false;
  }

  toOrthographic() {
    // Switches to the Orthographic camera estimating viewport from Perspective
    const fov = this.fov;
    const aspect = this.cameraP.aspect;
    const near = this.cameraP.near;
    const far = this.cameraP.far;
    // The size that we set is the mid plane of the viewing frustum

    const hyperfocus = (near + far) / 2;

    let halfHeight = Math.tan((fov * Math.PI) / 180 / 2) * hyperfocus;
    let halfWidth = halfHeight * aspect;

    halfHeight /= this.zoom;
    halfWidth /= this.zoom;

    this.cameraO.left = -halfWidth;
    this.cameraO.right = halfWidth;
    this.cameraO.top = halfHeight;
    this.cameraO.bottom = -halfHeight;
    this.cameraO.updateProjectionMatrix();

    this.near = this.cameraO.near;
    this.far = this.cameraO.far;
    this.projectionMatrix = this.cameraO.projectionMatrix;

    this.inPerspectiveMode = false;
    this.inOrthographicMode = true;
  }

  copy(source: any) {
    super.copy(source);

    this.fov = source.fov;
    this.far = source.far;
    this.near = source.near;

    this.left = source.left;
    this.right = source.right;
    this.top = source.top;
    this.bottom = source.bottom;

    this.zoom = source.zoom;
    this.view = source.view === null ? null : Object.assign({}, source.view);
    this.aspect = source.aspect;

    this.cameraO.copy(source.cameraO);
    this.cameraP.copy(source.cameraP);

    this.inOrthographicMode = source.inOrthographicMode;
    this.inPerspectiveMode = source.inPerspectiveMode;

    return this;
  }

  setViewOffset(
    fullWidth: number,
    fullHeight: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.view = {
      enabled: true,
      fullWidth: fullWidth,
      fullHeight: fullHeight,
      offsetX: x,
      offsetY: y,
      width: width,
      height: height,
    };

    if (this.inPerspectiveMode) {
      this.aspect = fullWidth / fullHeight;
      this.toPerspective();
    } else {
      this.toOrthographic();
    }
  }

  clearViewOffset() {
    this.view = null;
    this.updateProjectionMatrix();
  }

  setSize(width: number, height: number) {
    this.cameraP.aspect = width / height;
    this.left = -(width / 2);
    this.right = width / 2;
    this.top = height / 2;
    this.bottom = -(height / 2);
  }

  setFov(fov: number) {
    this.fov = fov;

    if (this.inPerspectiveMode) {
      this.toPerspective();
    } else {
      this.toOrthographic();
    }
  }

  // For maintaining similar API with PerspectiveCamera
  updateProjectionMatrix() {
    if (this.inPerspectiveMode) {
      this.toPerspective();
    } else {
      this.toOrthographic();
    }
  }

  /*
   * Uses Focal Length (in mm) to estimate and set FOV
   * 35mm (full frame) camera is used if frame size is not specified;
   * Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
   */
  setLens(focalLength: number, filmGauge?: number) {
    if (filmGauge === undefined) {
      filmGauge = 35;
    }

    const vExtentSlope =
      (0.5 * filmGauge) / (focalLength * Math.max(this.cameraP.aspect, 1));

    const fov = THREE.Math.RAD2DEG * 2 * Math.atan(vExtentSlope);

    this.setFov(fov);

    return fov;
  }

  setZoom(zoom: number) {
    this.zoom = zoom;

    if (this.inPerspectiveMode) {
      this.toPerspective();
    } else {
      this.toOrthographic();
    }
  }

  toFrontView() {
    this.rotation.x = 0;
    this.rotation.y = 0;
    this.rotation.z = 0;
    // should we be modifing the matrix instead?
  }

  toBackView() {
    this.rotation.x = 0;
    this.rotation.y = Math.PI;
    this.rotation.z = 0;
  }

  toLeftView() {
    this.rotation.x = 0;
    this.rotation.y = -(Math.PI / 2);
    this.rotation.z = 0;
  }

  toRightView() {
    this.rotation.x = 0;
    this.rotation.y = Math.PI / 2;
    this.rotation.z = 0;
  }

  toTopView() {
    this.rotation.x = -(Math.PI / 2);
    this.rotation.y = 0;
    this.rotation.z = 0;
  }

  toBottomView() {
    this.rotation.x = Math.PI / 2;
    this.rotation.y = 0;
    this.rotation.z = 0;
  }

  setPosition(x: number, y: number, z: number) {
    if (this.inOrthographicMode) {
      this.cameraO.position.set(x, y, z);
      this.toOrthographic();
    } else {
      this.cameraP.position.set(x, y, z);
      this.toPerspective();
    }
  }
}

export default CombinedCamera;
