import * as types from './types'
export const updatePlane: types.IupdatePlane = (text) => {
  return {
    type: types.UPDATE_PLAN,
    meta: text
  };
};

export const setCNCFileInfo: types.IsetCNCFileInfo = (text) => {
  return {
    type: types.SET_CNC_FILEINFO,
    meta: text
  };
};

export const setCNCRgbaPixel: types.IsetCNCRgbaPixel = (text) => {
  return {
    type: types.SET_CNC_RGBA,
    meta: text
  };
};
export const setCncOption: types.IsetCncOption = (text) => {
  return {
    type: types.SET_CNC_OPTION,
    meta: text
  };
};
export const setCncGenerate: types.IsetCncGenerate = (text) => {
  return {
    type: types.SET_CNC_GENERATE,
    meta: text
  };
};
export const setCncTextType: types.IsetCncTextType = (text) => {
  return {
    type: types.SET_CNC_TEXTTYPE,
    meta: text
  };
};


export const updateCncText: types.IupdateCncText = (text) => {
  return {
    type: 'UPDATE_CNC_TEXT',
    meta: text
  };
};


export const setCameraPosition = (text) => {
  return {
    type: 'SET_CAMERAPOSITION',
    meta: text
  };
};
