
import { rotateCoordConvertByStart, px2mm, mm2px, changeDecimal } from '../units';
const ctx: Worker = self as any;
ctx.addEventListener("message", (e) => {
  const moveStartCoords = {
    x: 0,
    y: 0
  };
  let printTime = 0;
  let sNum = 0;
  let outGcode = '';
  const { x, y, border, dpi, width, height, scaleX, scaleY, engravingSpeed, newData, deadheadSpeed, angle, powerMin, powerMax, customFilter } = e.data;
  const isSketch = customFilter && customFilter.sketch;
  const realWidth = width * Math.round(scaleX * 100) / 100;
  const realHeight = height * Math.round(scaleY * 100) / 100;
  //图片中心点坐标
  //描边
  if (border !== 0) {
    for (let i = 0; i < mm2px(border); i++) {
      const vertex = [];
      vertex[0] = rotateCoordConvertByStart(x - i, y + i, angle, 0, 0, dpi);
      vertex[1] = rotateCoordConvertByStart(x - i, y - i, angle, 0, realHeight, dpi);
      vertex[2] = rotateCoordConvertByStart(x + i, y - i, angle, realWidth, realHeight, dpi);
      vertex[3] = rotateCoordConvertByStart(x + i, y + i, angle, realWidth, 0, dpi);
      outGcode += `G0 X${vertex[0].x} Y${vertex[0].y} S0 F${engravingSpeed}\n`;
      for (let j = 0; j < 4; j++) {
        outGcode += `G1 X${vertex[j].x} Y${vertex[j].y} S255 F${engravingSpeed}\n`;
      }
      outGcode += `G1 X${vertex[0].x} Y${vertex[0].y} S255 F${engravingSpeed}\n`;
      moveStartCoords.x = vertex[0].x;
      moveStartCoords.y = vertex[0].y;
    }

    printTime += 2 * px2mm(realWidth + realHeight) / engravingSpeed;
  }

  const printStartX = changeDecimal(px2mm(x), 3)
  const printStartY = changeDecimal(px2mm(y), 3)

  printTime += Math.max(Math.abs(moveStartCoords.x - printStartX), Math.abs(moveStartCoords.y - printStartY)) / engravingSpeed;


  //路径轨迹
  for (let j = 0; j < newData.length; j++) {
    //偶数行翻转
    let isEven = false;
    let rowData = null;
    if ((j + 1) % 2 === 0) {
      isEven = true;
      rowData = newData[j].reverse();
    } else {
      rowData = newData[j];
    }
    for (let i = 0; i < rowData.length; i++) {
      const isBr = (i + 1) === rowData.length;
      const col = i + 1;
      const row = j + 1;
      let itemData = null;
      const offsetX = isEven ? rowData.length - col : col;
      const offsetY = row;
      //旋转坐标计算
      const coord = rotateCoordConvertByStart(x, y, angle, offsetX, offsetY, dpi);

      let laserPower = 255 - rowData[i];
      laserPower > powerMax * 255 / 100 && (laserPower = powerMax * 255 / 100);
      laserPower < powerMin * 255 / 100 && (laserPower = powerMin * 255 / 100);

      //素描滤镜下加强激光的强度
      if (isSketch && (laserPower > 10)) {
        laserPower = powerMax * 255 / 100;
      }

      itemData = {
        rgb: laserPower,
        x: coord.x,
        y: coord.y,
        isBr
      };

      if (itemData.rgb <= 10) {
        //白色点直接去掉
        if (sNum === 0) {
          outGcode += `G0 S0 F${deadheadSpeed}\n`;
        }
        sNum++;
      } else {
        if (sNum !== 0) {
          outGcode += `G0 X${itemData.x} Y${itemData.y} S0 F${deadheadSpeed}\n`;
          sNum = 0;
        }

        outGcode += `G1 X${itemData.x} Y${itemData.y} S${itemData.rgb} F${engravingSpeed}\n`;
      }
      printTime += px2mm(1) / deadheadSpeed;
    }
  }
  ctx.postMessage({ outGcode, printTime });
})
