import { fabric } from "fabric";
import { BEAUTY_OFFSET } from './constants'

export const bindBgWheelEvent = (canvasObj: any) => {
  canvasObj.on({
    "mouse:wheel": function (e: any) {
      const deltaY = e.e.deltaY;
      const zoom = canvasObj.getZoom();
      let newZoom = zoom - deltaY / 1000;
      newZoom = newZoom >= 2 ? 2 : newZoom;
      newZoom = newZoom <= 0.5 ? 0.5 : newZoom;
      canvasObj.zoomToPoint(
        { x: canvasObj.width / 2, y: canvasObj.height / 2 },
        newZoom
      );
    },
  });
};

interface Iconfig {
  canvasObj: any;
  offsetYcoords: number;
  offsetXcoords: number;
  COORDSUNIT_PX: number;
  COORD_COUNT: number;
  COORDSUNIT_MM: number;
}

export const drawGrid = (config: Iconfig) => {
  const {
    canvasObj,
    offsetYcoords,
    offsetXcoords,
    COORDSUNIT_PX,
    COORD_COUNT,
  } = config;
  const gridCount = COORD_COUNT;
  const lineLong = gridCount * COORDSUNIT_PX;
  const yCoordStart = canvasObj.height - offsetYcoords - lineLong;
  const xCoordStart = offsetXcoords;
  let verticalLine, horizontalLine;
  const lineDef = {
    fill: "black",
    stroke: "rgba(0, 0, 0, 0.1)",
    strokeWidth: 1,
    selectable: false,
    selection: false,
    hoverCursor: "default",
  };
  for (let i = 0; i <= gridCount; i++) {
    verticalLine = new fabric.Line(
      [
        xCoordStart + i * COORDSUNIT_PX,
        yCoordStart,
        xCoordStart + i * COORDSUNIT_PX,
        yCoordStart + lineLong,
      ],
      lineDef
    );
    horizontalLine = new fabric.Line(
      [
        xCoordStart,
        yCoordStart + i * COORDSUNIT_PX,
        xCoordStart + lineLong,
        yCoordStart + i * COORDSUNIT_PX,
      ],
      lineDef
    );
    canvasObj.add(horizontalLine);
    canvasObj.add(verticalLine);
  }
};

export const drawCoords = (config: Iconfig) => {
  const {
    canvasObj,
    offsetYcoords,
    offsetXcoords,
    COORDSUNIT_PX,
    COORDSUNIT_MM,
    COORD_COUNT,
  } = config;
  const lineDef = {
    fill: "black",
    stroke: "rgba(0, 0, 0, 0.1)",
    strokeWidth: 2,
    selectable: false,
    selection: false,
    hoverCursor: "default",
  };
  //画坐标线
  const oStartX = offsetXcoords;
  const oStartY = canvasObj.height - offsetYcoords;
  const xAxisEndDotX = offsetXcoords + COORD_COUNT * COORDSUNIT_PX;
  const xAxisEndDotY = canvasObj.height - offsetYcoords;
  const yAxisEndDotX = offsetXcoords;
  const yAxisEndDotY =
    canvasObj.height - offsetYcoords - COORD_COUNT * COORDSUNIT_PX;
  const xAxisLine = new fabric.Line(
    [oStartX, oStartY, xAxisEndDotX + 20, xAxisEndDotY],
    lineDef
  );
  const yAxisLine = new fabric.Line(
    [oStartX, oStartY, yAxisEndDotX, yAxisEndDotY - 20],
    lineDef
  );
  xAxisLine.stroke = "#f72b32";
  yAxisLine.stroke = "#5fab64";
  //x,y箭头
  const triangleX = new fabric.Triangle({
    angle: 90,
    fill: "#f72b32",
    top: xAxisEndDotY + 1,
    left: xAxisEndDotX + 20,
    height: 10,
    width: 10,
    originX: "center",
    originY: "center",
    selectable: false,
    hoverCursor: "default",
  });
  const triangleY = new fabric.Triangle({
    angle: 0,
    fill: "#5fab64",
    top: yAxisEndDotY - 20,
    left: yAxisEndDotX + 1,
    height: 10,
    width: 10,
    originX: "center",
    originY: "center",
    selectable: false,
    hoverCursor: "default",
  });

  //添加标识文字
  const axisXText = new fabric.Text("X", {
    fill: "#f72b32",
    top: xAxisEndDotY - 20,
    left: xAxisEndDotX + 30,
    fontSize: 48,
    textAlign: "center",
    selectable: false,
    selection: false,
    hoverCursor: "default",
  });

  const axisYText = new fabric.Text("Y", {
    fill: "#5fab64",
    top: yAxisEndDotY - 80,
    left: yAxisEndDotX - 20,
    fontSize: 48,
    textAlign: "center",
    selectable: false,
    selection: false,
    hoverCursor: "default",
  });

  canvasObj.add(
    xAxisLine,
    yAxisLine,
    triangleX,
    triangleY,
    axisXText,
    axisYText
  );
  //绘制刻度文字
  for (let i = 1; i < COORD_COUNT + 1; i += 1) {
    //添加刻度
    const xScale = new fabric.Line(
      [
        i * COORDSUNIT_PX + offsetXcoords,
        oStartY,
        i * COORDSUNIT_PX + offsetXcoords,
        oStartY - 5,
      ],
      lineDef
    );
    const yScale = new fabric.Line(
      [
        offsetXcoords,
        oStartY - i * COORDSUNIT_PX,
        offsetXcoords + 5,
        oStartY - i * COORDSUNIT_PX,
      ],
      lineDef
    );
    xScale.stroke = "#f72b32";
    yScale.stroke = "#5fab64";
    canvasObj.add(xScale, yScale);

    //添加文字
    const textX = new fabric.Text("" + i * COORDSUNIT_MM, {
      left: i * COORDSUNIT_PX + offsetXcoords - 6,
      top: oStartY,
      fontSize: 12,
      fill: "#f72b32",
      textAlign: "center",
      selectable: false,
      selection: false,
      hoverCursor: "default",
    });
    const textY = new fabric.Text("" + i * COORDSUNIT_MM, {
      left: offsetXcoords - 24,
      top: oStartY - i * COORDSUNIT_PX - 6,
      fontSize: 12,
      fill: "#5fab64",
      textAlign: "center",
      selectable: false,
      selection: false,
      hoverCursor: "default",
    });
    canvasObj.add(textX, textY);
  }
  //绑定背景缩放事件
  bindBgWheelEvent(canvasObj);
  //绘制一个矩形区域用于多单位的碰撞
  const rectWidth = Math.ceil(oStartY - yAxisEndDotY);
  const rect = new fabric.Rect({
    width: rectWidth + BEAUTY_OFFSET / 2,
    height: rectWidth + BEAUTY_OFFSET / 2,
    left: Math.floor(yAxisEndDotX),
    top: Math.floor(yAxisEndDotY),
    fill: "rgba(255,255,255,.0)",
    selectable: false,
    hoverCursor: "default",
    id: "rect",
  });
  canvasObj.add(rect);
  return rect;
};
