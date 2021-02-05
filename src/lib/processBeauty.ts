import { fabric } from 'fabric';

class ProcessBeauty {
  private url: string;

  private imgType: string;

  private step: number;

  private setting: {
    invert: boolean;
    noise: boolean;
    hasContract?: boolean;
    thres?: number;
    sketch?: boolean;
  };

  private fabricCv: any;

  private fabricImg: any;

  private outCv: any;

  constructor(url: string, type: string) {
    this.url = url;
    this.imgType = type;
    this.step = 0;
    this.setting = {
      invert: false,
      noise: false,
    };
  }

  process = (
    step: number,
    setting: {
      invert: boolean;
      noise: boolean;
    }
  ) => {
    this.step = step;
    this.setting = setting;
    return new Promise((resolve) => {
      const image = new Image();
      image.src = this.url;
      image.onload = async () => {
        this.initFabric(image);
        const beautyUrl = await this.processImage();
        this.removeElement();
        resolve(beautyUrl);
      };
    });
  };

  removeElement = () => {
    this.fabricCv.dispose();
    const dom = document.getElementById('out-cv');
    if (dom) {
      document.body.removeChild(dom as HTMLElement);
    }
  };

  initFabric = (img: any) => {
    const outCv = document.createElement('canvas');
    outCv.id = 'out-cv';
    outCv.width = img.width;
    outCv.height = img.height;
    outCv.style.visibility = 'hidden';
    this.outCv = outCv;
    document.body.appendChild(outCv);
    fabric.textureSize *= 10;
    this.fabricCv = new fabric.Canvas('out-cv', { backgroundColor: '#fff' });
    this.fabricImg = new fabric.Image(img, {
      id: 'image',
      width: img.width,
    });
  };

  sketchImg = async () => {
    const { fabricImg } = this;
    //二值化
    this.invert2Gray();
    fabricImg.applyFilters();
    const grayImgRgba = await this.getImageRgbaData(fabricImg);
    return new Promise((resolve) => {
      fabricImg.clone(async (bgImg: any) => {
        bgImg.filters.unshift(new fabric.Image.filters.Invert());
        bgImg.applyFilters();
        const copyData = await this.getImageRgbaData(bgImg);
        this.gaussBlur(copyData.data, copyData.width, copyData.height);
        this.dodgeColor(grayImgRgba.data, copyData.data);
        const cv = document.createElement('canvas');
        cv.width = copyData.width;
        cv.height = copyData.height;
        const ctx = cv.getContext('2d');
        ctx && ctx.putImageData(grayImgRgba, 0, 0);
        resolve(cv.toDataURL());
      });
    });
  };

  dodgeColor = (basePixes: Uint8ClampedArray, mixPixes: Uint8ClampedArray) => {
    for (let i = 0, len = basePixes.length; i < len; i += 4) {
      basePixes[i] =
        basePixes[i] + (basePixes[i] * mixPixes[i]) / (255 - mixPixes[i]);
      basePixes[i + 1] =
        basePixes[i + 1] +
        (basePixes[i + 1] * mixPixes[i + 1]) / (255 - mixPixes[i + 1]);
      basePixes[i + 2] =
        basePixes[i + 2] +
        (basePixes[i + 2] * mixPixes[i + 2]) / (255 - mixPixes[i + 2]);
    }
    return basePixes;
  };

  gaussBlur = (
    pixes: Uint8ClampedArray,
    width: number,
    height: number,
    radius = 3.0,
    sigma = 1.0
  ) => {
    let gaussMatrix = [],
      gaussSum = 0,
      x,
      y,
      r,
      g,
      b,
      a,
      i,
      j,
      k,
      len;

    radius = Math.floor(radius) || 3;
    sigma = sigma || radius / 3;

    a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
    b = -1 / (2 * sigma * sigma);
    //生成高斯矩阵
    for (i = 0, x = -radius; x <= radius; x++, i++) {
      g = a * Math.exp(b * x * x);
      gaussMatrix[i] = g;
      gaussSum += g;
    }
    //归一化, 保证高斯矩阵的值在[0,1]之间
    for (i = 0, len = gaussMatrix.length; i < len; i++) {
      gaussMatrix[i] /= gaussSum;
    }
    //x 方向一维高斯运算
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        r = g = b = a = 0;
        gaussSum = 0;
        for (j = -radius; j <= radius; j++) {
          k = x + j;
          if (k >= 0 && k < width) {
            //确保 k 没超出 x 的范围
            //r,g,b,a 四个一组
            i = (y * width + k) * 4;
            r += pixes[i] * gaussMatrix[j + radius];
            g += pixes[i + 1] * gaussMatrix[j + radius];
            b += pixes[i + 2] * gaussMatrix[j + radius];
            // a += pixes[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius];
          }
        }
        i = (y * width + x) * 4;
        // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
        // console.log(gaussSum)
        pixes[i] = r / gaussSum;
        pixes[i + 1] = g / gaussSum;
        pixes[i + 2] = b / gaussSum;
      }
    }
    //y 方向一维高斯运算
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        r = g = b = a = 0;
        gaussSum = 0;
        for (j = -radius; j <= radius; j++) {
          k = y + j;
          if (k >= 0 && k < height) {
            i = (k * width + x) * 4;
            r += pixes[i] * gaussMatrix[j + radius];
            g += pixes[i + 1] * gaussMatrix[j + radius];
            b += pixes[i + 2] * gaussMatrix[j + radius];
            gaussSum += gaussMatrix[j + radius];
          }
        }
        i = (y * width + x) * 4;
        pixes[i] = r / gaussSum;
        pixes[i + 1] = g / gaussSum;
        pixes[i + 2] = b / gaussSum;
      }
    }
    return pixes;
  };

  getImageRgbaData: (img: any) => Promise<ImageData> = (fabricImg) => {
    const { fabricCv } = this;
    fabricCv.clear();
    fabricCv.add(fabricImg);
    fabricCv.renderAll();
    const url = fabricCv.toDataURL({
      format: 'png',
      quality: 1,
    });
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = img.width;
        cv.height = img.height;
        const ctx = cv.getContext('2d');
        ctx && ctx.drawImage(img, 0, 0);
        resolve(
          ctx
            ? ctx.getImageData(0, 0, cv.width, cv.height)
            : new ImageData(0, 0)
        );
      };
    });
  };

  invert2Gray = () => {
    const { fabricImg } = this;
    const { hasContract } = this.setting;

    fabricImg.filters.push(new fabric.Image.filters.Grayscale());
    hasContract &&
      fabricImg.filters.push(
        new fabric.Image.filters.Contrast({
          contrast: -0.3,
        })
      );
  };

  invert2Binary = () => {
    const { fabricImg } = this;
    const thresVal = this.setting.thres || 127;
    const grayscaleFilter = new fabric.Image.filters.Grayscale();
    const RemoveColor = new fabric.Image.filters.RemoveColor({
      distance: thresVal / 255,
    });

    const blendColorFilter = new fabric.Image.filters.BlendColor({
      color: '#000',
      mode: 'tint',
      alpha: 1,
    });
    fabricImg.filters.push(grayscaleFilter, RemoveColor, blendColorFilter);
    fabricImg.set({
      backgroundColor: '#fff',
    });
  };

  processImage = async () => {
    const { fabricCv, fabricImg } = this;
    const { invert, noise, sketch } = this.setting;
    if (!fabricCv || !fabricImg) {
      return '';
    }
    //其他滤镜
    invert && fabricImg.filters.push(new fabric.Image.filters.Invert());
    noise &&
      fabricImg.filters.push(
        new fabric.Image.filters.Noise({
          noise: 200,
        })
      );

    this.imgType === 'png' &&
      fabricImg.set({
        backgroundColor: '#fff',
      });

    if (sketch) {
      const url = await this.sketchImg();
      return url;
    }

    if (this.step) {
      this.invert2Binary();
    } else {
      this.invert2Gray();
    }

    fabricImg.applyFilters();
    fabricCv.clear();
    fabricCv.add(fabricImg);
    fabricCv.renderAll();
    return fabricCv.toDataURL({
      format: 'png',
      quality: 1,
    });
  };
}
export default ProcessBeauty;
