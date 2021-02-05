import { rotateCoordConvertByOrigin } from '../units';
const ctx: Worker = self as any;
ctx.addEventListener("message", (e) => {
  const { curvingMax, newData, depth, x, y, dpi, saveHeight, cncSpeed, deadheadSpeed, scaleX,
    scaleY, angle, centerX, centerY, cuttingDr, cuttingDrMM } = e.data;
  let outGcode = '';
  let sNum = 0;
  let printTime = 0;
  for (let k = 0; k < (parseFloat(curvingMax) / parseFloat(depth)); k++) {
    for (let j = 0; j < newData.length; j += cuttingDr) {
      //偶数行翻转
      let isEven = false;
      let rowData = null;
      if (((j / (cuttingDr) + 1) % 2 === 0)) {
        isEven = true;
        rowData = [...newData[j]].reverse();
      } else {
        rowData = [...newData[j]];
      }
      for (let i = 0; i < rowData.length; i += cuttingDr) {
        const isBr = (i + cuttingDr) >= rowData.length;
        const col = i + cuttingDr;
        const row = j + cuttingDr;
        let itemData = null;

        itemData = {
          rgb: 255 - rowData[i],
          x: isEven ? (x + (rowData.length - col) * scaleX) : (x + col * scaleX),
          y: (y - row * scaleY),
          isBr
        };
        const coord = rotateCoordConvertByOrigin(itemData.x, itemData.y, angle, centerX, centerY, dpi);
        //雕刻起始点
        if (i === 0 && j === 0 && k === 0) {
          outGcode += `G1 X${coord.x} Y${coord.y} Z1 S0 F${deadheadSpeed}\n`;
          outGcode += `G1 X${coord.x} Y${coord.y} Z1 S255 F${deadheadSpeed}\n`;
          printTime += Math.max(Math.abs(coord.x), Math.abs(coord.y)) / deadheadSpeed;
        }

        Object.assign(itemData, coord);
        const zDepth = ((itemData.rgb / 255.0 * curvingMax) * (depth / curvingMax * (k + 1.0))).toFixed(3);

        //路径轨迹
        if (itemData.isBr) {
          //换行处理
          outGcode += `G1 X${itemData.x} Y${itemData.y} Z${saveHeight} S255 F${deadheadSpeed}\n`;
          outGcode += `G1 X${itemData.x} Y${itemData.y} Z-${zDepth}  S255 F${deadheadSpeed}\n`;
          printTime += cuttingDrMM / deadheadSpeed;
        }
        if (itemData.rgb <= 10) {
          //白色点直接去掉
          if (sNum === 0) {
            outGcode += `Z${saveHeight} S255 F${cncSpeed}\n`;
          }
          sNum++;
        } else {
          const insertData = `X${itemData.x} Y${itemData.y} Z-${zDepth} S255`;
          if (sNum > 0) {
            //如果上个点是白点，抬高点到下一个位置点的抬高点，再下压
            outGcode += `X${itemData.x} Y${itemData.y}  Z${saveHeight} S255  F${deadheadSpeed}\n`;
            outGcode += (insertData + ` F${deadheadSpeed}\n`);
          }
          outGcode += (insertData + ` F${cncSpeed}\n`);
          sNum = 0;
        }

        printTime += cuttingDrMM / cncSpeed;
      }
    }
  }

  outGcode += `G1 Z${saveHeight} S0\n`;

  ctx.postMessage({ outGcode, printTime });
});
