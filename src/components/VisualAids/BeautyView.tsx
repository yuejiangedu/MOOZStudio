import React, { Component } from 'react';
import { fabric } from 'fabric';
import CreateClippingPolygon from './CreateClippingPolygon';
import PerspectiveTransfor from './PerspectiveTransfor';
import { mm2px } from '../../lib/units';
interface Iprops {
  moozVersion: string;
  upDateVisualAidsBg: (url: string) => void;
  beautyUrl: string;
}
class BeautyView extends Component<Iprops>{
  state: { [index: string]: any } = {
    cvObj: {}
  }

  Polygon: any = null;

  imgObj: any = null;

  componentDidMount() {
    this.initFabric();
  }

  componentDidUpdate(prevProps: any) {
    if (this.props.beautyUrl !== prevProps.beautyUrl) {
      this.insertBeauty()
    }
  }

  initFabric = () => {
    this.setState({
      cvObj: new fabric.Canvas('visual-aid-cv', {
        isDrawingMode: false,
        selectable: false,
        selection: false,
        fireRightClick: true,
        backgroundColor: '#fff'
      })
    }, this.insertBeauty);
  }

  reset = () => {
    if (this.Polygon) {
      const padding = 10;
      const { cvObj } = this.state;
      const points = [{
        x: padding, y: padding
      }, {
        x: cvObj.width - padding, y: padding
      }, {
        x: cvObj.width - padding, y: cvObj.height - padding
      }, {
        x: padding, y: cvObj.height - padding
      }];
      this.Polygon.initialize(points, {
        left: padding,
        top: padding,
        fill: '#fff',
        stroke: '#ccc',
        opacity: 0.5,
        strokeWidth: 1,
        scaleX: 1,
        scaleY: 1,
        objectCaching: false,
        transparentCorners: false,
        cornerColor: 'rgba(42,125,225,0.3)',
      });
      cvObj.renderAll();
    }
  }

  extractFile = async () => {
    if (this.Polygon) {
      const points: Array<any> = [];
      const beautyOffset = this.imgObj.left ? this.imgObj.left : this.imgObj.top;
      const offsetDirection = this.imgObj.left ? 'x' : 'y';
      this.Polygon.points.forEach((item: any) => {
        const point = Object.assign({}, item);
        point[offsetDirection] -= beautyOffset;
        point.x = point.x / this.imgObj.scaleX;
        point.y = point.y / this.imgObj.scaleX;
        points.push(point);
      });
      const tf = new PerspectiveTransfor(this.props.beautyUrl, points);
      const actuallySize = this.props.moozVersion === '200' ? '190' : this.props.moozVersion
      tf.width = tf.height = mm2px(Number(actuallySize));
      const url = await tf.transfor();
      this.props.upDateVisualAidsBg(url);
    }
  }

  insertBeauty = () => {
    const { cvObj } = this.state;
    const { beautyUrl } = this.props
    if (this.imgObj) {
      cvObj.remove(this.imgObj)
      cvObj.remove(this.Polygon)
    }
    fabric.Image.fromURL(beautyUrl, (imgObj: any) => {
      if (!imgObj) {
        return;
      }
      //存储图片像素数据
      this.abjustBeautySize(imgObj);
      imgObj.set({
        left: cvObj.width / 2 - imgObj.width * imgObj.scaleX / 2,
        top: cvObj.height / 2 - imgObj.height * imgObj.scaleY / 2
      });
      cvObj.add(imgObj).renderAll();
      this.imgObj = imgObj;
      const createClippingPolygon = new CreateClippingPolygon(cvObj);
      this.Polygon = createClippingPolygon.createPolygon();
    }, {
      selectable: false,
      selection: false,
    });
  }

  abjustBeautySize = (imgObj: any) => {
    const { cvObj } = this.state;
    const max = imgObj.width > imgObj.height ? 'width' : 'height';
    if (cvObj[max] < imgObj[max]) {
      const scale = cvObj[max] / imgObj[max];
      imgObj.set({
        scaleX: scale,
        scaleY: scale
      });
    }
  }

  render() {
    return (
      <canvas
        id="visual-aid-cv" width={472} height={472} style={{ border: '1px solid #e8e8e8' }}
      />
    );
  }
}
export default BeautyView;
