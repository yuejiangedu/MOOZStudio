import * as THREE from "three";
import { useEffect, useState } from "react";
import GridLine from "../three-model/GridLine";
import TextSprite from "../three-model/TextSprite";
import CoordinateAxes from "../three-model/CoordinateAxes";
import colornames from "colornames";
import _each from "lodash/each";

const defaultOptions = {
  GRID_SPACING: 10,
  GRID_COUNT: 13,
};

interface Ioptions {
  GRID_SPACING?: number;
  GRID_COUNT?: number;
}

export const useCoordinateRender = (
  scene: THREE.Scene | null,
  options: Ioptions
) => {
  const validOptions = Object.assign(defaultOptions, options);
  const [coordSystem, setCoordSystem] = useState<THREE.Group | null>(null);
  const [renderCallBack, setRenderCallBack] = useState<any>();
  const [gridLineNumbers, setGridLineNumbers] = useState<THREE.Group | null>(
    null
  );

  const createGridLine = () => {
    const { GRID_SPACING, GRID_COUNT } = validOptions;
    // Coordinate Grid
    const gridLine = new GridLine(
      GRID_COUNT * GRID_SPACING,
      GRID_SPACING,
      GRID_COUNT * GRID_SPACING,
      GRID_SPACING,
      new THREE.Color(colornames("blue")), // center line
      new THREE.Color(colornames("gray 44")) // grid
    );
    _each(gridLine.children, (o: any) => {
      o.material.opacity = 0.15;
      o.material.transparent = true;
      o.material.depthWrite = false;
    });
    gridLine.name = "GridLine";
    coordSystem && coordSystem.add(gridLine);
  };

  const createAxes = () => {
    const { GRID_SPACING, GRID_COUNT } = validOptions;
    const coordinateAxes = new CoordinateAxes(GRID_SPACING * GRID_COUNT);
    coordinateAxes.name = "CoordinateAxes";
    coordSystem && coordSystem.add(coordinateAxes);
  };

  const createLabels = () => {
    const { GRID_SPACING, GRID_COUNT } = validOptions;

    const axisXLabel = new TextSprite({
      x: GRID_SPACING * GRID_COUNT + GRID_SPACING,
      y: 0,
      z: 0,
      size: 20,
      text: "X",
      color: colornames("red"),
    });
    const axisYLabel = new TextSprite({
      x: 0,
      y: GRID_SPACING * GRID_COUNT + GRID_SPACING,
      z: 0,
      size: 20,
      text: "Y",
      color: colornames("green"),
    });
    const axisZLabel = new TextSprite({
      x: 0,
      y: 0,
      z: GRID_SPACING * GRID_COUNT + GRID_SPACING,
      size: 20,
      text: "Z",
      color: colornames("blue"),
    });
    if (coordSystem) {
      coordSystem.add(axisXLabel);
      coordSystem.add(axisYLabel);
      coordSystem.add(axisZLabel);
    }
  };

  const createGridLineNumbers = () => {
    const { GRID_SPACING, GRID_COUNT } = validOptions;
    const textSize = GRID_SPACING / 3;
    const textOffset = GRID_SPACING / 5;
    for (let i = 0; i <= GRID_COUNT; ++i) {
      if (i !== 0) {
        const textLabelX = new TextSprite({
          x: i * GRID_SPACING,
          y: textOffset,
          z: 0,
          size: textSize,
          text: i * GRID_SPACING,
          textAlign: "center",
          textBaseline: "bottom",
          color: colornames("red"),
          opacity: 0.5,
        });
        gridLineNumbers && gridLineNumbers.add(textLabelX);
      }
    }
    for (let i = 0; i <= GRID_COUNT; ++i) {
      if (i !== 0) {
        const textLabelY = new TextSprite({
          x: -textOffset,
          y: i * GRID_SPACING,
          z: 0,
          size: textSize,
          text: i * GRID_SPACING,
          textAlign: "right",
          textBaseline: "middle",
          color: colornames("green"),
          opacity: 0.5,
        });
        gridLineNumbers && gridLineNumbers.add(textLabelY);
      }
    }
  };

  const toggleCoordSystem = (val: boolean) => {
    if (coordSystem) {
      coordSystem.visible = val;
    }
  };

  const toggleGridLineNumbers = (val: boolean) => {
    if (gridLineNumbers) {
      gridLineNumbers.visible = val;
    }
  };

  const renderCoord = (renderCallBack?: () => void) => {
    if (!scene) return;
    setCoordSystem(new THREE.Group());
    setGridLineNumbers(new THREE.Group());
    setRenderCallBack(renderCallBack);
  };

  const clearCoord = () => {
    if (!scene) return;
    const removeTarget: Array<THREE.Group | null> = [
      coordSystem,
      gridLineNumbers,
    ];
    removeTarget.forEach((item: THREE.Group | null) => {
      scene.remove(item as THREE.Group);
    });
  };

  useEffect(() => {
    if (!coordSystem || !gridLineNumbers) return;
    createGridLine();
    createAxes();
    createLabels();
    createGridLineNumbers();
    scene && scene.add(coordSystem, gridLineNumbers);
    renderCallBack && renderCallBack();
  }, [coordSystem, gridLineNumbers]);

  return { renderCoord, clearCoord, toggleGridLineNumbers, toggleCoordSystem };
};
