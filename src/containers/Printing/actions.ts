import {
  SET_PRINTING_VERSION,
  UPDATE_PRINTING_FILE,
  UPDATE_PRINTING_GCODE,
  UPDATE_GCODE_LINETYPE,
  UPDATE_CLIPPING_HEIGHT,
  UPDATE_CONTROL_PATTERN,
  UPDATE_MODEL3D_DATA,
  UPDATE_CONFIG_FILE,
  UPDATE_MATERIAL,
  UPDATE_MODEL3D_SIZE,
  UPDATE_MODEL_DECTION,
  CHANGE_ISOMETRIC_ROTATION,
  IsetPrintingVersion,
  IupdatePrintingFile,
  IupdatePrintingGcode,
  IupdateGcodeLineType,
  IupdateClippingHeight,
  IupdateControlPattern,
  IupdateModel3Ddata,
  IupdateConfigFile,
  IupdateMaterial,
  IupdateModel3Dsize,
  IupdateModelDection,
  IchangeIsometricRotation,
} from "./types";

export const setPrintingVersion: IsetPrintingVersion = (text: string) => {
  return {
    type: SET_PRINTING_VERSION,
    meta: text,
  };
};

export const updatePrintingFile: IupdatePrintingFile = (file: {
  name: string;
  size: number;
  type: string;
  path: string;
}) => {
  return {
    type: UPDATE_PRINTING_FILE,
    meta: file,
  };
};

export const updatePrintingGcode: IupdatePrintingGcode = (gcode) => {
  return {
    type: UPDATE_PRINTING_GCODE,
    meta: gcode,
  };
};

export const updateGcodeLineType: IupdateGcodeLineType = (line) => {
  return {
    type: UPDATE_GCODE_LINETYPE,
    meta: line,
  };
};

export const updateClippingHeight: IupdateClippingHeight = (height) => {
  return {
    type: UPDATE_CLIPPING_HEIGHT,
    meta: height,
  };
};

export const updateControlPattern: IupdateControlPattern = (pattern) => {
  return {
    type: UPDATE_CONTROL_PATTERN,
    meta: pattern,
  };
};

export const updateModel3Ddata: IupdateModel3Ddata = (data) => {
  return {
    type: UPDATE_MODEL3D_DATA,
    meta: data,
  };
};

export const updateConfigFile: IupdateConfigFile = (name) => {
  return {
    type: UPDATE_CONFIG_FILE,
    meta: name,
  };
};

export const updateMaterial: IupdateMaterial = (name) => {
  return {
    type: UPDATE_MATERIAL,
    meta: name,
  };
};

export const updateModel3Dsize: IupdateModel3Dsize = (size) => {
  return {
    type: UPDATE_MODEL3D_SIZE,
    meta: size,
  };
};

export const updateModelDection: IupdateModelDection = (size) => {
  return {
    type: UPDATE_MODEL_DECTION,
    meta: size,
  };
};

export const changeIsometricRotation: IchangeIsometricRotation = (size) => {
  return {
    type: CHANGE_ISOMETRIC_ROTATION,
    meta: size,
  };
};

export interface IprintingActions {
  setPrintingVersion: IsetPrintingVersion;
  updatePrintingFile: IupdatePrintingFile;
  updatePrintingGcode: IupdatePrintingGcode;
  updateGcodeLineType: IupdateGcodeLineType;
  updateClippingHeight: IupdateClippingHeight;
  updateControlPattern: IupdateControlPattern;
  updateModel3Ddata: IupdateModel3Ddata;
  updateMaterial: IupdateMaterial;
  updateConfigFile: IupdateConfigFile;
  updateModel3Dsize: IupdateModel3Dsize;
  updateModelDection: IupdateModelDection;
  changeIsometricRotation: IchangeIsometricRotation;
}
