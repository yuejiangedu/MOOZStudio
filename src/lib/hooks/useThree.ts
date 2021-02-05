import * as THREE from "three";
import colornames from "colornames";

const use3DRenderer = () => {
  const createRenderer = (width: number, height: number) => {
    const webGLRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    webGLRenderer.shadowMap.enabled = true;
    webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    webGLRenderer.setClearColor(0xffffff);
    webGLRenderer.setSize(width, height);
    webGLRenderer.clear();
    return webGLRenderer;
  };
  return {
    createRenderer,
  };
};

const useLight = (scene: THREE.Scene | null) => {
  const addLight = () => {
    if (!scene) return;
    const color = 0xffffff;
    const intensity = 1;
    let light: THREE.DirectionalLight;

    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, -1, 1);
    scene.add(light);

    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(1, -1, 1);
    scene.add(light);

    const AmbientLight = new THREE.AmbientLight(colornames("gray 25")); // soft white light
    scene.add(AmbientLight);
  };
  return { addLight };
};

export { use3DRenderer, useLight };
