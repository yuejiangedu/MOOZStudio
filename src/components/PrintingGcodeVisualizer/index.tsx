import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import colornames from 'colornames';
import _each from 'lodash/each';
import throttle from 'lodash/throttle';
import * as History from 'history';
import { CONTAINER_MARGIN, NAVBAR_HEIGHT, RIGHT_SIDER_WIDTH, LEFT_SIDER_WIDTH } from '../../constants';
import CubeGridLine from '../PrintingVisualizer/CubeGridLine';
import CyclinderGridLine from '../PrintingVisualizer/CyclinderGridLine';
import TrackballControls from '../../lib/three/TrackballControls';
import { PRINT3D_UNIFORMS, PRINT3D_VERT_SHADER, PRINT3D_FRAG_SHADER } from '../../lib/gcode/ShaderMaterial/print3d-shader-meterial';
import { updateZoom } from '../../lib/three-model/units';
import { useCombinedCamera } from '../../lib/hooks/useCombinedCamera';

const Gcode2Model3Dworker = require('worker-loader!../../lib/worker/gcode2Model3Dworker');
interface Iprops {
  show: boolean;
  location: History.Location;
  printingVersion: string;
  gcode: string;
  style: { display: string };
  gcodeLineList: Array<{
    label: string;
    value: boolean;
    color: Array<number>;
    typeCode: number;
    visible: string;
  }>;
  clippingHeight: number;
  creatingGcodeModel: (prg: number) => void;
  zoom: number;
  cameraPosition: string[];
}
const PERSPECTIVE_FOV = 45;
const PERSPECTIVE_NEAR = 0.1;
const PERSPECTIVE_FAR = 2500;
const METRIC_GRID_SPACING = 10; // 10 mm
const TRACKBALL_CONTROLS_MIN_DISTANCE = 1;
const TRACKBALL_CONTROLS_MAX_DISTANCE = 2000;
const workAreaSize: { [index: string]: { width: number; height: number } } = {
  'MOOZ-1-2': {
    width: 130,
    height: 130
  },
  'MOOZ-2 PLUS': {
    width: 200,
    height: 190
  },
  'MOOZ-3': {
    width: 100,
    height: 100
  },
};
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let controls: TrackballControls;
let backgroundGridLine: THREE.Group;
const gcodeModel = new THREE.Group();
let maxLayerIndex: number;
let currentZoom = 1;

const { updateCameraLookAt } = useCombinedCamera();
const PrintingGcodeVisualizer = (props: Iprops) => {
  const { show } = props;
  const node = useRef<HTMLDivElement>(null);
  const workSize = workAreaSize[props.printingVersion];

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
        longitude: 40,
        latitude: 40,
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
        color: colornames('gray 44')!
      });
    }

    _each(gridLine.children, (o: THREE.Line) => {
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

    backgroundGridLine = gridLine;

    scene.add(gridLine);
  };

  const updateScene = () => {
    renderer.render(scene, camera);
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

    const vector3 = props.printingVersion === 'MOOZ-3' ?
      new THREE.Vector3(0, 0, workSize.height / 2) :
      new THREE.Vector3(workSize.width / 2, workSize.width / 2, workSize.height / 2)
    controls.target.copy(vector3)

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
    });
  };

  const createScene = () => {
    if (!node.current) {
      return;
    }
    const width = getVisibleWidth();
    const height = getVisibleHeight();
    scene = new THREE.Scene();
    //创建透视相机
    createPerspectiveCamera(width, height);
    //初始化渲染器
    initRender(width, height);
    // 添加光源
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
    const vector3 = props.printingVersion === 'MOOZ-3' ?
      new THREE.Vector3(0, -2 * workSize.width, workSize.height * 2 / 3) :
      new THREE.Vector3(workSize.width / 2, -2 * workSize.width, workSize.height * 2 / 3)
    camera.position.copy(vector3)
    camera.up.set(0, 0, 1);
  };

  const loadGcodeLine = (e: any) => {
    const { vertices, colors, typeCodes, layerIndex } = e.data;

    maxLayerIndex = layerIndex[layerIndex.length - 1];
    PRINT3D_UNIFORMS.u_visible_layer_count.value = maxLayerIndex;

    const bufferGeometry = new THREE.BufferGeometry();
    const positonAttribute = new THREE.Float32BufferAttribute(vertices, 3);
    const colorAttribute = new THREE.Uint8BufferAttribute(colors, 3);
    colorAttribute.normalized = true;
    const layerIndexAttribute = new THREE.Float32BufferAttribute(layerIndex, 1);
    const typeCodesAttribute = new THREE.Float32BufferAttribute(typeCodes, 1);

    bufferGeometry.addAttribute('position', positonAttribute);
    bufferGeometry.addAttribute('a_color', colorAttribute);
    bufferGeometry.addAttribute('a_layer_index', layerIndexAttribute);
    bufferGeometry.addAttribute('a_type_code', typeCodesAttribute);

    const workpiece = new THREE.Line(
      bufferGeometry,
      new THREE.ShaderMaterial({
        uniforms: PRINT3D_UNIFORMS,
        vertexShader: PRINT3D_VERT_SHADER,
        fragmentShader: PRINT3D_FRAG_SHADER,
        side: THREE.DoubleSide,
        transparent: true,
        wireframeLinewidth: 5
      })
    );
    gcodeModel.add(workpiece);
  };

  const updateProgress = (e: any) => {
    const { progress } = e.data;
    props.creatingGcodeModel(progress);
    if (progress === 1) {
      scene.add(gcodeModel);
      updateScene();
    }
  };

  const loadGcodeModal = () => {
    return new Promise((resolve) => {
      const worker = new Gcode2Model3Dworker();
      worker.postMessage({ gcode: props.gcode, lineList: props.gcodeLineList, type: 'LOAD_PRINTING_MODEL' });
      worker.onmessage = (e: any) => {
        const { type } = e.data;
        const callback: { [index: string]: (e: any) => void } = {
          'LOAD_GCODE_LINE': () => loadGcodeLine(e),
          'LOAD_GCODE_PROGRESS': () => updateProgress(e)
        };
        callback[type](e);
        resolve(1);
      };
    });
  };

  const setVisibilityLayer = () => {
    const lineObj3D = gcodeModel.children[0];
    if (!lineObj3D) {
      return;
    }

    props.gcodeLineList.forEach(item => {
      ((lineObj3D as THREE.Line).material as THREE.ShaderMaterial).uniforms[item.visible].value = item.value ? 1 : 0;
    });

    ((lineObj3D as THREE.Line).material as THREE.ShaderMaterial).uniforms.u_visible_layer_count.value = Math.ceil(props.clippingHeight * maxLayerIndex / 100);

    updateScene();
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
    node.current!.appendChild(renderer.domElement);
    initTrackballControls();
    window.addEventListener('resize', resizeRenderer);
    return () => {
      window.removeEventListener('resize', resizeRenderer);
    }
  }, []);

  useEffect(() => {
    backgroundGridLine && removeMaterial(backgroundGridLine as THREE.Object3D);
    updateWorkArea();
    resetCamera();
    initTrackballControls();
    updateScene();
  }, [props.printingVersion]);

  useEffect(() => {
    if (props.gcode) {
      if (gcodeModel.children.length !== 0) {
        gcodeModel.remove(gcodeModel.children[0]);
      }
      loadGcodeModal();
    }
  }, [props.gcode]);

  useEffect(() => {
    if (props.style.display === 'block') {
      node.current!.appendChild(renderer.domElement);
      initTrackballControls();
    }
  }, [props.style.display]);

  useEffect(() => {
    if (gcodeModel) {
      setVisibilityLayer();
    }
  }, [props.gcodeLineList, props.clippingHeight]);

  useEffect(() => {
    controls.reset();
    const vector3 = props.printingVersion === 'MOOZ-3' ?
      new THREE.Vector3(0, 0, workSize.height / 2) :
      new THREE.Vector3(workSize.width / 2, workSize.width / 2, workSize.height / 2)
    controls.target.copy(vector3)
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
    controls.handleResize();
  }, [props.style.display])

  return (
    <div style={{ position: 'relative', display: props.style.display }}>
      <div
        style={{
          visibility: show ? 'visible' : 'hidden'
        }}
        ref={node}
      />
    </div>
  );
};

export default PrintingGcodeVisualizer;
