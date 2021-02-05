export const SET_LASER_FILEINFO = "SET_LASER_FILEINFO";
export const SET_SAVE_JSON = "SET_SAVE_JSON";
export const SET_COORDSINFO = "SET_COORDSINFO";
export const SET_BEAUTY_TYPE = "SET_BEAUTY_TYPE";
export const SET_LASER_OPTION = "SET_LASER_OPTION";
export const SET_LASER_BEAUTY = "SET_LASER_BEAUTY";
export const SET_LASER_GENERATE = "SET_LASER_GENERATE";
export const SET_LASER_FILTER = "SET_LASER_FILTER";
export const UPDATE_VISUAL_AIDS_BG = "UPDATE_VISUAL_AIDS_BG";
export const SET_ACTIVEOBJ = "SET_ACTIVEOBJ";

export interface ILaserState {
  laserFileInfo: {
    url: string;
    name: string;
    size: number;
    type: string;
  };
  saveJSON: {
    data: string[];
    index: number;
  };
  coordsInfo: {
    cvWidth: number;
    cvHeight: number;
    offsetXcoords: number;
    offsetYcoords: number;
  };
  beautyType: string;
  laserOption: {
    url: string;
    powerMin: number;
    powerMax: number;
    engravingSpeed: number;
    border: number;
    thres: number;
    deadheadSpeed: number;
  };
  laserBeautyData: {
    left: number;
    top: number;
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    defaultWidth: number;
    angle: number;
  };
  laserFilter: {
    invert: boolean;
    noise: boolean;
    sketch: boolean;
  };
  laserAllowGenerate: boolean;
  visualAidsUrl: string;
  activeObj: any;
}

export type IsetLaserFileInfo = (
  text: Partial<ILaserState["laserFileInfo"]>
) => {
  type: string;
  meta: typeof text;
};

export type IsetSaveJSON = (
  text: Partial<ILaserState["saveJSON"]>
) => {
  type: string;
  meta: typeof text;
};
export type IsetCoordsInfo = (
  text: Partial<ILaserState["coordsInfo"]>
) => {
  type: string;
  meta: typeof text;
};
export type IsetBeautyType = (
  text: string
) => {
  type: string;
  meta: typeof text;
};
export type IsetLaserOption = (
  text: Partial<ILaserState["laserOption"]>
) => {
  type: string;
  meta: typeof text;
};
export type IsetLaserBeautyData = (
  text: Partial<ILaserState["laserBeautyData"]>
) => {
  type: string;
  meta: typeof text;
};
export type IsetLaserGenerate = (
  text: boolean
) => {
  type: string;
  meta: typeof text;
};
export type IsetLaserFilter = (
  text: Partial<ILaserState["laserFilter"]>
) => {
  type: string;
  meta: typeof text;
};
export type IupDateVisualAidsBg = (
  text: string
) => {
  type: string;
  meta: typeof text;
};
export type IsetActiveObj = (
  text: any
) => {
  type: string;
  meta: typeof text;
};
