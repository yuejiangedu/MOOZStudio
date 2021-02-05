export default class PerspectiveTransfor {
  constructor(url: string, points: Array<any>) {
    this.url = url;
    this.points = points;
  }

  url: string;

  points: Array<any>;

  width = 0;

  height = 0;

  transfor: () => Promise<string> = () => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = this.url;
      image.onload = () => {
        const outCanvas = document.createElement('canvas');
        outCanvas.width = image.width;
        outCanvas.height = image.height;
        const ctx = outCanvas.getContext('2d');
        ctx && ctx.drawImage(image, 0, 0);
        /* eslint-disable no-undef */
        const src = cv.imread(outCanvas);
        const dst = this.getResultWithMap(src);
        console.log(dst);
        outCanvas.width = this.width;
        outCanvas.height = this.height;
        cv.imshow(outCanvas, dst);
        resolve(outCanvas.toDataURL('png/image', 1));
      };
    });
  }


  getResultWithMap = (src: any) => {
    const { points } = this;
    const array: Array<any> = [];
    points.forEach(point => {
      array.push(point.x);
      array.push(point.y);
    });
    const dst = new cv.Mat();
    const dsize = new cv.Size(this.width, this.height);
    const dstWidth = this.width;
    const dstHeight = this.height;
    const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, array);
    const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, dstWidth, 0, dstWidth, dstHeight, 0, dstHeight]);
    const M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(src, dst, M, dsize);
    return dst;
  }
}
