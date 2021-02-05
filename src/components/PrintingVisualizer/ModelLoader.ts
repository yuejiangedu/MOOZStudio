import * as THREE from 'three';
import STLLoader from '../../lib/three/STLLoader';
import OBJLoader from '../../lib/three/OBJLoader';

const SUPPORT_FORMATS = ['.stl', '.obj', '.STL'];
class ModelLoader {
  load(modelPath: string, onLoad: (geomestry: THREE.Geometry | THREE.BufferGeometry) => void, onProgress: (prg: any) => void, onError: (error: any) => void) {
    return new Promise(() => {
      THREE.Cache.clear();
      if (!ModelLoader.isFormatSupport(modelPath)) {
        onError('Unsupported format');
        return;
      }
      if (modelPath.includes('.stl') || modelPath.includes('.STL')) {
        this.parseAsStl(modelPath, onLoad, onProgress, onError);
      } else if (modelPath.includes('.obj')) {
        this.parseAsObj(modelPath, onLoad, onProgress, onError);
      }
    });
  }

  static isFormatSupport(path: string) {
    for (const item of SUPPORT_FORMATS) {
      if (path.includes(item)) {
        return true;
      }
    }
    return false;
  }

  parseAsStl = (modelPath: string, onLoad: (geomestry: THREE.Geometry | THREE.BufferGeometry) => void, onProgress: (prg: any) => void, onError: (error: any) => void) => {
    new STLLoader().load(
      modelPath,
      (geometry: THREE.Geometry) => {
        onLoad(geometry);
      },
      (progress: any) => {
        onProgress(progress);
      }
    );
  }

  parseAsObj = (modelPath: string, onLoad: (geomestry: THREE.Geometry | THREE.BufferGeometry) => void, onProgress: (prg: any) => void, onError: (error: any) => void) => {
    new OBJLoader(undefined).load(
      modelPath,
      (container: THREE.Group) => {
        const geometry = new THREE.Geometry();
        container.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry && child.geometry instanceof THREE.BufferGeometry) {
              const ge = new THREE.Geometry();
              ge.fromBufferGeometry(child.geometry);
              geometry.merge(ge);
            }
          }
        });
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.fromGeometry(geometry);
        onLoad(bufferGeometry);
      },
      (progress: any) => {
        onProgress(progress);
      },
      (error: any) => {
        onError(error);
      }
    );
  }
}

export default ModelLoader;
