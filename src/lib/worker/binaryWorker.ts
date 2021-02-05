import { rotateCoordConvertByStart, px2mm, changeDecimal } from '../units';
const ctx: Worker = self as any;
ctx.addEventListener("message", (e) => {
  let printTime = 0;
  let sNum = 0;
  let outGcode = '';
  const { newData, x, y, dpi, deadheadSpeed, engravingSpeed, angle, powerMax, customFilter } = e.data;
  const isSketch = customFilter && customFilter.sketch;
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

      //起始点计算时间
      const printStartX = changeDecimal(px2mm(x), 3)
      const printStartY = changeDecimal(px2mm(y), 3)
      printTime += Math.max(Math.abs(itemData.x - printStartX), Math.abs(itemData.y - printStartY)) / engravingSpeed;

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
});
