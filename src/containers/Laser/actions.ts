import * as types from "./types";

export const setLaserFileInfo: types.IsetLaserFileInfo = (text) => {
  return {
    type: types.SET_LASER_FILEINFO,
    meta: text,
  };
};
export const setSaveJSON: types.IsetSaveJSON = (text) => {
  return {
    type: types.SET_SAVE_JSON,
    meta: text,
  };
};
export const setCoordsInfo: types.IsetCoordsInfo = (text) => {
  return {
    type: types.SET_COORDSINFO,
    meta: text,
  };
};
export const setBeautyType: types.IsetBeautyType = (text) => {
  return {
    type: types.SET_BEAUTY_TYPE,
    meta: text,
  };
};
export const setLaserOption: types.IsetLaserOption = (text) => {
  return {
    type: types.SET_LASER_OPTION,
    meta: text,
  };
};
export const setLaserBeautyData: types.IsetLaserBeautyData = (text) => {
  return {
    type: types.SET_LASER_BEAUTY,
    meta: text,
  };
};
export const setLaserGenerate: types.IsetLaserGenerate = (text) => {
  return {
    type: types.SET_LASER_GENERATE,
    meta: text,
  };
};
export const setLaserFilter: types.IsetLaserFilter = (text) => {
  return {
    type: types.SET_LASER_FILTER,
    meta: text,
  };
};
export const upDateVisualAidsBg: types.IupDateVisualAidsBg = (text) => {
  return {
    type: types.UPDATE_VISUAL_AIDS_BG,
    meta: text,
  };
};

export const setActiveObj: types.IsetActiveObj = (activeOBj: any) => {
  return {
    type: types.SET_ACTIVEOBJ,
    meta: activeOBj,
  };
};
