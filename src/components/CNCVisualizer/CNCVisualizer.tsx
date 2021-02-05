import React, { useReducer, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import ContextMenu from '../ContextMenu/ContextMenu';
import { useDispatch, useSelector } from 'react-redux'
import { IrootState } from '../../rootRedux'
import { initState as settingState } from '../../containers/Settings/reducers'
import { ICncState } from '../../containers/CNC/types'
import { setCNCFileInfo, updateCncText, updatePlane, setCncGenerate } from '../../containers/CNC/actions'
import _cloneDeep from 'lodash/cloneDeep';
import _throttle from 'lodash/throttle';
import TrackballControls from '../../lib/three/TrackballControls';
import { useCoordinateRender } from '../../lib/hooks/useCoordinateRender'
import { useCombinedCamera } from '../../lib/hooks/useCombinedCamera'
import { useTrackballControls } from '../../lib/hooks/useTrackballControls'
import { useTransformHelper } from '../../lib/hooks/useTransformHelper'
import { use3DRenderer, useLight } from '../../lib/hooks/useThree'
import { useSubscribe, useUnsubscribe } from '../../lib/hooks/usePubSub'
import { getSceneMeshByNames } from './units';
import ProcessImage from '../../lib/processBeauty';
import { useLocation } from 'react-router'
import Snap from 'snapsvg';
import {
  CONTAINER_MARGIN,
  NAVBAR_HEIGHT,
  WORKSPACE_HEADERTOOL_HEIGHT,
  FONTSIZE,
  RIGHT_SIDER_WIDTH,
  LEFT_SIDER_WIDTH
} from '../../constants';
import * as THREE from 'three'
import { mm2px, px2mm } from '../../lib/units';

import {
  PERSPECTIVE_FOV,
  PERSPECTIVE_NEAR,
  PERSPECTIVE_FAR,
  CAMERA_DISTANCE,
} from './constants'

const initState = {
  // Three.js
  renderer: null,
  scene: null,
  camera: null,
  controls: null,
  viewport: null,
  cuttingTool: null,
  cuttingPointer: null,
  limits: null,
  visualizer: null,
  planeObj: null,
  text: [],
  textEdges: [],
  metricCoordinateSystem: null,
  metricGridLineNumbers: null,
  image: null,
  planeData: {},
  showMenu: false,
  handleTarget: null,
  menuPosition: { top: 0, left: 0 },
  workArea: null
}

const reducer = (state: any, action: { type: string, value: any }) => {
  if (action.type in state) {
    return { ...state, [action.type]: action.value }
  } else {
    return { ...state }
  }
}

interface Iprops {
  show: boolean
}

const CNCVisualizer = (props: Iprops, ref: any) => {
  const { moozVersion } = useSelector<IrootState, typeof settingState>(state => state.settingReducers);
  const { cncFileInfo, plane, cameraPosition } = useSelector<IrootState, ICncState>(state => state.CNCReducers);
  const dispatch = useDispatch();
  const [state, setState] = useReducer(reducer, initState)
  const node: any = useRef();
  const location = useLocation();
  const { createRenderer } = use3DRenderer()
  const { renderCoord, clearCoord } = useCoordinateRender(state.scene, {
    GRID_COUNT: moozVersion / 10
  });
  const {
    updateCameraLookAt
  } = useCombinedCamera()
  const {
    setControlsZoom,
    createTrackballControls,
    resetControl
  } = useTrackballControls(state.camera, state.renderer)

  const { addLight } = useLight(state.scene);
  const unsubscribe = useUnsubscribe();
  const subscribe = useSubscribe();

  useImperativeHandle(ref, () => ({
    getBeautyRgbaPixel,
    zoomIn,
    zoomOut
  }))

  const onTransfer = (_object: any) => {
    const { controls } = state;
    controls.enabled = false;
    toggleTextEdges(false, _object);
    setState({ type: 'showMenu', value: false });
  }
  const onTransferEnd = (_object: any) => {
    const { controls } = state;
    controls.enabled = true;
    toggleTextEdges(true, _object);
    savePlaneData();
    updateTextInfo();
    collisionDetection()
  }

  const transformHelper = useTransformHelper(
    state.scene,
    state.camera,
    state.renderer,
    onTransfer,
    onTransferEnd
  )

  const updateScene = () => {
    const { scene, camera, renderer } = state
    if (scene && camera && renderer) {
      renderer.render(scene, camera)
    };
  }

  const savePlaneData = () => {
    const { planeObj } = state
    if (planeObj) {
      setTimeout(() => {
        const { x, y } = planeObj.position;
        const scaleX = planeObj.scale.x;
        const scaleY = planeObj.scale.y;
        const rotateZ = planeObj.rotation.z;
        const rotate = rotateZ * 180 / Math.PI;
        const angle = rotate > 0 ? 360 - rotate : Math.abs(rotate);
        dispatch(updatePlane({ x, y, scaleX, scaleY, angle, rotateZ }));
      }, 100);
    }
  }

  const createScene = () => {
    if (state.scene) {
      return;
    }
    const width = getVisibleWidth();
    const height = getVisibleHeight();
    setState({ type: 'renderer', value: createRenderer(width, height) });
  }

  /**
   * 更新文字信息，用于代码转换
   */

  const updateTextInfo = () => {
    const newText = state.text.map((item: any) => {
      const rotate = item.rotation.z * 180 / Math.PI;
      const angle = rotate > 0 ? 360 - rotate : Math.abs(rotate);
      return {
        textType: item.textType,
        text: item.text,
        width: mm2px(item.width),
        height: mm2px(item.height),
        active: item.active,
        scale: { x: item.scale.x, y: item.scale.y },
        position: { x: item.position.x, y: item.position.y },
        rotationZ: item.rotation.z,
        angle,
        scaleX: item.scale.x,
        scaleY: item.scale.y,
        x: item.position.x,
        y: item.position.y,
        name: 'text'
      };
    });
    dispatch(updateCncText(_cloneDeep(newText)))
  }

  /**
   * 移除文本的边框
   * @param text 
   */
  const removeTextEdges = (text: string) => {
    const { textEdges, scene } = state;
    if (textEdges.length !== 0) {
      for (let index = textEdges.length - 1; index >= 0; index--) {
        const edges = textEdges[index];
        if (edges.text === text) {
          scene.remove(edges);
          textEdges.splice(index, 1);
          setState({ type: 'textEdges', value: [...textEdges] });
        }
      }
    }
  }

  const removeText = () => {
    const { text } = state
    for (let index = 0; index < text.length; index++) {
      const item = text[index];
      if (item.active) {
        text.splice(index);
        setState({ type: 'text', value: [...text] });
      }
    }
  }

  const removeMaterial = (matrerial?: THREE.Object3D) => {
    const { handleTarget, scene } = state;
    const removeTarget = matrerial || handleTarget;
    removeTarget.traverse((obj: THREE.Object3D) => {
      if (obj.type === 'Mesh') {
        (obj as THREE.Mesh).geometry.dispose();
        ((obj as THREE.Mesh).material as THREE.Material).dispose();
      }
    });
    scene.remove(removeTarget);
    if (removeTarget.name === 'plane') {
      setState({ type: 'planeObj', value: null });
    } else {
      removeText();
      removeTextEdges(removeTarget.text);
    }
    setState({ type: 'handleTarget', value: null })
  }

  const deleteTarget = () => {
    const { handleTarget } = state;
    removeMaterial();
    dispatch(updateCncText(filterText()));
    if (handleTarget.name === 'plane') {
      dispatch(setCNCFileInfo({
        url: '',
        name: '',
        size: 0,
        type: '',
        originUrl: ''
      }))
      dispatch(updatePlane({ active: false }))
      savePlaneData();
      updateTextInfo();
    }
  }

  const delekeydown = (event: KeyboardEvent) => {
    if (event.keyCode === 46 && state.handleTarget) {
      deleteTarget();
      setState({ type: 'showMenu', value: false });
    }
  }

  const getVisibleWidth = () => {
    const currentClientWidth = document.documentElement.clientWidth;
    const visibleWidth = (
      currentClientWidth - RIGHT_SIDER_WIDTH - LEFT_SIDER_WIDTH - 2 * CONTAINER_MARGIN
    );
    return visibleWidth;
  }

  const getVisibleHeight = () => {
    const clientHeight = document.documentElement.clientHeight;
    const visibleHeight = (
      clientHeight - NAVBAR_HEIGHT - 2 * CONTAINER_MARGIN - WORKSPACE_HEADERTOOL_HEIGHT
    );
    return visibleHeight;
  }

  const filterText = () => {
    const newText = state.text.map((item: any) => {
      const rotate = item.rotation.z * 180 / Math.PI;
      const angle = rotate > 0 ? 360 - rotate : Math.abs(rotate);
      return {
        textType: item.textType,
        text: item.text,
        width: mm2px(item.width),
        height: mm2px(item.height),
        active: item.active,
        scale: { x: item.scale.x, y: item.scale.y },
        position: { x: item.position.x, y: item.position.y },
        rotationZ: item.rotation.z,
        angle,
        scaleX: item.scale.x,
        scaleY: item.scale.y,
        x: item.position.x,
        y: item.position.y,
        name: 'text'
      };
    });
    return _cloneDeep(newText);
  }

  const resizeRenderer = _throttle(() => {
    const { controls, renderer, camera } = state
    if (!(camera && renderer)) {
      return;
    }
    const width = getVisibleWidth();
    const height = getVisibleHeight();

    if (width === 0 || height === 0) {
      console.log(`The width (${width}) and height (${height}) cannot be a zero value`);
    }

    (camera as THREE.PerspectiveCamera).aspect = width / height;
    camera.updateProjectionMatrix();
    controls && controls.handleResize();
    renderer.setSize(width, height);
    updateScene();
  }, 100);

  const setObjActive = (flag: boolean, obj?: any) => {
    state.scene.children.forEach((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && (child.name === 'text' || child.name === 'plane')) {
        (child as any).active = false;
      }
    });
    if (flag) {
      obj.active = true;
    }
    dispatch(updatePlane({ active: flag && obj.name === 'plane' }))
    dispatch(updateCncText(filterText()));
  }

  const initTrackballEvent = () => {
    const { controls } = state
    if (!controls) return;
    let shouldAnimate = false;
    const animate = () => {
      controls && controls.update();
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
      requestAnimationFrame(updateScene);
    });

    controls.addEventListener('change', () => {
      requestAnimationFrame(updateScene);
    });
  };

  const clickMenu = (key: string) => {
    const menuOperations = [
      deleteTarget,
      flipTarget,
      flipTarget,
      alignCenter,
      resetTarget
    ];
    menuOperations[key](key);
    setState({ type: 'showMenu', value: false });
    collisionDetection();
    updateScene();
  }

  const flipTarget = (key: string) => {
    const { handleTarget } = state;
    const { x, y } = handleTarget.scale;
    key === '1' ? handleTarget.scale.set(-x, y, 1) : handleTarget.scale.set(x, -y, 1);
    handleTarget.name === 'text' && updateTextEdges();
    transformHelper.update()
    savePlaneData();
    updateTextInfo();
  }

  const alignCenter = () => {
    const { handleTarget } = state;
    handleTarget.position.set(moozVersion / 2, moozVersion / 2, 0);
    handleTarget.name === 'text' && updateTextEdges();
    transformHelper.update();
    savePlaneData();
    updateTextInfo();
  }

  const resetTarget = () => {
    const { handleTarget, image } = state;
    if (handleTarget) {
      if (handleTarget.name === 'plane') {
        const opt = abjustBeautySize(image);
        handleTarget.position.set(opt.position[0], opt.position[1], 0);
        handleTarget.scale.set(opt.scale[0], opt.scale[1], 1);
      } else {
        handleTarget.position.set(handleTarget.width / 2, handleTarget.height / 2, 0);
        handleTarget.scale.set(1, 1, 1);
        updateTextEdges();
      }
      handleTarget.rotation.set(0, 0, 0);
      transformHelper.update();
      savePlaneData();
      updateTextInfo();
    }
  }

  const catchIntersectsObj = (e: any) => {
    const { camera, scene } = state
    const mouse = new THREE.Vector2();
    mouse.x = (e.offsetX / node.current.offsetWidth) * 2 - 1;
    mouse.y = -(e.offsetY / node.current.offsetHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const objects = getSceneMeshByNames(scene, [], ['workArea']);
    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
      const objs = intersects.filter((item: any) => (item.object.name === 'text' || item.object.name === 'plane'))
      if (objs.length > 0) {
        const intersectsObj = objs[0].object;
        setObjActive(true, intersectsObj);
        setState({
          type: 'handleTarget',
          value: intersectsObj
        });
      }
      if (e.type === 'contextmenu') {
        setState({ type: 'showMenu', value: true });
        setState({ type: 'menuPosition', value: { left: e.offsetX, top: e.offsetY } });
      }
    } else {
      setState({
        type: 'handleTarget',
        value: null
      });
      setState({ type: 'showMenu', value: false });
      setObjActive(false);
    }
    return true;
  }

  const abjustSvgSize = (fileUrl: string, defaultWidth: number) => {
    //调整svg的大小
    const domContainer = document.createElement('div');
    domContainer.innerHTML = fileUrl;
    const svgDom: any = domContainer.children[0];
    const snap = new Snap(svgDom);
    const svgWidth = svgDom.width.baseVal.valueAsString;
    const svgHeight = svgDom.height.baseVal.valueAsString;
    const defaultWidth2mm = Math.abs(mm2px(defaultWidth));
    snap.attr('width', defaultWidth2mm + 'px');
    if (svgHeight.includes('px') && svgWidth.includes('px')) {
      const proportion = defaultWidth2mm / parseFloat(svgWidth);
      const height = parseFloat(svgHeight) * proportion;
      snap.attr('height', Math.abs(height) + 'px');
    } else {
      snap.attr('height', defaultWidth2mm + 'px');
    }
    fileUrl = snap.outerSVG();
    setCNCFileInfo({ url: fileUrl });
    fileUrl = `data:image/svg+xml;base64,${window.btoa(
      unescape(encodeURIComponent(fileUrl)),
    )}`;
    return fileUrl;
  }

  const abjustBeautySize = (image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) => {
    const { defaultWidth } = plane;
    const { width, height } = image;
    const widthmm = px2mm(width);
    const heightmm = px2mm(height);
    const proportion = Number(defaultWidth) / widthmm;
    return {
      scale: [proportion, proportion],
      position: [Number(defaultWidth) / 2, proportion * heightmm / 2]
    };
  }

  const createPlane = (url: string) => {
    let { rotateZ, angle } = plane;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
      const { width, height } = texture.image;
      const widthmm = px2mm(width);
      const heightmm = px2mm(height);
      const geometry = new THREE.PlaneGeometry(widthmm, heightmm, 32, 2);
      const planeObj: any = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        map: texture,
        // metalness: 0.3,
        // roughness: 0.07,
        polygonOffset: true,
        polygonOffsetFactor: -10,
        polygonOffsetUnits: -10,
        transparent: true
      }));
      let position = [];
      let scale = [];
      setState({ type: 'image', value: texture.image })
      const opt = abjustBeautySize(texture.image);
      position = opt.position;
      scale = opt.scale;
      rotateZ = 0;
      angle = 0;
      dispatch(updatePlane({
        x: position[0],
        y: position[1],
        scaleX: scale[0],
        scaleY: scale[1],
        width,
        height,
        rotateZ,
        angle
      }));
      planeObj.position.set(position[0], position[1], 0);
      planeObj.scale.set(scale[0], scale[1], 1);
      planeObj.name = 'plane';
      planeObj.height = heightmm;
      planeObj.width = widthmm;
      planeObj.active = false;
      state.scene.add(planeObj);
      setObjActive(true, planeObj);
      setState({ type: 'planeObj', value: planeObj })
      setState({ type: 'handleTarget', value: planeObj })
      requestAnimationFrame(updateScene)
    });
  }

  const createWorkArea = () => {
    const { scene } = state
    // //创建检测区域
    const offset = 1;
    const workArea = new THREE.Mesh(new THREE.BoxGeometry(Number(moozVersion) + offset, Number(moozVersion) + offset, 3),
      new THREE.MeshBasicMaterial()
    );
    workArea.name = 'workArea'
    workArea.position.set(moozVersion / 2 - offset / 2, moozVersion / 2 - offset / 2, 0)
    workArea.visible = false
    scene.add(workArea);
    setState({ type: 'workArea', value: workArea })
    updateScene();
  }

  const invertBeauty = async () => {
    const { defaultWidth } = plane;
    const { type } = cncFileInfo;
    let beautyUrl = cncFileInfo.url as string;
    if (type !== 'svg') {
      const processImage = new ProcessImage(beautyUrl, type);
      beautyUrl = await processImage.process(0, { hasContract: true });
      dispatch(setCNCFileInfo({ url: beautyUrl }));
    } else {
      beautyUrl = abjustSvgSize(beautyUrl, defaultWidth as number);
    }
    state.planeObj && removeMaterial(state.planeObj);
    createPlane(beautyUrl);
  }

  const collisionDetection = () => {
    const { scene, workArea } = state
    const objects = getSceneMeshByNames(scene, ['plane', 'text']);
    let isContain = false
    if (objects.length !== 0) {
      isContain = objects.every((item) => {
        const targetBox = new THREE.Box3().expandByObject(item);
        const cubeBox = new THREE.Box3().expandByObject(workArea)
        return cubeBox.containsBox(targetBox)
      })
    }
    dispatch(setCncGenerate(isContain));
    transformHelper.setLineColor(isContain ? '#1535f7' : '#ff0000')
  }

  const createText = (config: any, textArr: any[]) => {
    if (!config.text) {
      return;
    }
    const textLoader = new THREE.FontLoader();

    textLoader.load('./assets/Alibaba_Regular.json', (text) => {
      const gem = new THREE.TextGeometry(config.text, {
        size: FONTSIZE,
        height: 0.1,
        // weight: 'normal',
        font: text,
        // style: 'normal',
        curveSegments: 30,
        bevelEnabled: false,
      });
      gem.center();
      gem.computeBoundingBox();
      const meshColor = config.textType ? 0x000000 : 0xffffff;
      const textOpacity = config.textType ? 1 : 0.3;
      const mat = new THREE.MeshStandardMaterial({
        color: meshColor,
        metalness: 0.2,
        roughness: 0.07,
        polygonOffset: true,
        transparent: true,
        // needsUpdate: true,
        opacity: textOpacity,
        polygonOffsetFactor: -20,
        polygonOffsetUnits: -20
      });

      const textObj: any = new THREE.Mesh(gem, mat);
      textObj.castShadow = true;
      textObj.name = 'text';
      textObj.custom_id = `text_${textArr.length}`
      const height = gem.boundingBox.max.y - gem.boundingBox.min.y;
      const width = gem.boundingBox.max.x - gem.boundingBox.min.x;
      textObj.height = height;
      textObj.width = width;

      if (config.refresh) {
        textObj.position.set(config.position.x, config.position.y, 0);
      } else {
        textObj.position.set(width / 2, height / 2, 0);
      }
      textObj.rotation.set(0, 0, config.rotationZ);
      textObj.scale.set(config.scale.x, config.scale.y, 1);
      textObj.textType = config.textType;
      textObj.active = config.active;
      textObj.text = config.text;
      state.scene.add(textObj);
      setObjActive(true, textObj);
      setState({ type: 'text', value: [...textArr, textObj] })
      setState({ type: 'handleTarget', value: textObj })
      updateScene();
    });
  }

  const toggleTextEdges = (value: boolean, textObj: any) => {
    if (state.textEdges.length !== 0 && textObj) {
      state.textEdges.forEach((txtEdges: any) => {
        if (textObj.custom_id === txtEdges.custom_id) {
          txtEdges.visible = value;
          Object.assign(textObj.material.color, { r: 0, g: 0, b: 0 });
          textObj.material.opacity = value ? 0 : 1;
          txtEdges.position.set(textObj.position.x, textObj.position.y, 0);
          txtEdges.scale.set(textObj.scale.x, textObj.scale.y, 1);
          txtEdges.rotation.set(0, 0, textObj.rotation.z);
        }
      });
    }
  }

  const insertText = (txt: {
    text: string,
    x: number,
    y: number,
    scale: number,
    active: boolean,
    textType: string
  }) => {
    const config = {
      textType: txt.textType,
      text: txt.text,
      active: txt.active,
      scale: { x: 1, y: 1 },
      rotationZ: 0,
      refresh: false
    };
    createText(config, state.text);
  }

  const updateTextEdges = () => {
    const { textEdges, scene, text } = state
    if (textEdges.length !== 0) {
      textEdges.forEach((edges: any) => {
        scene.remove(edges);
      });
    }
    if (text.length !== 0) {
      const edges: any[] = []
      text.forEach((item: any) => {
        if (item.textType === 1) {
          return;
        }
        const edgesGty = new THREE.EdgesGeometry(item.geometry);
        const edge: any = new THREE.LineSegments(edgesGty, new THREE.LineBasicMaterial({ color: 0x000000 }));
        edge.position.set(item.position.x, item.position.y, 0);
        edge.scale.set(item.scale.x, item.scale.y, 1);
        edge.rotation.set(0, 0, item.rotation.z);
        edge.text = item.text;
        edge.custom_id = item.custom_id
        Object.assign(item.material.color, { r: 1, g: 1, b: 1 });
        item.material.opacity = 0.3;
        scene.add(edge);
        edges.push(edge);
      });
      setState({ type: 'textEdges', value: [...edges] })
      updateScene();
    }
  }

  const createPerspectiveCamera = (width: number, height: number) => {
    const fov = PERSPECTIVE_FOV;
    const aspect = (width > 0 && height > 0) ? Number(width) / Number(height) : 1;
    const near = PERSPECTIVE_NEAR;
    const far = PERSPECTIVE_FAR;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.x = moozVersion / 2;
    camera.position.y = moozVersion / 2;
    camera.position.z = CAMERA_DISTANCE;
    return camera;
  }

  const changeText = _throttle((txt) => {
    const { text, scene } = state
    for (let i = text.length - 1; i >= 0; i--) {
      const item = text[i];
      if (item.active) {
        item.geometry.dispose();
        item.material.dispose();
        scene.remove(item);
        const config = {
          textType: txt.textType,
          text: txt.text,
          active: item.active,
          scale: { x: item.scale.x, y: item.scale.y },
          position: { x: item.position.x, y: item.position.y },
          rotationZ: item.rotation.z,
          refresh: true
        };
        text.splice(i, 1);
        createText(config, text);
      }
    }
  }, 500)

  const zoomIn = () => {
    setControlsZoom(state.controls, -0.1)
    updateScene();
  }

  const zoomOut = () => {
    setControlsZoom(state.controls, 0.1)
    updateScene();
  }

  const getBeautyRgbaPixel = () => {
    return new Promise(() => {
      if (cncFileInfo.type === 'svg' || !state.planeObj) {
        dispatch(updatePlane({ rgba: [] }));
        return;
      }
      const { scaleX, scaleY, width, height } = plane;
      const realWidth = Number(width) * Math.abs(Number(scaleX));
      const realHeight = Number(height) * Math.abs(Number(scaleY));
      if (realWidth !== 0 && realHeight !== 0) {
        const cv = document.createElement('canvas');
        cv.width = Number(width);
        cv.height = Number(height);
        const ctx = (cv.getContext('2d') as CanvasRenderingContext2D);
        //翻转判断
        if (Number(scaleX) < 0) {
          ctx.translate(Number(width) / 2, 0);
          ctx.scale(-1, 1);
          ctx.translate(-Number(width) / 2, 0);
        }
        if (Number(scaleY) < 0) {
          ctx.translate(0, Number(height) / 2);
          ctx.scale(1, -1);
          ctx.translate(0, -Number(height) / 2);
        }
        ctx.drawImage(state.image, 0, 0, parseInt(String(width), 10), parseInt(String(height), 10));
        const rgba = ctx.getImageData(0, 0, parseInt(String(width), 10), parseInt(String(height), 10));
        dispatch(updatePlane({ rgba: [...rgba.data] }));
      }
    })
  }

  const changeObjState = (obj: { [index: string]: number }) => {
    const { scaleX, scaleY, x, y } = obj;
    const { defaultWidth } = plane;
    const { handleTarget } = state;
    if (handleTarget) {
      handleTarget.scale.set(scaleX, scaleY, 1);
      handleTarget.position.set(x, y, 0);
      if (
        cncFileInfo.type === 'svg' &&
        handleTarget.name === 'plane' &&
        cncFileInfo.url && defaultWidth
      ) {
        abjustSvgSize(cncFileInfo.url, defaultWidth * scaleX);
      }
      dispatch(updateCncText(filterText()));
      transformHelper.update();
      collisionDetection();
      savePlaneData()
      updateTextEdges();
      updateScene();
    }
  }

  const resetCameraLookAt = () => {
    const { camera, controls } = state
    if (!camera) return
    resetControl(controls, {
      x: Number(moozVersion) / 2,
      y: Number(moozVersion) / 2,
      z: 0
    });
    updateCameraLookAt(
      cameraPosition[0],
      camera as THREE.OrthographicCamera | THREE.PerspectiveCamera,
      { width: parseInt(moozVersion), height: parseInt(moozVersion) }
    );
    controls && controls.update();
    updateScene();
  }

  const isCNCPage = useMemo(() => {
    return location.pathname === '/cnc'
  }, [location.pathname])

  useEffect(() => {
    const objStateChange = subscribe('objStateChange', (msg: string, data: { [index: string]: number }) => {
      isCNCPage && changeObjState(data)
    })
    //文本变化
    const onChangeText = subscribe('changeText', (msg: string, data: any) => {
      isCNCPage && changeText(data)
    })
    //插入文本
    const onInsertText = subscribe('insertText', (msg: string, data: {
      text: string,
      x: number,
      y: number,
      scale: number,
      active: boolean,
      textType: string
    }) => {
      isCNCPage && insertText(data)
    })
    return () => {
      unsubscribe(objStateChange)
      unsubscribe(onChangeText)
      unsubscribe(onInsertText)
    }
  })

  useEffect(() => {
    transformHelper.setHandleTarget(state.handleTarget);
  }, [state.handleTarget])

  useEffect(() => {
    window.addEventListener('resize', resizeRenderer);
    return () => {
      window.removeEventListener('resize', resizeRenderer);
    }
  }, [state.camera, state.renderer, state.controls])


  useEffect(() => {
    if (node.current && location.pathname === '/cnc') {
      state.controls && state.controls.handleResize();
      createScene();
    }
  }, [location.pathname])

  useEffect(() => {
    clearCoord();
    renderCoord(() => {
      resetCameraLookAt()
      requestAnimationFrame(updateScene);
    });
  }, [moozVersion])

  useEffect(() => {
    if (state.scene) {
      renderCoord(() => {
        const { camera } = state
        updateCameraLookAt(
          cameraPosition[0],
          camera as THREE.OrthographicCamera | THREE.PerspectiveCamera,
          { width: parseInt(moozVersion), height: parseInt(moozVersion) }
        );
        const tbControls = createTrackballControls({
          target: new THREE.Vector3(
            parseInt(moozVersion) / 2,
            parseInt(moozVersion) / 2,
            0),
        }) as TrackballControls
        setState({ type: "controls", value: tbControls })
        createWorkArea();
        addLight();
        setTimeout(() => {
          requestAnimationFrame(updateScene)
        }, 100);
      });
    }
  }, [state.scene])

  useEffect(() => {
    if (cameraPosition[0] && state.camera) {
      resetCameraLookAt()
    }
  }, [cameraPosition])

  useEffect(() => {
    if (state.controls) {
      initTrackballEvent();
      state.controls.handleResize()
    }
  }, [state.controls])

  useEffect(() => {
    if (state.text.length !== 0) {
      updateTextInfo();
      updateTextEdges();
      collisionDetection();
    }
  }, [state.text])

  useEffect(() => {
    if (state.scene) {
      collisionDetection();
    }
  }, [state.planeObj])

  useEffect(() => {
    window.addEventListener('keydown', delekeydown);
    if (state.renderer) {
      state.renderer.domElement.addEventListener('contextmenu', catchIntersectsObj);
      state.renderer.domElement.addEventListener('mousedown', catchIntersectsObj);
    }

    return () => {
      window.removeEventListener('keydown', delekeydown);
      if (state.renderer) {
        state.renderer.domElement.removeEventListener('contextmenu', catchIntersectsObj);
        state.renderer.domElement.removeEventListener('mousedown', catchIntersectsObj);
      }
    }
  })



  useEffect(() => {
    const { renderer } = state;
    if (renderer) {
      node.current!.appendChild(renderer.domElement);
      const width = renderer.domElement.width;
      const height = renderer.domElement.height;
      const camera = createPerspectiveCamera(width, height)
      setState({
        type: 'scene',
        value: new THREE.Scene()
      })

      setState({
        type: 'camera',
        value: camera
      })
    }
  }, [state.renderer])

  useEffect(() => {
    updateScene();
    requestAnimationFrame(updateScene)
    transformHelper.initTransformHelper()
  }, [state.camera])

  useEffect(() => {
    if (cncFileInfo.originUrl) {
      invertBeauty()
    }
  }, [cncFileInfo.originUrl])

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          visibility: props.show ? 'visible' : 'hidden'
        }}
        ref={node}
      />
      <ContextMenu
        isShow={state.showMenu} position={state.menuPosition} clickMenu={clickMenu}
      />
    </div>
  )
}

export default forwardRef(CNCVisualizer)