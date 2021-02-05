const ctx: Worker = self as any;
ctx.addEventListener("message", (e) => {
  const preDot = {
    x: 0,
    y: 0,
    z: 0
  };

  const currentDot = {
    x: 0,
    y: 0,
    z: 0
  };

  let printTime = 0;

  const { cncSpeed, saveHeight, gcode, deadheadSpeed, curvingMax, depth, } = e.data;

  const curvingDepth = parseInt(curvingMax / depth, 10);

  gcode.unshift(`G1 Z${saveHeight} S0 F${deadheadSpeed}\n`);

  //第一个点开启电转
  gcode.find((item, index) => {
    if (item.includes('G0')) {
      gcode[index] = gcode[index] + ` Z1 S0 F${cncSpeed}\n` + gcode[index] + ` Z1 S255 F${cncSpeed}`;
      return true;
    }
    return false;
  });
  const result = [];
  for (let index = 0; index < gcode.length; index++) {
    const text = gcode[index];
    let str = text;
    if (text.includes('Z-' + curvingDepth)) {
      str = text + ` S255 F${cncSpeed}`;
    } else if (text.includes('Z0')) {
      str = text.replace('Z0', `Z${saveHeight}`) + ` S255 F${deadheadSpeed}`;
    }
    //存储gcode尺寸
    const coord = ['x', 'y', 'z'];

    coord.forEach((coord) => {
      const reg = `${coord.toUpperCase()}(-)?(([0-9]+[.][0-9]*)|[0-9]+)`;
      const regStr = str.match(new RegExp(reg, 'g'));
      const val = regStr ? parseFloat(regStr[0].substring(1)) : null;
      if (val !== null) {
        !preDot[coord] && (preDot[coord] = val);
        currentDot[coord] = val;
      }
    });

    //减少采样过近的点
    const isEffective = Math.abs(currentDot.x - preDot.x) > 0.3 || Math.abs(currentDot.y - preDot.y) > 0.3 || (currentDot.x === preDot.x && currentDot.y === preDot.y) || currentDot.z === saveHeight;
    if (isEffective) {
      printTime += Math.max(Math.abs(currentDot.x - preDot.x), Math.abs(currentDot.y - preDot.y)) / deadheadSpeed;
      Object.assign(preDot, currentDot);
      result.push(str);
    }
  }
  ctx.postMessage({ outGcode: result.join('\n'), printTime });
});
