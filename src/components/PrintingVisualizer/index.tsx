import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import colornames from 'colornames';
import _each from 'lodash/each';
import isElectron from 'is-electron';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import * as History from 'history';
import { Vector3 } from 'three';
import { TransformControls } from '../../lib/three/TransformControls';
import { CONTAINER_MARGIN, NAVBAR_HEIGHT, RIGHT_SIDER_WIDTH, LEFT_SIDER_WIDTH, PRINTING_SPACE } from '../../constants';
import CubeGridLine from './CubeGridLine';
import CyclinderGridLine from './CyclinderGridLine';
import TrackballControls from '../../lib/three/TrackballControls';
import { changeDecimal } from '../../lib/units';
import { getSceneMeshByNames } from '../CNCVisualizer/units';
import ContextMenu from '../ContextMenu/ContextMenu';
import { updateZoom } from '../../lib/three-model/units';
import { IupdateModel3Dsize, IupdateModelDection, IupdatePrintingFile, IupdateModel3Ddata, IprintingState } from '../../containers/Printing/types';

import { updateModelDection } from '../../containers/Printing/actions';
import FollowMousePrompt from '../FollowMousePrompt';
import { useCombinedCamera } from '../../lib/hooks/useCombinedCamera';

const ModelLoadWorker = require('worker-loader!../../lib/worker/modelLoadWorker');

interface Iprops extends Pick<IprintingState, 'model3Ddata' | 'controlPattern' | 'file' | 'printingVersion' | 'model3Dsize' | 'isometricRotation'> {
  show: boolean;
  location: History.Location;
  style: { display: string };
  zoom: number;
  cameraPosition: string[];
  updateModel3Ddata: IupdateModel3Ddata;
  updatePrintingFile: IupdatePrintingFile;
  updateModel3Dsize: IupdateModel3Dsize;
  updateModelDection: IupdateModelDection;
}
const PERSPECTIVE_FOV = 45;
const PERSPECTIVE_NEAR = 0.1;
const PERSPECTIVE_FAR = 2500;
const METRIC_GRID_SPACING = 10; // 10 mm
const TRACKBALL_CONTROLS_MIN_DISTANCE = 1;
const TRACKBALL_CONTROLS_MAX_DISTANCE = 2000;
const CONTROL_PATTERN: { [index: string]: string } = {
  'MOVE': 'translate',
  'ROTATE': 'rotate',
  'SCALE': 'scale'
};
let camera!: THREE.PerspectiveCamera;
let renderer!: THREE.WebGLRenderer;
let scene!: THREE.Scene;
let controls: TrackballControls;
let backgroundGridLine!: THREE.Group;
const modelLoadWorker = new ModelLoadWorker();

let transformControls: any;
let ModelObject: THREE.Mesh;
let currentZoom = 1;
let collisionObj3D: THREE.Object3D;

const PrintingVisualizer = (props: Iprops) => {
  const { show } = props;
  const node = useRef<HTMLDivElement>(null);
  const workSize = PRINTING_SPACE[props.printingVersion];
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const [rotatePrompt, setRotatePrompt] = useState('');
  const [promptDisplay, setDisplayPrompt] = useState(false);

  const { updateCameraLookAt } = useCombinedCamera();
  const updateScene = () => {
    renderer.render(scene, camera);
  };


  const initModelZpos = () => {
    const bbox = new THREE.Box3();
    bbox.expandByObject(ModelObject);
    if (bbox.min.z !== 0) {
      ModelObject.position.z = ModelObject.position.z - bbox.min.z;
      updateScene();
      initModelZpos();
    }
  };

  const getVisibleWidth = () => {
    const currentClientWidth = document.documentElement.clientWidth;
    const visibleWidth = (
      currentClientWidth - RIGHT_SIDER_WIDTH - LEFT_SIDER_WIDTH - 2 * CONTAINER_MARGIN
    );
    return visibleWidth;
  };

  const getVisibleHeight = () => {
    const clientHeight = document.documentElement.clientHeight;
    const visibleHeight = (
      clientHeight - NAVBAR_HEIGHT - 2 * CONTAINER_MARGIN
    );
    return visibleHeight;
  };

  const createPerspectiveCamera = (width: number, height: number) => {
    const fov = PERSPECTIVE_FOV;
    const aspect = (width > 0 && height > 0) ? Number(width) / Number(height) : 1;
    const near = PERSPECTIVE_NEAR;
    const far = PERSPECTIVE_FAR;
    const perspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    perspectiveCamera.position.x = workSize.width / 2;
    perspectiveCamera.position.y = -2 * workSize.width;
    perspectiveCamera.position.z = workSize.height * 2 / 3;
    camera = perspectiveCamera;
    camera.lookAt(workSize.width / 2, workSize.width / 2, workSize.height / 2);
  };

  const initRender = (width: number, height: number) => {
    const webGLRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    webGLRenderer.shadowMap.enabled = true;
    webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    webGLRenderer.setClearColor(0xffffff);
    webGLRenderer.setSize(width, height);
    webGLRenderer.clear();
    renderer = webGLRenderer;
  };

  const addLight = () => {
    const color = 0xffffff;
    const intensity = 1;
    let light: THREE.DirectionalLight;

    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, -1, 1);
    scene.add(light);

    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(1, -1, 1);
    scene.add(light);

    const AmbientLight = new THREE.AmbientLight(colornames('gray 25')); // soft white light
    scene.add(AmbientLight);
  };

  const updateWorkArea = () => {
    let gridLine: THREE.Group;
    if (props.printingVersion === 'MOOZ-3') {
      gridLine = new CyclinderGridLine({
        radius: workSize.width / 2,
        longitude: 80,
        latitude: 80,
        height: workSize.height,
        color: '#f5f5f5',
        postion: {
          x: 0,
          y: 0,
          z: 0
        }
      });
    } else {
      gridLine = new CubeGridLine({
        sizeX: workSize.width,
        stepX: METRIC_GRID_SPACING,
        sizeY: workSize.width,
        stepY: METRIC_GRID_SPACING,
        height: workSize.height,
        color: colornames('gray 44') || 'black'
      });
    }

    _each(gridLine.children, (o: any) => {
      if (!o.material) {
        return;
      }
      if ((o.material as THREE.Material).type === 'SpriteMaterial') {
        (o.material as THREE.SpriteMaterial).transparent = true;
        (o.material as THREE.SpriteMaterial).depthWrite = false;
        return;
      }
      (o.material as THREE.Material).opacity = 0.25;
      (o.material as THREE.Material).transparent = true;
      (o.material as THREE.Material).depthWrite = false;
    });

    gridLine.children.forEach((child) => {
      child.name === 'collisionObj' && (collisionObj3D = child);
    });

    backgroundGridLine = gridLine;

    scene.add(gridLine);
  };

  const initTrackballControls = () => {
    if (controls) {
      controls.dispose();
    }
    controls = new TrackballControls(camera, renderer.domElement);
    Object.assign(controls, {
      rotateSpeed: 3.0,
      zoomSpeed: 1.2,
      panSpeed: 0.8,
      noZoom: false,
      noPan: false,
      staticMoving: true,
      dynamicDampingFactor: 0.3,
      keys: [65, 83, 68],
      minDistance: TRACKBALL_CONTROLS_MIN_DISTANCE,
      maxDistance: TRACKBALL_CONTROLS_MAX_DISTANCE,
    });

    const vector3 = props.printingVersion === 'MOOZ-3'
      ? new THREE.Vector3(0, 0, workSize.height / 2)
      : new THREE.Vector3(workSize.width / 2, workSize.width / 2, workSize.height / 2);
    controls.target.copy(vector3);

    controls.update();
    let shouldAnimate = false;
    const animate = () => {
      controls.update();
      updateScene();
      if (shouldAnimate) {
        requestAnimationFrame(animate);
      }
    };

    controls.addEventListener('start', () => {
      shouldAnimate = true;
      animate();
    });
    controls.addEventListener('end', () => {
      shouldAnimate = false;
      updateScene();
    });
  };

  const createScene = () => {
    if (!node.current) {
      return;
    }
    const width = getVisibleWidth();
    const height = getVisibleHeight();
    scene = new THREE.Scene();
    createPerspectiveCamera(width, height);
    initRender(width, height);
    addLight();
    updateScene();
  };

  const removeMaterial = (mt: THREE.Object3D) => {
    mt.traverse((obj: THREE.Object3D) => {
      if (obj.type === 'Mesh') {
        (obj as THREE.Mesh).geometry.dispose();
        ((obj as THREE.Mesh).material as THREE.Material).dispose();
      }
    });
    scene.remove(mt);
  };

  const resetCamera = () => {
    if (!camera) {
      return;
    }
    const vector3 = props.printingVersion === 'MOOZ-3'
      ? new THREE.Vector3(0, -2 * workSize.width, workSize.height * 2 / 3)
      : new THREE.Vector3(workSize.width / 2, -2 * workSize.width, workSize.height * 2 / 3);
    camera.position.copy(vector3);
    camera.up.set(0, 0, 1);
  };

  const catchIntersectsObj3D = (e: any) => {
    const mouse = new THREE.Vector2();
    mouse.x = (e.offsetX / node.current!.offsetWidth) * 2 - 1;
    mouse.y = -(e.offsetY / node.current!.offsetHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const objects = getSceneMeshByNames(scene, ['ModelObj'], []);
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
      if (e.type === 'contextmenu') {
        controls.enabled = false;
        setShowMenu(true);
        setMenuPosition({
          left: e.offsetX,
          top: e.offsetY
        });
      }
    } else {
      controls.enabled = true;
      setShowMenu(false);
    }
    return true;
  };

  const filterRotateMatrix = (matrix: any) => {
    const newMatrix = new THREE.Matrix3();
    newMatrix.getNormalMatrix(matrix);
    const normalMatrix = new THREE.Matrix3();
    normalMatrix.getInverse(newMatrix);
    const matrix3: number[] = normalMatrix.elements;
    const matrix3Arr: number[][] = [[]];
    matrix3.forEach((item: number) => {
      if (matrix3Arr[matrix3Arr.length - 1].length >= 3) {
        matrix3Arr.push([]);
      }
      matrix3Arr[matrix3Arr.length - 1].push(item);
    });
    return JSON.stringify(matrix3Arr);
  };

  const getModelSize = () => {
    const bbox = new THREE.Box3();
    bbox.expandByObject(ModelObject);
    const widthX = new THREE.Vector3(bbox.max.x, 0, 0).distanceTo(new THREE.Vector3(bbox.min.x, 0, 0));
    const widthY = new THREE.Vector3(bbox.max.y, 0, 0).distanceTo(new THREE.Vector3(bbox.min.y, 0, 0));
    const height = new THREE.Vector3(bbox.max.z, 0, 0).distanceTo(new THREE.Vector3(bbox.min.z, 0, 0));
    return {
      widthX,
      widthY,
      height
    };
  };

  const updateOrgModelSize = () => {
    const size = getModelSize();
    if (!isEqual(size, props.model3Dsize.orgModelSize)) {
      props.updateModel3Dsize({
        orgModelSize: {
          widthX: Math.floor(size.widthX),
          widthY: Math.floor(size.widthY),
          height: Math.floor(size.height)
        }
      });
    }
  };

  const updateModelSize = () => {
    const size = getModelSize();
    if (!isEqual(size, props.model3Dsize.modelSize)) {
      props.updateModel3Dsize({
        modelSize: {
          widthX: Math.floor(size.widthX),
          widthY: Math.floor(size.widthY),
          height: Math.floor(size.height)
        }
      });
    }
  };


  const updateModelMove = () => {
    const { position } = ModelObject;
    const moveX = props.printingVersion === 'MOOZ-3' ? position.x : position.x - workSize.width / 2;
    const moveY = props.printingVersion === 'MOOZ-3' ? position.y : position.y - workSize.width / 2;
    const data = {
      moveX: changeDecimal(moveX, 3),
      moveY: changeDecimal(moveY, 3),
    };
    props.updateModel3Ddata(data);
    updateModelSize();
  };


  const updateModelScale = () => {
    const { scale, matrix } = ModelObject;
    const data = {
      scaleX: changeDecimal(scale.x, 3),
      scaleY: changeDecimal(scale.y, 3),
      scaleZ: changeDecimal(scale.z, 3),
      rotateMatrix: filterRotateMatrix(matrix)
    };
    props.updateModel3Ddata(data);
    updateModelSize();
  };


  const updateModelRotation = () => {
    const { rotation, matrix } = ModelObject;
    const data = {
      rotateX: changeDecimal(rotation.x, 3),
      rotateY: changeDecimal(rotation.y, 3),
      rotateZ: changeDecimal(rotation.z, 3),
      rotateMatrix: filterRotateMatrix(matrix)
    };
    props.updateModel3Ddata(data);
    updateModelSize();
  };

  const updateModelMatrix = () => {
    props.updateModel3Ddata({
      rotateMatrix: filterRotateMatrix(ModelObject.matrix)
    });
  };

  const updateModel3Ddata = (allUpdate?: boolean) => {
    const UPDATE_WITH_PATTERN: { [index: string]: () => void } = {
      'MOVE': updateModelMove,
      'ROTATE': updateModelRotation,
      'SCALE': updateModelScale
    };
    if (allUpdate) {
      updateModelMove();
      updateModelRotation();
      updateModelScale();
    } else {
      UPDATE_WITH_PATTERN[props.controlPattern]();
    }
  };

  const calculateCylinderCollision = () => {
    const arc = new THREE.ArcCurve(0, 0, workSize.width / 2, 0, 2 * Math.PI, true);
    const points = arc.getPoints(500);
    let isContain = true;
    if (Math.abs(ModelObject.position.x) > workSize.width / 2 || Math.abs(ModelObject.position.y) > workSize.width / 2) {
      isContain = false;
    } else {
      points.forEach(vector2 => {
        const startVector = new Vector3(vector2.x, vector2.y, 0);
        const endVector = new Vector3(vector2.x, vector2.y, 1);
        const dir = new Vector3();
        dir.subVectors(endVector, startVector);
        const raycaster = new THREE.Raycaster(startVector, dir.clone().normalize());
        const intersects = raycaster.intersectObject(ModelObject);
        if (intersects.length > 0) {
          isContain = false;
        }
      });
    }

    props.updateModelDection(isContain);
    changeModelMaterialColor(isContain);
  };


  const changeModelMaterialColor = (detection: boolean) => {
    if (ModelObject) {
      (ModelObject.material as THREE.MeshPhongMaterial).color = detection ? new THREE.Color('#2AA5DC') : new THREE.Color('#5F5F5F');
      updateScene();
    }
  };


  const collisionDetection = async () => {
    const collisionBox = new THREE.Box3();
    collisionBox.expandByObject(collisionObj3D);
    const objBox = new THREE.Box3();
    objBox.expandByObject(ModelObject);
    if (props.printingVersion === 'MOOZ-3') {
      calculateCylinderCollision();
    } else {
      const iscontain = collisionBox.containsBox(objBox);
      props.updateModelDection(iscontain);
      changeModelMaterialColor(iscontain);
    }
  };

  const transfromEndUpdateData = () => {
    setDisplayPrompt(false);
    controls.enabled = true;
    controls.update();
    if (ModelObject) {
      initModelZpos();
    }
    updateModel3Ddata();
    updateScene();
  };

  const transfromChange = throttle((params) => {
    if (params.value.mode === 'rotate' && /^(x|y|z|X|Y|Z){1}$/.test(params.value.axis)) {
      setDisplayPrompt(true);
      const { rotation } = ModelObject;
      const angle = Math.round(THREE.Math.radToDeg(rotation[params.value.axis]));
      setRotatePrompt(`${angle}°`);
    }
  }, 800);

  const initTransformControls = (mesh: THREE.Mesh) => {
    if (transformControls) {
      transformControls.detach();
    }
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('change', () => {
      updateScene();
    });
    transformControls.addEventListener('dragging-changed', () => {
      controls.enabled = false;
    });
    transformControls.setSize(0.5);
    transformControls.showZ = false;
    transformControls.attach(mesh);
    transformControls.setMode('translate');
    transformControls.rotationSnap = THREE.Math.degToRad(15);
    controls.update();
    scene.add(transformControls);
  };

  const changeControlPattern = () => {
    const { controlPattern } = props;
    transformControls.showZ = !(controlPattern === 'MOVE');
    transformControls.setMode(CONTROL_PATTERN[controlPattern]);
    updateScene();
  };

  const loadModel = () => {
    const modelPath = props.file.path;
    if (!modelPath || !isElectron()) {
      return;
    }
    modelLoadWorker.postMessage({ modelPath: props.file.path });
    modelLoadWorker.onmessage = (e: any) => {
      const { type } = e.data;
      const callback: { [index: string]: () => void } = {
        'LOAD_MODEL_POSITIONS': () => {
          const { positions } = e.data;
          const geometry = new THREE.BufferGeometry();
          const positionAttribute = new THREE.BufferAttribute(positions, 3);
          geometry.addAttribute('position', positionAttribute);
          geometry.center();
          geometry.computeVertexNormals();
          const material = new THREE.MeshPhongMaterial({ color: 0x2AA5DC, specular: 0x111111, shininess: 100, side: THREE.DoubleSide });
          ModelObject = new THREE.Mesh(geometry, material);
          ModelObject.name = 'ModelObj';
          ModelObject.castShadow = true;
          ModelObject.receiveShadow = true;
          const bbox = new THREE.Box3();
          bbox.expandByObject(ModelObject);
          const vector3 = props.printingVersion === 'MOOZ-3'
            ? new THREE.Vector3(0, 0, Math.ceil((bbox.max.z - bbox.min.z) / 2))
            : new THREE.Vector3(workSize.width / 2, workSize.width / 2, Math.ceil((bbox.max.z - bbox.min.z) / 2));
          ModelObject.position.copy(vector3);
          scene.add(ModelObject);
          initTransformControls(ModelObject);

          //更新模型数据
          updateOrgModelSize();
          updateModelSize();
          updateModel3Ddata(true);

          collisionDetection();
          updateScene();
        },
        'LOAD_MODEL_PROGRESS': () => {
          const { progress } = e.data;
          const prg = Math.ceil(progress.loaded / progress.total) * 100;
        }
      };
      callback[type as string]!();
    };
  };

  const deleteModel = () => {
    removeMaterial(ModelObject);
    transformControls.detach();
    props.updatePrintingFile({
      name: '',
      size: 0,
      type: '',
      path: ''
    });
    updateModelDection(false);
    updateScene();
  };

  const alignCenter = () => {
    ModelObject.position.x = props.printingVersion === 'MOOZ-3' ? 0 : workSize.width / 2;
    ModelObject.position.y = props.printingVersion === 'MOOZ-3' ? 0 : workSize.width / 2;
    updateModel3Ddata();
    collisionDetection();
    updateScene();
  };

  const clickMenu = (key: string) => {
    const menuOperations: { [index: number]: () => void } = {
      0: deleteModel,
      3: alignCenter,
    };
    menuOperations[key]();
    setShowMenu(false);
  };

  const resizeRenderer = throttle(() => {
    if (!(camera && renderer)) {
      return;
    }
    const width = getVisibleWidth();
    const height = getVisibleHeight();
    camera.aspect = width / height;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    controls.handleResize();
    renderer.setSize(width, height);
    updateScene();
  }, 100);

  useEffect(() => {
    createScene();
    window.addEventListener('resize', resizeRenderer);
    return () => {
      window.removeEventListener('resize', resizeRenderer);
    };
  }, []);

  useEffect(() => {
    backgroundGridLine && removeMaterial(backgroundGridLine as THREE.Object3D);
    updateWorkArea();
    resetCamera();
    initTrackballControls();
    if (ModelObject) {
      alignCenter();
    }
    updateScene();
  }, [props.printingVersion]);

  useEffect(() => {
    if (props.location.pathname === '/printing') {
      node.current!.appendChild(renderer.domElement);
      renderer.domElement.addEventListener('contextmenu', catchIntersectsObj3D);
      renderer.domElement.addEventListener('mousedown', catchIntersectsObj3D);
      initTrackballControls();
      ModelObject && initTransformControls(ModelObject);
    }
    return () => {
      renderer.domElement.removeEventListener('contextmenu', catchIntersectsObj3D);
      renderer.domElement.removeEventListener('mousedown', catchIntersectsObj3D);
    };
  }, [props.location.pathname]);

  useEffect(() => {
    ModelObject && removeMaterial(ModelObject);
    loadModel();
  }, [props.file.path]);

  useEffect(() => {
    transformControls && changeControlPattern();
  }, [props.controlPattern]);


  useEffect(() => {
    controls.reset();
    const vector3 = props.printingVersion === 'MOOZ-3'
      ? new THREE.Vector3(0, 0, workSize.height / 2)
      : new THREE.Vector3(workSize.width / 2, workSize.width / 2, workSize.height / 2);
    controls.target.copy(vector3);
    updateCameraLookAt(props.cameraPosition[0], camera, workSize, {
      x: props.printingVersion === 'MOOZ-3' ? -workSize.width / 2 : 0,
      y: props.printingVersion === 'MOOZ-3' ? -workSize.width / 2 : 0
    });
    controls.update();
    updateScene();
  }, [props.cameraPosition]);

  useEffect(() => {
    updateZoom(controls, props.zoom - currentZoom);
    currentZoom = props.zoom;
    updateScene();
  }, [props.zoom]);

  useEffect(() => {
    const { moveX, moveY } = props.model3Ddata;
    if (!ModelObject) {
      return;
    }
    const posX = props.printingVersion === 'MOOZ-3' ? moveX : moveX + workSize.width / 2;
    const posY = props.printingVersion === 'MOOZ-3' ? moveY : moveY + workSize.width / 2;
    ModelObject.position.x = posX;
    ModelObject.position.y = posY;
    collisionDetection();
    updateScene();
  }, [props.model3Ddata.moveX, props.model3Ddata.moveY]);

  useEffect(() => {
    const { scaleX, scaleY, scaleZ } = props.model3Ddata;
    if (!ModelObject) {
      return;
    }
    ModelObject.scale.set(scaleX, scaleY, scaleZ);
    initModelZpos();
    updateModelSize();
    updateModelMatrix();
    collisionDetection();
    updateScene();
  }, [props.model3Ddata.scaleX, props.model3Ddata.scaleY, props.model3Ddata.scaleZ]);


  useEffect(() => {
    const { rotateX, rotateY, rotateZ } = props.model3Ddata;
    if (!ModelObject) {
      return;
    }
    ModelObject.rotation.set(rotateX, rotateY, rotateZ);
    initModelZpos();
    updateModelSize();
    updateModelMatrix();
    collisionDetection();
    updateScene();
  }, [props.model3Ddata.rotateX, props.model3Ddata.rotateY, props.model3Ddata.rotateZ]);


  useEffect(() => {
    if (transformControls) {
      transformControls.addEventListener('objectChange', transfromChange);
      transformControls.addEventListener('mouseUp', transfromEndUpdateData);
    }
    return () => {
      if (transformControls) {
        transformControls.removeEventListener('objectChange', transfromChange);
        transformControls.removeEventListener('mouseUp', transfromEndUpdateData);
      }
    };
  });

  useEffect(() => {
    controls.handleResize();
  }, [props.style.display]);

  useEffect(() => {
    if (transformControls) {
      transformControls.rotationSnap = props.isometricRotation ? THREE.Math.degToRad(15) : null;
    }
  }, [props.isometricRotation]);

  return (
    <div style={{ position: 'relative', display: props.style.display }}>
      <div
        style={{
          visibility: show ? 'visible' : 'hidden'
        }}
        ref={node}
      />
      <ContextMenu
        isShow={showMenu} position={menuPosition}
        clickMenu={clickMenu}
        hideKey={['1', '2', '4']}
      />
      <FollowMousePrompt text={rotatePrompt} display={promptDisplay} />
    </div>
  );
};

export default PrintingVisualizer;
