import {
  SET_GCODE,
  SET_GENERATE_GCODE_TYPE,
  SET_GCODE_SIZE,
  SET_CHECK_DOOR,
  SET_PRINT_TIME,
  SET_PAGE,
  UPDATE_DPI,
  IsetGcode,
  IsetGenerateGcodeType,
  IsetGcodeSize,
  IsetCheckDoor,
  IsetPrintTime,
  IupdateDPI,
  IsetCurPage,
} from './type';

export const setGcode: IsetGcode = (text) => {
  return {
    type: SET_GCODE,
    meta: text,
  };
};
export const setGenerateGcodeType: IsetGenerateGcodeType = (text) => {
  return {
    type: SET_GENERATE_GCODE_TYPE,
    meta: text,
  };
};
export const setGcodeSize: IsetGcodeSize = (text) => {
  return {
    type: SET_GCODE_SIZE,
    meta: text,
  };
};
export const setCheckDoor: IsetCheckDoor = (text) => {
  return {
    type: SET_CHECK_DOOR,
    meta: text,
  };
};

export const setPrintTime: IsetPrintTime = (text: number) => {
  return {
    type: SET_PRINT_TIME,
    meta: text,
  };
};

export const updateDPI: IupdateDPI = (text: number) => {
  return {
    type: UPDATE_DPI,
    meta: text,
  };
};

export const setCurPage: IsetCurPage = (text: string) => {
  return {
    type: SET_PAGE,
    meta: text,
  };
};
