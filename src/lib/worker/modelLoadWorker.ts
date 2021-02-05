import ModelLoader from '../../components/PrintingVisualizer/ModelLoader';
const ctx: Worker = self as any;
ctx.addEventListener("message", (e) => {
  const { modelPath } = e.data;
  new ModelLoader().load(modelPath, (geometry: THREE.BufferGeometry) => {
    // Send positions back to caller
    const positions = geometry.getAttribute('position').array;
    ctx.postMessage({ type: 'LOAD_MODEL_POSITIONS', positions });
  }, (progress) => {
    console.log('progress', progress);
  }, (error) => {
    console.log(error);
  });
})