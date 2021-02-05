export const SET_GCODE = 'SET_GCODE';
export const SET_GENERATE_GCODE_TYPE = 'SET_GENERATE_GCODE_TYPE';
export const SET_GCODE_SIZE = 'SET_GCODE_SIZE';
export const SET_CHECK_DOOR = 'SET_CHECK_DOOR';
export const SET_PRINT_TIME = 'SET_PRINT_TIME';
export const UPDATE_DPI = 'UPDATE_DPI';
export const SET_PAGE = 'SET_PAGE';

export type Istate = {
  gcode: string;
  progressPercent: number;
  DPI: number;
  generateGcodeType: string;
  gcodeSize: {
    xmin: number;
    xmax: number;
    ymin: number;
    ymax: number;
    zmin: number;
    zmax: number;
  };
  isCheckDoor: boolean;
  printTime: number;
  page: string;
};

export type IsetGcode = (
  text: string
) => {
  type: string;
  meta: string;
};

export type IsetGcodeSize = (
  text: string
) => {
  type: string;
  meta: string;
};

export type IsetPrintTime = (
  text: number
) => {
  type: string;
  meta: number;
};

export type IupdateDPI = (
  text: number
) => {
  type: string;
  meta: number;
};

export type IsetGenerateGcodeType = (
  text: string
) => {
  type: string;
  meta: string;
};

export type IsetCheckDoor = (
  text: string
) => {
  type: string;
  meta: string;
};

export type IsetCurPage = (
  text: string
) => {
  type: string;
  meta: string;
};
