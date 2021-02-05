import * as THREE from "three";
import { rotateCoordConvertByOrigin, mm2px } from "../../lib/units";
import { getSceneMeshByNames } from "../three-model/units";
import { useReducer, useEffect } from "react";
import { useSelector } from "react-redux";
import { Istate } from "../../rootRedux/type";
import { IrootState } from "../../rootRedux";

interface IinitState {
  rotateHelper: any;
  scaleHelper: Array<any>;
  radius: number;
  widthSegments: number;
  heightSegments: number;
  color: string;
  _lineColor: string;
  dom: any;
  _visible: boolean;
  _rotate_top_distance: number;
  scalePoint: Array<string>;
  scaleSyncXY: boolean;
  tf_name: string;
  objName: string;
}
const defaultState: IinitState = {
  rotateHelper: null,
  scaleHelper: [],
  radius: 1,
  widthSegments: 20,
  heightSegments: 20,
  color: "#999999",
  _lineColor: "#ff0000",
  dom: null,
  _visible: false,
  _rotate_top_distance: 40,
  scalePoint: [
    "leftTop",
    "centerTop",
    "rightTop",
    "centerRight",
    "rightBottom",
    "centerBottom",
    "leftBottom",
    "centerLeft",
  ],
  scaleSyncXY: true,
  tf_name: "",
  objName: "",
};

const reducer = (state: any, action: { type: string; value: any }) => {
  if (action.type in state) {
    return { ...state, [action.type]: action.value };
  } else {
    return { ...state };
  }
};

const preMovePoint = {
  x: 0,
  y: 0,
};

let rotateLine: THREE.Line;

let scaleLine: THREE.Line;

let _nameIndex = 0;

let _plane = new THREE.Plane();

let _worldPosition = new THREE.Vector3();

let _intersection = new THREE.Vector3();

let _inverseMatrix = new THREE.Matrix4();

let _offset = new THREE.Vector3();

let catchPointName = "";

let _object: any = null;

export const useTransformHelper = (
  _scene: THREE.Scene,
  _camera: any,
  _renderer: THREE.Renderer,
  onTransfer?: (_object: any) => void,
  onTransferEnd?: (_object: any) => void
) => {
  const [state, setState] = useReducer(reducer, defaultState);
  const { DPI } = useSelector<IrootState, Istate>(
    (state) => state.rootReducers
  );

  const initTransformHelper = () => {
    if (_scene && _camera && _renderer) {
      setState({ type: "dom", value: _renderer.domElement || document });
    }
  };

  const catchIntersectsObj = (e: any) => {
    const { dom, scalePoint } = state;
    preMovePoint.x = e.offsetX;
    preMovePoint.y = e.offsetY;
    const mouse = new THREE.Vector2();
    mouse.x = (e.offsetX / dom.offsetWidth) * 2 - 1;
    mouse.y = -(e.offsetY / dom.offsetHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, _camera);
    const objects = getSceneMeshByNames(
      _scene,
      ["rotatePoint", _object ? _object.tf_name : "", ...scalePoint],
      [],
      "tf_name"
    );
    const intersects = raycaster.intersectObjects(objects);
    const intersectsObj = intersects[0] && intersects[0].object;

    if (intersects.length > 0 && e.type === "mousedown") {
      handleOperation(e, (intersectsObj as any).tf_name);
      toggleVisible(true);
    }
    changeCursorStyle(intersectsObj);
  };

  const changeCursorStyle = (obj: any | undefined) => {
    if (obj) {
      const cursorStyle: { [name: string]: string } = {
        leftTop: "nw-resize",
        centerTop: "n-resize",
        rightTop: "ne-resize",
        centerRight: "e-resize",
        rightBottom: "se-resize",
        centerBottom: "s-resize",
        leftBottom: "sw-resize",
        centerLeft: "w-resize",
        rotatePoint: "crosshair",
        [state.objName]: "move",
      };
      state.dom.style.cursor = cursorStyle[obj.tf_name];
    } else {
      state.dom.style.cursor = "default";
    }
  };

  const handleOperation = (event: any, name: string) => {
    if (name) {
      catchPointName = name;
      switch (name) {
        case "rotatePoint":
          state.dom.addEventListener("mousemove", rotateTarget, false);
          break;
        case state.objName:
          createReferencePlane(event);
          state.dom.addEventListener("mousemove", transformTarget, false);
          break;
        default:
          state.dom.addEventListener("mousemove", scaleTarget, false);
          break;
      }
      state.dom.addEventListener("mouseup", removeEvent, false);
    }
  };

  const createReferencePlane = (event: any) => {
    const { dom } = state;
    event.preventDefault();
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    mouse.x = (event.offsetX / dom.offsetWidth) * 2 - 1;
    mouse.y = -(event.offsetY / dom.offsetHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);
    if (raycaster.ray.intersectPlane(_plane, _intersection)) {
      _inverseMatrix.getInverse(_object.parent.matrixWorld);
      _offset
        .copy(_intersection)
        .sub(_worldPosition.setFromMatrixPosition(_object.matrixWorld));
    }
  };

  const transformTarget = (event: any) => {
    event.preventDefault();
    const { dom } = state;
    if (!_object) {
      return;
    }
    let raycaster = new THREE.Raycaster(); //射线
    let mouse = new THREE.Vector2(); //鼠标位置
    //构建拖拽参考平面
    mouse.x = (event.offsetX / dom.offsetWidth) * 2 - 1;
    mouse.y = -(event.offsetY / dom.offsetHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, _camera);
    if (raycaster.ray.intersectPlane(_plane, _intersection) && _object) {
      const vector3 = _intersection.sub(_offset).applyMatrix4(_inverseMatrix);
      _object.position.x = vector3.x;
      _object.position.y = vector3.y;
      onTransfer && onTransfer(_object);
      updatePosition();
    }
  };

  const scaleTarget = (event: any) => {
    event.preventDefault();
    const { scaleSyncXY } = state;
    if (!_object) {
      return;
    }
    interface ScaleProportion {
      [propName: string]: Array<number>;
    }
    const scaleProportion: ScaleProportion = {
      centerTop: [0, preMovePoint.y - event.offsetY],
      centerBottom: [0, event.offsetY - preMovePoint.y],
      centerLeft: [preMovePoint.x - event.offsetX, 0],
      centerRight: [event.offsetX - preMovePoint.x, 0],
      leftTop: [preMovePoint.x - event.offsetX, preMovePoint.y - event.offsetY],
      rightTop: [
        event.offsetX - preMovePoint.x,
        preMovePoint.y - event.offsetY,
      ],
      rightBottom: [
        event.offsetX - preMovePoint.x,
        event.offsetY - preMovePoint.y,
      ],
      leftBottom: [
        preMovePoint.x - event.offsetX,
        event.offsetY - preMovePoint.y,
      ],
    };
    const scale = scaleProportion[catchPointName];
    let scaleX: number, scaleY: number;
    if (scaleSyncXY) {
      //同步缩放,获取x,y任意一个有效的偏移量
      scaleX = scale[0] || scale[1];
      scaleY = (scaleX * _object.height) / _object.width;
    } else {
      scaleX = scale[0];
      scaleY = (scale[1] * _object.height) / _object.width;
    }

    _object.scale.x += scaleX / mm2px(_object.width);
    _object.scale.y += scaleY / mm2px(_object.height);
    preMovePoint.x = event.offsetX;
    preMovePoint.y = event.offsetY;
    onTransfer && onTransfer(_object);
    updatePosition();
  };

  const rotateTarget = (event: any) => {
    event.preventDefault();
    if (!_object) {
      return;
    }
    const centerVector = worldVectorToScreenVector(
      _object.position.x,
      _object.position.y
    );
    const rad = getRotateRad(
      { x: event.offsetX, y: event.offsetY },
      { x: centerVector.x, y: centerVector.y }
    );
    const isFlipY = _object.scale.y < 0;
    const addRad = isFlipY ? rad + Math.PI : rad;
    _object && (_object.rotation.z = addRad);
    onTransfer && onTransfer(_object);
    updatePosition();
  };

  const getRotateRad = (startPoint: any, rotateCenter: any) => {
    const end = {
      x: startPoint.x - rotateCenter.x,
      y: rotateCenter.y - startPoint.y,
    };

    const rad = Math.atan2(end.y, end.x);

    return rad - Math.PI / 2;
  };

  const worldVectorToScreenVector = (x: number, y: number) => {
    const worldVector = new THREE.Vector3(x, y, 0);
    const vector = worldVector.project(_camera as any);
    const halfWidth = state.dom.offsetWidth / 2,
      halfHeight = state.dom.offsetHeight / 2;
    return {
      x: Math.round(vector.x * halfWidth + halfWidth),
      y: Math.round(-vector.y * halfHeight + halfHeight),
    };
  };

  const updateScene = () => {
    if (_renderer) {
      _renderer.render(_scene, _camera as any);
    }
  };

  const createRotateHelper = () => {
    const { radius, widthSegments, heightSegments, color } = state;
    const sphereGeometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments
    );
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color,
      polygonOffset: true,
      polygonOffsetFactor: -20,
      polygonOffsetUnits: -20,
    });
    const rotateHelper = new THREE.Mesh(sphereGeometry, sphereMaterial);
    (rotateHelper as any).tf_name = "rotatePoint";
    rotateHelper.visible = state._visible;
    setState({ type: "rotateHelper", value: rotateHelper });
    _scene.add(rotateHelper);
  };

  const updateRotateline = (rotateHelper: any, scaleHelper: any) => {
    if (rotateLine) {
      _scene.remove(rotateLine);
    }
    const material = new THREE.LineBasicMaterial({ color: state._lineColor });
    const geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(rotateHelper.x, rotateHelper.y, rotateHelper.z)
    );
    geometry.vertices.push(
      new THREE.Vector3(scaleHelper.x, scaleHelper.y, scaleHelper.z)
    );

    rotateLine = new THREE.Line(geometry, material);
    (rotateLine as any).tf_name = "rotateline";
    rotateLine.visible = state._visible;
    _scene.add(rotateLine);
  };

  const createScaleHelper = () => {
    const { radius, widthSegments, heightSegments, color, scalePoint } = state;
    const scalePoints: any[] = [];
    scalePoint.forEach((pointName: string) => {
      const sphereGeometry = new THREE.SphereGeometry(
        radius,
        widthSegments,
        heightSegments
      );
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color,
        polygonOffset: true,
        polygonOffsetFactor: -5,
        polygonOffsetUnits: -5,
      });
      const pointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      (pointMesh as any).tf_name = pointName;
      pointMesh.visible = state._visible;
      scalePoints.push(pointMesh);
      _scene.add(pointMesh);
    });
    setState({ type: "scaleHelper", value: [...scalePoints] });
  };

  const updatePosition = () => {
    const { _rotate_top_distance, rotateHelper, scaleHelper, _visible } = state;
    if (!_object) {
      return;
    }
    const height = mm2px(_object.height * _object.scale.y);
    const width = mm2px(_object.width * _object.scale.x);
    //更新旋转点位置
    const rotate = (_object.rotation.z * 180) / Math.PI;
    const angle = rotate > 0 ? 360 - rotate : Math.abs(rotate);
    const scaleYdirection = _object.scale.y / Math.abs(_object.scale.y);
    const centerPointX = mm2px(_object.position.x);
    const centerPointY = mm2px(_object.position.y);
    const rotatePointY =
      centerPointY + (height / 2 + scaleYdirection * _rotate_top_distance);
    const rotatePoint = rotateCoordConvertByOrigin(
      centerPointX,
      rotatePointY,
      angle,
      centerPointX,
      centerPointY,
      DPI
    );
    rotateHelper.visible = _visible;
    rotateHelper.position.set(rotatePoint.x, rotatePoint.y, 0);
    //更新拖拽点位置
    const scalePointPostion = [
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, -1],
      [-1, 0],
    ];
    scalePointPostion.forEach((item, index) => {
      const point = {
        x: centerPointX + (item[0] * width) / 2,
        y: centerPointY + (item[1] * height) / 2,
      };
      const coord = rotateCoordConvertByOrigin(
        point.x,
        point.y,
        angle,
        centerPointX,
        centerPointY,
        DPI
      );
      scaleHelper[index].visible = _visible;
      scaleHelper[index].position.set(coord.x, coord.y, 0);
    });

    //更新线的位置
    updateScaleLine();

    //更新旋转线位置s
    updateRotateline(rotateHelper.position, scaleHelper[1].position);

    updateScene();
  };

  const updateScaleLine = () => {
    scaleLine && removeMaterial(scaleLine);
    const geometry = new THREE.Geometry();
    for (let index = 0; index < state.scaleHelper.length; index += 2) {
      const element = state.scaleHelper[index];
      const { x, y, z } = element.position;
      geometry.vertices.push(new THREE.Vector3(x, y, z));
    }
    const material = new THREE.LineDashedMaterial({
      color: state._lineColor,
      polygonOffset: true,
      polygonOffsetFactor: -10,
      polygonOffsetUnits: -10,
    });
    scaleLine = new THREE.LineLoop(geometry, material);
    scaleLine.visible = state._visible;
    _scene.add(scaleLine);
    setState({ type: "scaleLine", value: scaleLine });
  };

  const removeMaterial = (matrerial: any) => {
    matrerial.traverse((obj: any) => {
      obj.geometry.dispose();
      obj.material.dispose();
    });
    _scene.remove(matrerial);
    updateScene();
  };

  const toggleVisible = (visible: boolean) => {
    setState({ type: "_visible", value: visible });
  };

  const setLineColor = (color: string) => {
    setState({ type: "_lineColor", value: color });
  };

  const setHandleTarget = (obj: any) => {
    _object = obj;
    toggleVisible(Boolean(_object));
  };

  const removeEvent = () => {
    state.dom.removeEventListener("mousemove", transformTarget);
    state.dom.removeEventListener("mousemove", rotateTarget);
    state.dom.removeEventListener("mousemove", scaleTarget);
    state.dom.removeEventListener("mouseup", removeEvent);
    onTransferEnd && onTransferEnd(_object);
  };

  useEffect(() => {
    if (_object) {
      _object.tf_name = `_object${_nameIndex++}`;
      setState({ type: "objName", value: _object.tf_name });
      //相对相机方向及物体世界坐标设置参考平面
      _plane.setFromNormalAndCoplanarPoint(
        (_camera as THREE.Camera).getWorldDirection(_plane.normal),
        _worldPosition.setFromMatrixPosition(_object.matrixWorld)
      );
      updatePosition();
    }
  }, [_object]);

  useEffect(() => {
    if (state.dom && !state.rotateHelper) {
      createRotateHelper();
      createScaleHelper();
    }
  }, [state.dom]);

  useEffect(() => {
    if (state.dom) {
      state.dom.addEventListener("mousedown", catchIntersectsObj);
      state.dom.addEventListener("mousemove", catchIntersectsObj);
    }
    return () => {
      if (state.dom) {
        state.dom.removeEventListener("mousedown", catchIntersectsObj);
        state.dom.removeEventListener("mousemove", catchIntersectsObj);
      }
    };
  });

  useEffect(() => {
    const { _visible, scaleHelper, rotateHelper } = state;

    state._visible && updatePosition();

    if (scaleHelper.length !== 0) {
      scaleHelper.forEach((scalePoint: any) => {
        scalePoint.visible = _visible;
      });
    }

    scaleLine && (scaleLine.visible = _visible);
    rotateHelper && (rotateHelper.visible = _visible);
    rotateLine && (rotateLine.visible = _visible);
    updateScene();
  }, [state._visible]);

  useEffect(() => {
    if (_scene && _renderer && _camera) {
      updateScaleLine();
      updateRotateline(
        state.rotateHelper.position,
        state.scaleHelper[1].position
      );
    }
  }, [state._lineColor]);

  return {
    setHandleTarget,
    setLineColor,
    toggleVisible,
    initTransformHelper,
    update: updatePosition,
  };
};
