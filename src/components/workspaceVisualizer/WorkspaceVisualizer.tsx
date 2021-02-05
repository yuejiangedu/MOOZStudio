import React, { useEffect, useRef, useState } from 'react';
import TrackballControls from '../../lib/three/TrackballControls';
import * as THREE from 'three';
import CombinedCamera from '../../lib/three/CombinedCamera';
import _each from 'lodash/each';
import _tail from 'lodash/tail';
import throttle from 'lodash/throttle';
import Gcode2Model3Dworker from 'worker-loader!../../lib/worker/gcode2Model3Dworker';
import log from '../../lib/log';
import { useLocation } from 'react-router'
import { useCoordinateRender } from '../../lib/hooks/useCoordinateRender'
import { use3DRenderer, useLight } from '../../lib/hooks/useThree'
import { useTrackballControls } from '../../lib/hooks/useTrackballControls'
import { useCombinedCamera } from '../../lib/hooks/useCombinedCamera'
import {
  CONTAINER_MARGIN,
  NAVBAR_HEIGHT,
  RIGHT_SIDER_WIDTH,
  LEFT_SIDER_WIDTH,
  WORKSPACE_HEADERTOOL_HEIGHT
} from '../../constants';

interface Iprops {
  show: boolean;
  moozVersion: string;
  history: History;
  state: any;
  cameraPosition: string[];
  zoom: number;
  setProgressAction: (progress: number) => void;
  setGcodeSize: (gcodeSize: { xmax: number, xmin: number, ymax: number, ymin: number, zmax: number, zmin: number }) => void;
  loadCallback: () => void;
  changeLoadstate: () => void;
  cameraMode: string;
}
let currentZoom = 1;


const WorkspaceVisualizer = (props: Iprops) => {
  const { show, moozVersion, state, zoom } = props;
  const node = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [scene, setScene] = useState<THREE.Scene | null>(null)
  const [renderer, setRenderer] = useState<THREE.Renderer | null>(null)
  const [controls, setControls] = useState<TrackballControls | null>(null)
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | THREE.OrthographicCamera | CombinedCamera | undefined>()
  const { createRenderer } = use3DRenderer()
  const { addLight } = useLight(scene);
  const {
    renderCoord,
    clearCoord,
    toggleGridLineNumbers,
    toggleCoordSystem
  } = useCoordinateRender(scene, { GRID_COUNT: Number(moozVersion) / 10 })
  const {
    setControlsZoom,
    createTrackballControls,
    resetControl
  } = useTrackballControls(camera, renderer)
  const {
    createCombinedCamera,
    setCombinedCameraPos,
    changeCombinedCamera,
    updateCameraLookAt
  } = useCombinedCamera()
  const workSize = {
    width: parseInt(moozVersion) / 2,
    height: parseInt(moozVersion) / 2
  }
  const updateScene = () => {
    if (scene && camera && renderer) {
      renderer.render(scene, camera)
    }
  }

  const getVisibleWidth = () => {
    const currentClientWidth = document.documentElement.clientWidth;
    const visibleWidth = (
      currentClientWidth - RIGHT_SIDER_WIDTH - LEFT_SIDER_WIDTH - 2 * CONTAINER_MARGIN
    );
    const width = !node.current || node.current.clientWidth === 0 ? visibleWidth : node.current.clientWidth;
    return width;
  }

  const getVisibleHeight = () => {
    const clientHeight = document.documentElement.clientHeight;
    const visibleHeight = clientHeight - NAVBAR_HEIGHT - WORKSPACE_HEADERTOOL_HEIGHT - 2 * CONTAINER_MARGIN;
    return visibleHeight;
  }

  const resizeRenderer = throttle(() => {
    if (!(camera && renderer)) {
      return;
    }

    const width = getVisibleWidth();
    const height = getVisibleHeight();

    if (width === 0 || height === 0) {
      log.warn(`The width (${width}) and height (${height}) cannot be a zero value`);
    }

    (camera as CombinedCamera).setSize(width, height);
    (camera as CombinedCamera).aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    controls && controls.handleResize();
    updateScene();
  }, 100);



  const createScene = () => {
    if (!node.current) {
      return;
    }
    const width = getVisibleWidth();
    const height = getVisibleHeight();

    setRenderer(createRenderer(width, height));
  }

  const clearScene = () => {
    if (!scene) return
    const objsToRemove = _tail(scene.children);
    _each(objsToRemove, (obj) => {
      scene.remove(obj);
    });
    controls && controls.dispose();
    // Update the scene
    updateScene();
  }

  const loadModel = (gcode: { xmax: number, xmin: number, ymax: number, ymin: number, zmax: number, zmin: number }) => {
    return new Promise((resolve) => {
      props.setProgressAction(0);
      const worker = new Gcode2Model3Dworker();
      worker.postMessage({ lineList: [], gcode, type: 'LOAD_WORKSPACE_MODEL' });
      worker.onmessage = (e: any) => {
        const { type } = e.data;
        if (type !== 'LOAD_GCODE_LINE') {
          return;
        }
        const { vertices, colors, gcodeSize } = e.data;
        props.setGcodeSize(gcodeSize);
        const geometry = new THREE.BufferGeometry();
        const positon = new THREE.Float32BufferAttribute(vertices, 3);
        const color = new THREE.Uint8BufferAttribute(colors, 3);
        color.normalized = true;
        geometry.addAttribute('position', positon);
        geometry.addAttribute('color', color);
        const workpiece = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            linewidth: 1,
            vertexColors: THREE.VertexColors,
            opacity: 0.5,
            transparent: true
          })
        );
        workpiece.name = 'Visualizer';
        scene && scene.add(workpiece);
        updateScene();
        worker.terminate();
        // props.history.push({ pathname: '/workspace' });
        resolve('ok');
      };
    });
  }

  const load = async (
    name: string,
    gcode: { xmax: number, xmin: number, ymax: number, ymin: number, zmax: number, zmin: number },
    callback: () => void
  ) => {
    unload();
    props.changeLoadstate();
    gcode && await loadModel(gcode);
    updateScene();
    (typeof callback === 'function') && callback();
  }

  const unload = () => {
    const visualizerObject = scene && scene.getObjectByName('Visualizer');
    if (visualizerObject) {
      scene && scene.remove(visualizerObject);
    }
    updateScene();
  }

  const resetCameraLookAt = () => {
    if (!camera) return
    resetControl(controls, {
      x: Number(moozVersion) / 2,
      y: Number(moozVersion) / 2,
      z: 0
    });
    (camera as CombinedCamera).setZoom(1.5);
    updateCameraLookAt(
      props.cameraPosition[0],
      camera as THREE.OrthographicCamera | THREE.PerspectiveCamera,
      { width: parseInt(moozVersion), height: parseInt(moozVersion) }
    );
    controls && controls.update();
    updateScene();
  }

  const initTrackballEvent = () => {
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
      updateScene();
    });

    controls.addEventListener('change', () => {
      updateScene();
    });
  };

  useEffect(() => {
    createScene();
    return () => {
      clearScene();
    }
  }, [])

  useEffect(() => {
    if (camera && renderer && controls) {
      window.addEventListener('resize', resizeRenderer);
      return () => {
        window.removeEventListener('resize', resizeRenderer);
      }
    }
  }, [camera, renderer, controls])

  useEffect(() => {
    clearCoord();
    renderCoord(() => {
      setTimeout(() => {
        resetCameraLookAt()
        requestAnimationFrame(updateScene);
      }, 100);
    });
  }, [props.moozVersion])

  useEffect(() => {
    if (!camera) return
    changeCombinedCamera(camera, state.projection)
    updateScene();
  }, [state.projection])

  useEffect(() => {
    resetCameraLookAt()
  }, [props.cameraPosition]);

  useEffect(() => {
    setControlsZoom(controls, zoom - currentZoom);
    currentZoom = zoom;
    updateScene();
  }, [zoom])

  useEffect(() => {
    toggleGridLineNumbers(props.state.objects.gridLineNumbers.visible)
    updateScene();
  }, [props.state.objects.gridLineNumbers.visible])

  useEffect(() => {
    toggleCoordSystem(props.state.objects.coordinateSystem.visible)
    updateScene();
  }, [props.state.objects.coordinateSystem.visible])

  useEffect(() => {
    setTimeout(() => {
      load(props.state.gcode.name, props.state.gcode.content, props.loadCallback);
    }, 100);
    resetCameraLookAt();
  }, [props.state.gcode.content])

  useEffect(() => {
    controls && controls.handleResize();
  }, [location.pathname, props.state.disabled])


  useEffect(() => {
    if (scene) {
      renderCoord(() => {
        (camera as CombinedCamera).setZoom(1.5);
        updateCameraLookAt(
          props.cameraPosition[0],
          camera as THREE.OrthographicCamera | THREE.PerspectiveCamera,
          { width: parseInt(moozVersion), height: parseInt(moozVersion) }
        );
        const tbControls = createTrackballControls({
          target: new THREE.Vector3(
            parseInt(moozVersion) / 2,
            parseInt(moozVersion) / 2,
            0)
        }) as TrackballControls
        setControls(tbControls)
        setTimeout(() => {
          requestAnimationFrame(updateScene);
        }, 100);
      });
      addLight();
    }
  }, [scene])

  useEffect(() => {
    if (renderer) {
      node.current!.appendChild(renderer.domElement);
      setScene(new THREE.Scene())
      const camera = createCombinedCamera(renderer.domElement.width, renderer.domElement.height)
      setCombinedCameraPos(camera, new THREE.Vector3(2 * workSize.width, -2 * workSize.width, 2 * workSize.height))
      setCamera(camera)
    }
  }, [renderer])

  useEffect(() => {
    if (controls) {
      initTrackballEvent();
      setTimeout(() => {
        controls.handleResize()
      }, 1000);
    }
  }, [controls])

  useEffect(() => {
    updateScene();
    requestAnimationFrame(updateScene)
  }, [camera])

  return (
    <div
      style={{
        display: show ? 'block' : 'none',
        height: '100%',
        backgroundColor: '#fff'
      }}
      ref={node}
    />
  );
}

export default WorkspaceVisualizer;
