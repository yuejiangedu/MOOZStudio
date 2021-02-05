import { fabric } from 'fabric';

export default class CreateClippingPolygon {
  constructor(cv) {
    this.cv = cv;
  }

  polygon = null;

  polygonPositionHandler(dim: any, finalMatrix: any, fabricObject: any) {
    const x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
      y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
    return fabric.util.transformPoint(
      { x: x, y: y }, fabricObject.calcTransformMatrix()
    );
  }

  actionHandler = (eventData: any, transform: any, x: any, y: any) => {
    const polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
      size = polygon._getTransformedDimensions(0, 0),
      finalPointPosition = {
        x: mouseLocalPosition.x * polygon.width / size.x + polygon.pathOffset.x,
        y: mouseLocalPosition.y * polygon.height / size.y + polygon.pathOffset.y
      };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
  }

  anchorWrapper = (anchorIndex: any, fn: any) => {
    return function(eventData: any, transform: any, x: any, y: any) {
      const actionPerformed = fn(eventData, transform, x, y);
      return actionPerformed;
    };
  }

  createPolygon = () => {
    const { cv } = this;
    const padding = 10;
    const points = [{
      x: padding, y: padding
    }, {
      x: cv.width - padding, y: padding
    }, {
      x: cv.width - padding, y: cv.height - padding
    }, {
      x: padding, y: cv.height - padding
    }];


    const polygon = new fabric.Polygon(points, {
      left: padding,
      top: padding,
      fill: '#fff',
      stroke: '#e8e8e8',
      opacity: 0.5,
      strokeWidth: 1,
      scaleX: 1,
      scaleY: 1,
      objectCaching: false,
      transparentCorners: false,
      cornerColor: 'rgba(42,125,225,0.3)',
    });

    const lastControl = polygon.points.length - 1;
    polygon.cornerStyle = 'circle';
    polygon.controls = polygon.points.reduce((acc: any, point: any, index: any) => {
      acc['p' + index] = new fabric.Control({
        positionHandler: this.polygonPositionHandler,
        actionHandler: this.anchorWrapper(index > 0 ? index - 1 : lastControl, this.actionHandler),
        actionName: 'modifyPoligon',
        pointIndex: index
      });
      return acc;
    }, { });
    polygon.hasBorders = false;

    cv.setActiveObject(polygon);
    cv.add(polygon).renderAll();
    return polygon;
  }
}
