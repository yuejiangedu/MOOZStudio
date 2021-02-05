import Canvg from 'canvg';
import Gcanvas from 'gcanvas';
import CNCWorker from 'worker-loader!../worker/cncWorker';
import GreyWorker from 'worker-loader!../worker/greyWorker';
import BinaryWorker from 'worker-loader!../worker/binaryWorker';
import CNCToLaserWorker from 'worker-loader!../worker/cncToLaser';
import FilterCncWorker from 'worker-loader!../worker/filterCncWorker';
import ConvertArratWorker from 'worker-loader!../worker/convertArrayWorker';
import Snap from 'snapsvg';
import { convertTranslation, mm2px, px2mm } from '../units';

const convertWorker = new ConvertArratWorker();
const cncToLaserWorker = new CNCToLaserWorker();
const filterCncWorker = new FilterCncWorker();
const cncWorker = new CNCWorker();
const greyWorker = new GreyWorker();
const binaryWorker = new BinaryWorker();
const GOTO_ORIGIN_TIME = 0.5;
const BACKHOMETIME = 0.5; //min
class Convert2gcode {
  constructor(config) {
    const {
      sizeX,
      sizeY,
      cncSpeed,
      deadheadSpeed,
      depth,
      saveHeight,
      cncThres,
      curvingMax,
      dpi,
      powerMin,
      powerMax,
      engravingSpeed,
      border,
      thres,
      carvingTool,
      page,
      cuttingAngulus,
      cuttingDiameter,
      openToolDefinition,
      flatEndMillSize
    } = config;
    this.page = page;
    //CNC参数
    this.sizeX = sizeX || 0;
    this.sizeY = sizeY || 0;
    this.cncSpeed = cncSpeed;
    this.depth = depth;
    this.saveHeight = saveHeight;
    this.cncThres = cncThres;
    this.curvingMax = curvingMax;
    this.dpi = dpi || 96;
    this.carvingTool = carvingTool || 'vBit';
    this.cuttingAngulus = cuttingAngulus;
    this.cuttingDiameter = cuttingDiameter;
    this.openToolDefinition = openToolDefinition;
    this.flatEndMillSize = flatEndMillSize;
    //激光参数
    this.deadheadSpeed = deadheadSpeed;
    this.powerMin = powerMin;
    this.powerMax = powerMax;
    this.engravingSpeed = engravingSpeed;
    this.border = border;
    this.thres = thres;
    this.printTime = 0;
  }

  convertMethods = () => {
    const {
      genCNCGCode,
      genGrayGCode,
      genBinaryGCode,
      SVG2Gcode
    } = this;
    return {
      'gray': genGrayGCode,
      'binary': genBinaryGCode,
      'laser-svg': SVG2Gcode,
      'cnc': genCNCGCode,
      'cnc-svg': SVG2Gcode
    };
  }

  convert = async (data) => {
    const {
      text,
      imgState
    } = data;
    let gcode = '';

    for (let index = 0; index < imgState.length; index++) {
      const state = imgState[index];
      if (state.gcodeType) {
        Object.assign(this, state.option);
        // eslint-disable-next-line no-await-in-loop
        const itemGcode = await this.convertMethods()[state.gcodeType]({ ...state });
        gcode += itemGcode;
      }
    }


    const textGcode = await this.text2gcode(text);
    gcode += textGcode;
    gcode = 'G28\n M106 S0\n G1 X0 Y0 Z0 F3000\n' + gcode;
    gcode += '\nM106 S0\n G28\n';

    return {
      gcode,
      printTime: this.printTime
    };
  }

  convertArray = (arr, width, isText) => {
    convertWorker.postMessage({
      arr,
      width,
      isText
    });
    return new Promise(resolve => {
      convertWorker.onmessage = function (e) {
        resolve(e.data);
      };
    });
  }

  convertCNC2Laser = (gcode) => {
    const {
      engravingSpeed,
      deadheadSpeed,
      powerMax
    } = this;
    cncToLaserWorker.postMessage({
      engravingSpeed,
      deadheadSpeed,
      gcode,
      powerMax
    });
    return new Promise(resolve => {
      cncToLaserWorker.onmessage = (e) => {
        this.printTime += GOTO_ORIGIN_TIME;
        this.printTime += BACKHOMETIME * 2;
        this.printTime += e.data.printTime;
        resolve(e.data.outGcode);
      };
    });
  }

  canvasLetterSpacingText = (context, text, x, y, letterSpacing) => {
    const canvas = context.canvas;

    if (!letterSpacing && canvas) {
      letterSpacing = parseFloat(window.getComputedStyle(canvas).letterSpacing);
    }
    if (!letterSpacing) {
      return context.fillText(text, x, y);
    }

    const arrText = text.split('');
    const align = context.textAlign || 'left';
    const originWidth = context.measureText(text).width;
    // 应用letterSpacing占据宽度
    const actualWidth = originWidth + letterSpacing * (arrText.length - 1);
    if (align === 'center') {
      x -= actualWidth / 2;
    } else if (align === 'right') {
      x -= actualWidth;
    }
    context.textAlign = 'left';
    // 开始逐字绘制
    arrText.forEach((letter) => {
      const letterWidth = context.measureText(letter).width;
      context.fillText(letter, x, y);
      x = x + letterWidth + letterSpacing;
    });
    context.textAlign = align;
  };

  laserFillTextToGcode = async (text) => {
    const { scaleX, scaleY, height, width, lineHeight, fontSize, flipY, flipX } = text;
    const size = height * scaleY;
    const txt = text.text;
    const cvs = document.createElement('canvas');
    cvs.height = height * scaleY * lineHeight;
    cvs.width = width * scaleX;
    const ctx = cvs.getContext('2d');
    ctx.font = `${size}px bolder Alibaba-PuHuiTi-H`;
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    //翻转判断
    if (flipX) {
      ctx.translate(cvs.width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-cvs.width / 2, 0);
    }
    if (flipY) {
      ctx.translate(0, cvs.height / 2);
      ctx.scale(1, -1);
      ctx.translate(0, -cvs.height / 2);
    }
    const textDrawY = (lineHeight - 1) * height * scaleY;
    this.canvasLetterSpacingText(ctx, txt, 0, textDrawY, 9 * scaleX);
    const data = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
    const rad = text.angle * Math.PI / 180;
    const y = text.y + Math.cos(rad) * fontSize * scaleY / lineHeight;
    const x = text.x + Math.sin(rad) * fontSize * scaleY / lineHeight;

    const imgState = {
      width: cvs.width,
      x,
      y,
      scaleX: 1,
      scaleY: 1,
      angle: text.angle,
      data,
      isText: true
    };
    const gcode = await this.genBinaryGCode(imgState);
    return gcode;
  }

  filterCncSvgCode = (gcode) => {
    const {
      cncSpeed,
      saveHeight,
      deadheadSpeed,
      curvingMax,
      depth,
    } = this;
    filterCncWorker.postMessage({
      cncSpeed,
      saveHeight,
      gcode,
      deadheadSpeed,
      curvingMax,
      depth,
    });
    return new Promise(resolve => {
      filterCncWorker.onmessage = (e) => {
        this.printTime += GOTO_ORIGIN_TIME;
        this.printTime += BACKHOMETIME * 2;
        this.printTime += e.data.printTime;
        resolve(e.data.outGcode);
      };
    });
  }

  singleText2Gcode = (item) => {
    const {
      dpi,
      carvingTool,
      page,
      flatEndMillSize
    } = this;
    const {
      x,
      y,
      textType,
      originFont,
      fontSize,
      flipX,
      flipY,
      width,
      height,
      scaleX,
      scaleY,
      angle,
    } = item;
    const defaultOptions = {
      toolDiameter: carvingTool === 'vBit' ? 1 : flatEndMillSize,
      depth: 1,
      ramping: false,
      precision: 1
    };
    const itemGcode = [];
    const gctx = new Gcanvas(new Gcanvas.GcodeDriver({
      write: function (cmd) {
        itemGcode.push(cmd);
      }
    }));
    Object.keys(defaultOptions).forEach(opt => {
      gctx[opt] = defaultOptions[opt];
    });
    gctx.canvas.width = 1000;
    gctx.canvas.height = 800;
    const font = page === 'cnc' ? fontSize : originFont;
    gctx.font = `${font}px fz`;
    gctx.textBaseline = 'middle';
    gctx.save();
    //翻转
    const translation = convertTranslation(flipX, flipY, px2mm(x), px2mm(y), px2mm(width * scaleX), px2mm(-height * scaleY), angle, dpi);
    gctx.translate(translation.x, translation.y);
    gctx.rotate(180 * Math.PI / 180 - angle * Math.PI / 180);
    const flip2X = flipX ? 1 : -1;
    const flip2Y = flipY ? -1 : 1;
    gctx.scale(flip2X, flip2Y);
    if (textType === 0) {
      gctx.strokeText(item.text);
    } else {
      gctx.fillText(item.text);
    }
    gctx.restore();
    return itemGcode;
  }

  text2gcode = async (textArray) => {
    let gcode = '';
    for (let index = 0; index < textArray.length; index++) {
      const item = textArray[index];
      let itemGcode = null;
      Object.assign(this, item.option);
      if (this.page === 'cnc') {
        // eslint-disable-next-line no-await-in-loop
        itemGcode = await this.filterCncSvgCode(this.singleText2Gcode(item));
      } else if (item.textType === 1) {
        // eslint-disable-next-line no-await-in-loop
        itemGcode = await this.laserFillTextToGcode(item);
      } else {
        // eslint-disable-next-line no-await-in-loop
        itemGcode = await this.convertCNC2Laser(this.singleText2Gcode(item));
      }
      gcode += itemGcode;
    }
    return gcode;
  };

  SVG2Gcode = async (state) => {
    if (!state.data) {
      return '';
    }
    const gcode = [];
    const {
      x,
      y,
      width,
      height,
      scaleX,
      scaleY,
      flipX,
      flipY,
      angle,
      gcodeType,
      data
    } = state;
    const {
      dpi,
      curvingMax,
      depth,
      carvingTool,
      flatEndMillSize
    } = this;
    //调整svg大小
    const curvingDepth = gcodeType === 'cnc-svg' ? parseInt(curvingMax / depth, 10) : 1;
    const realHeight = px2mm(Math.abs(height * scaleY));
    const realWidth = px2mm(Math.abs(width * scaleX));
    const dom = document.createElement('div');
    dom.innerHTML = data;
    const svgDom = dom.children[0];
    const snap = new Snap(svgDom);
    snap.attr('width', `${realWidth}px`);
    snap.attr('height', `${realHeight}px`);
    snap.attr('stroke', '#000');
    snap.attr('fill', 'none');

    const newSvgStr = snap.outerSVG();
    const defaultOptions = {
      toolDiameter: carvingTool === 'vBit' ? 1 : flatEndMillSize,
      depth: curvingDepth,
      ramping: false,
      precision: 0.1
    };
    const gctx = new Gcanvas(new Gcanvas.GcodeDriver({
      write: function (cmd) {
        gcode.push(cmd);
      }
    }));
    Object.keys(defaultOptions).forEach(opt => {
      gctx[opt] = defaultOptions[opt];
    });
    const ctx = gctx.canvas.getContext('2d');
    gctx.save();
    const translation = convertTranslation(flipX, flipY, px2mm(x), px2mm(y), realWidth, realHeight, angle, dpi);
    gctx.translate(translation.x, translation.y);
    gctx.rotate(180 * Math.PI / 180 - angle * Math.PI / 180);
    const toflipX = flipX ? 1 : -1;
    const toflipY = flipY ? -1 : 1;
    gctx.scale(toflipX, toflipY);
    const v = await Canvg.fromString(ctx, newSvgStr, {});
    v.start();
    gctx.restore();
    const result = gcodeType === 'cnc-svg' ? await this.filterCncSvgCode(gcode) : await this.convertCNC2Laser(gcode);
    return result;
  };

  genCNCGCode = (state) => {
    const {
      cncSpeed,
      deadheadSpeed,
      depth,
      saveHeight,
      curvingMax,
      dpi,
      cuttingAngulus,
      cuttingDiameter,
      openToolDefinition,
      carvingTool,
      flatEndMillSize
    } = this;

    if (!state.data) {
      return '';
    }
    let gcode = '';
    const {
      width,
      x,
      y,
      scaleX,
      scaleY,
      angle,
      centerX,
      centerY,
      data
    } = state;
    const realWidth = parseInt(width, 10);

    const runSpeed = cncSpeed;

    //根据雕刻工具调整采样密度
    let cuttingDr = carvingTool === 'vBit' ? 1 : Math.round(mm2px(flatEndMillSize));

    if (openToolDefinition) {
      cuttingDr = Math.round(mm2px(cuttingDiameter));
    }

    cuttingDr = cuttingDr < 1 ? 1 : cuttingDr;

    const cuttingDrMM = px2mm(cuttingDr);

    //原点
    gcode += `\n G0 S0 F${deadheadSpeed}\n`;

    return new Promise(resolve => {
      this.convertArray(data, realWidth).then(newData => {
        cncWorker.postMessage({
          curvingMax,
          newData,
          depth,
          x,
          y,
          dpi,
          saveHeight,
          cncSpeed: runSpeed,
          deadheadSpeed,
          scaleX,
          scaleY,
          angle,
          centerX,
          centerY,
          cuttingDr,
          cuttingDrMM
        });
        cncWorker.onmessage = (e) => {
          gcode += e.data.outGcode;
          this.printTime += e.data.printTime;
          // outGcode += 'M106 S0\nG28\n';
          resolve(gcode);
        };
      });
    });
  };

  genBinaryGCode = (state) => {
    const {
      data,
      isText
    } = state;
    const {
      deadheadSpeed,
      dpi,
      engravingSpeed,
      powerMax,
    } = this;
    if (!data && !isText) {
      return '';
    }
    let gcode = '';
    const {
      width,
      x,
      y,
      scaleX,
      angle,
      customFilter
    } = state;
    const realWidth = parseInt(width * Math.round(scaleX * 100) / 100, 10);

    //用户所选初始速度
    gcode += `\n G0 S0 F${deadheadSpeed}\n`;


    return new Promise(resolve => {
      this.convertArray(data, realWidth, isText)
        .then(newData => {
          binaryWorker.postMessage({
            newData,
            x,
            y,
            dpi,
            deadheadSpeed,
            engravingSpeed,
            angle,
            powerMax,
            customFilter
          });
          binaryWorker.onmessage = (e) => {
            gcode += e.data.outGcode;
            this.printTime += GOTO_ORIGIN_TIME;
            this.printTime += 2 * BACKHOMETIME;
            this.printTime += e.data.printTime;
            resolve(gcode);
          };
        });
    });
  };


  genGrayGCode = (state) => {
    const {
      data
    } = state;
    const {
      deadheadSpeed,
      dpi,
      engravingSpeed,
      border,
      powerMin,
      powerMax,
    } = this;
    if (!data) {
      return '';
    }
    let gcode = '';
    const {
      width,
      scaleX,
      height,
      scaleY,
      x,
      y,
      angle,
      customFilter
    } = state;
    const realWidth = parseInt(width * Math.round(scaleX * 100) / 100, 10);

    //用户所选初始空驰速度
    gcode += `\n G0 S0 F${deadheadSpeed}\n`;

    return new Promise(resolve => {
      this.convertArray(data, realWidth)
        .then(newData => {
          greyWorker.postMessage({
            x,
            y,
            border,
            dpi,
            width,
            height,
            scaleX,
            scaleY,
            // realHeight,
            // realWidth,
            engravingSpeed,
            deadheadSpeed,
            newData,
            angle,
            powerMin,
            powerMax,
            customFilter
          });
          greyWorker.onmessage = (e) => {
            gcode += e.data.outGcode;
            this.printTime += GOTO_ORIGIN_TIME;
            this.printTime += 2 * BACKHOMETIME;
            this.printTime += e.data.printTime;
            resolve(gcode);
          };
        });
    });
  };
}
export default Convert2gcode;
