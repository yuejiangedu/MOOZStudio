import {
  MM_PER_INCH
} from '../constants';
import ReduxStore from '../rootRedux';

export const getDPI = () => {
  const arrDPI = [];
  const tmpNode = document.createElement('DIV');
  tmpNode.style.cssText = 'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden';
  document.body.appendChild(tmpNode);
  arrDPI[0] = changeDecimal(tmpNode.offsetWidth);
  arrDPI[1] = changeDecimal(tmpNode.offsetHeight);
  tmpNode.parentNode!.removeChild(tmpNode);
  return arrDPI;
};

export const mm2px = (val = 0) => {
  const storeState = ReduxStore.getState();
  const DPI = storeState.rootReducers.DPI;
  return val * DPI / MM_PER_INCH;
};

export const px2mm = (val = 0) => {
  const storeState = ReduxStore.getState();
  const DPI = storeState.rootReducers.DPI;
  return val * MM_PER_INCH / DPI;
};

// Converts value from millimeters to inches
export const mm2in = (val = 0) => val / MM_PER_INCH;

// Converts values from inches to millimeters
export const in2mm = (val = 0) => val * MM_PER_INCH;

export const abjustBeautySize = (url: string, width: number, height: number) => {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  cv.width = width;
  cv.height = height;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      ctx!.drawImage(img, 0, 0, width, height);
      return resolve(cv.toDataURL('png/image', 1));
    };
    img.onerror = reject;
  });
};


/**
 * 返回偏移点坐标/毫米
 * @param {number} startX  旋转后左上角X坐标/px
 * @param {number} startY  旋转后左上角Y坐标/px
 * @param {number} angle   旋转角度/度
 * @param {number} offsetX 距离左上角X偏移位置
 * @param {number} offsetY 距离左上角Y偏移位置
 * @param {number} dpi     dpi
 */
export const rotateCoordConvertByStart = (startX: number, startY: number, angle: number, offsetX: number, offsetY: number, dpi: number) => {
  const rad = angle * Math.PI / 180;
  const x = startX - offsetY * Math.sin(rad);
  const y = startY - offsetY * Math.cos(rad);
  const axiesY_val = changeDecimal((y - Math.sin(rad) * offsetX) * MM_PER_INCH / dpi, 2);
  const axiesX_val = changeDecimal((x + Math.cos(rad) * offsetX) * MM_PER_INCH / dpi, 2);
  return {
    x: axiesX_val < 0 ? 0 : axiesX_val,
    y: axiesY_val < 0 ? 0 : axiesY_val
  };
};

/**
 * 返回旋转后左上角坐标
 * @param {number} X 偏移点旋转后X坐标/毫米
 * @param {number} Y 偏移点旋转后Y坐标/毫米
 * @param {number} angle   旋转角度/度
 * @param {number} offsetX 距离左上角X偏移位置/px
 * @param {number} offsetY 距离左上角Y偏移位置/px
 * @param {number} dpi     dpi
 */
export const inverseRotateCoordConvertByStart = (X: number, Y: number, angle: number, offsetX: number, offsetY: number, dpi: number) => {
  const rad = angle * Math.PI / 180;
  const x = X / MM_PER_INCH * dpi - Math.cos(rad) * offsetX;
  const y = Y / MM_PER_INCH * dpi + Math.sin(rad) * offsetX;
  return {
    x: x + offsetY * Math.sin(rad),
    y: y + offsetY * Math.cos(rad)
  };
};

/**
 * 返回旋转后坐标/毫米
 * @param {number} x 旋转前X坐标/px
 * @param {number} y 旋转前Y坐标/px
 * @param {number} angle  旋转角度/度
 * @param {number} originX  旋转原点X坐标/px
 * @param {number} originY 旋转原点Y坐标/px
 * @param {number} dpi
 */
export const rotateCoordConvertByOrigin = (x: number, y: number, angle: number, originX: number, originY: number, dpi: number) => {
  const rad = angle * Math.PI / 180;
  const xx = (x - originX) * Math.cos(-rad) - (y - originY) * Math.sin(-rad) + originX;
  const yy = (x - originX) * Math.sin(-rad) + (y - originY) * Math.cos(-rad) + originY;
  return {
    x: changeDecimal((xx * MM_PER_INCH / dpi), 2),
    y: changeDecimal((yy * MM_PER_INCH / dpi), 2)
  };
};
/**
 * 返回位移对象单位毫米
 * @param {boolean} flipX  是否水平翻转
 * @param {boolean} flipY 是否垂直翻转
 * @param {number} x 旋转后左上角X坐标/毫米
 * @param {number} y 旋转后左上角Y坐标/毫米
 * @param {number} realWidth 图像宽度/毫米
 * @param {number} realHeight 图像宽度/毫米
 * @param {number} angle 旋转角度
 */
export const convertTranslation = (flipX: number, flipY: number, x: number, y: number, realWidth: number, realHeight: number, angle: number) => {
  let translateX, translateY;
  const rad = angle * Math.PI / 180;
  if (!flipX && !flipY) {
    translateX = x;
    translateY = y;
  } else if (flipX && flipY) {
    translateX = x + Math.cos(rad) * realWidth - Math.sin(rad) * realHeight;
    translateY = y - Math.cos(rad) * realHeight - Math.sin(rad) * realWidth;
  } else {
    translateX = flipX ? x + Math.cos(rad) * realWidth : x - Math.sin(rad) * realHeight;
    translateY = flipY ? y - Math.cos(rad) * realHeight : y - Math.sin(rad) * realWidth;
  }
  return {
    x: translateX,
    y: translateY
  };
};

export const changeDecimal = (x: string | number, num: number = 0) => {
  let fx = typeof x === 'string' ? parseFloat(x) : x;
  const unit = Math.pow(10, num);
  if (Number.isNaN(fx)) {
    return 0.00;
  }
  fx = Math.round(fx * unit) / unit;
  return fx;
};
