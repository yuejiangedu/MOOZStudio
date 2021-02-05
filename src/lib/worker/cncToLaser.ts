const ctx: Worker = self as any;
ctx.addEventListener("message", (e) => {
  const { engravingSpeed, deadheadSpeed, gcode, powerMax } = e.data;

  const preDot = {
    x: 0,
    y: 0,
    s: 0
  };

  const currentDot = {
    x: 0,
    y: 0,
    s: 0
  };

  let printTime = 0;

  const result = [];
  for (let index = 0; index < gcode.length; index++) {
    const text = gcode[index];
    let str = text;
    if (text.includes('G0')) {
      str = text + ` F${deadheadSpeed}`;
    }
    if (text.includes('Z-1')) {
      str = text.replace('Z-1', `S${powerMax * 255 / 100} F${engravingSpeed}`);
    } else if (text.includes('Z0')) {
      str = text.replace('Z0', `S0 F${deadheadSpeed}`);
    }
    const coord = ['x', 'y', 's'];

    coord.forEach((coord) => {
      const reg = `${coord.toUpperCase()}(-)?(([0-9]+[.][0-9]*)|[0-9]+)`;
      const regstr = str.match(new RegExp(reg, 'g'));
      const val = regstr ? parseFloat(regstr[0].substring(1)) : null;
      if (val !== null) {
        !preDot[coord] && (preDot[coord] = val);
        currentDot[coord] = val;
      }
    });
    const isEffective = Math.abs(currentDot.x - preDot.x) > 0.3 || Math.abs(currentDot.y - preDot.y) > 0.3 || (currentDot.x === preDot.x && currentDot.y === preDot.y) || currentDot.s === 0;

    //减少采样过近的点
    if (isEffective) {
      printTime += Math.max(Math.abs(currentDot.x - preDot.x), Math.abs(currentDot.y - preDot.y)) / deadheadSpeed;
      Object.assign(preDot, currentDot);
      result.push(str);
    }
  }
  result.unshift(`G0 S0 F${deadheadSpeed}\n`);

  ctx.postMessage({ outGcode: result.join('\n'), printTime });
});
