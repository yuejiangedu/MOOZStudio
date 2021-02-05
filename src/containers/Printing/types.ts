export const SET_PRINTING_VERSION = "SET_PRINTING_VERSION";
export const UPDATE_PRINTING_FILE = "UPDATE_PRINTING_FILE";
export const UPDATE_PRINTING_GCODE = "UPDATE_PRINTING_GCODE";
export const UPDATE_GCODE_LINETYPE = "UPDATE_GCODE_LINETYPE";
export const UPDATE_CLIPPING_HEIGHT = "UPDATE_CLIPPING_HEIGHT";
export const UPDATE_CONTROL_PATTERN = "UPDATE_CONTROL_PATTERN";
export const UPDATE_MODEL3D_DATA = "UPDATE_MODEL3D_DATA";
export const UPDATE_CONFIG_FILE = "UPDATE_CONFIG_FILE";
export const UPDATE_MATERIAL = "UPDATE_MATERIAL";
export const UPDATE_MODEL3D_SIZE = "UPDATE_MODEL3D_SIZE";
export const UPDATE_MODEL_DECTION = "UPDATE_MODEL_DECTION";
export const CHANGE_ISOMETRIC_ROTATION = "CHANGE_ISOMETRIC_ROTATION";
export interface IprintingState {
  gcodeLineType: Array<{
    label: string;
    value: boolean;
    color: Array<number>;
    typeCode: number;
    visible: string;
  }>;
  printingVersion: string;
  file: { name: string; size: number; type: string; path: string };
  gcode: {
    data: string;
    msg: {
      gcodeFilename: string;
      printTime: number;
      filamentLength: number;
      filamentWeight: number;
      gcodeFilePath: string;
    };
  };
  clippingHeight: number;
  controlPattern: string;
  configFile: string;
  printMaterial: string;
  modelDetection: boolean;
  isometricRotation: boolean;
  model3Ddata: {
    moveX: number;
    moveY: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    rotateMatrix: string;
  };
  model3Dsize: {
    modelSize: { widthX: number; widthY: number; height: number };
    orgModelSize: { widthX: number; widthY: number; height: number };
  };
}

export type IsetPrintingVersion = (
  text: string
) => {
  type: string;
  meta: string;
};

export type IupdatePrintingFile = (
  file: Partial<IprintingState["file"]>
) => {
  type: string;
  meta: typeof file;
};

export type IupdatePrintingGcode = (
  gcode: Partial<IprintingState["gcode"]>
) => {
  type: string;
  meta: typeof gcode;
};

export type IupdateGcodeLineType = (
  line: Partial<IprintingState["gcodeLineType"]>
) => {
  type: string;
  meta: typeof line;
};

export type IupdateClippingHeight = (
  height: number
) => {
  type: string;
  meta: typeof height;
};

export type IupdateControlPattern = (
  pattern: string
) => {
  type: string;
  meta: typeof pattern;
};

export type IupdateModel3Ddata = (
  data: Partial<IprintingState["model3Ddata"]>
) => {
  type: string;
  meta: typeof data;
};

export type IupdateConfigFile = (
  file: string
) => {
  type: string;
  meta: typeof file;
};

export type IupdateMaterial = (
  material: string
) => {
  type: string;
  meta: typeof material;
};

export type IupdateModel3Dsize = (
  size: Partial<IprintingState["model3Dsize"]>
) => {
  type: string;
  meta: typeof size;
};

export type IupdateModelDection = (
  bool: boolean
) => {
  type: string;
  meta: typeof bool;
};

export type IchangeIsometricRotation = (
  bool: boolean
) => {
  type: string;
  meta: typeof bool;
};
