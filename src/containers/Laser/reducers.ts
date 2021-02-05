import {
  SET_LASER_FILEINFO,
  SET_SAVE_JSON,
  SET_COORDSINFO,
  SET_BEAUTY_TYPE,
  SET_LASER_OPTION,
  SET_LASER_BEAUTY,
  SET_LASER_GENERATE,
  SET_LASER_FILTER,
  UPDATE_VISUAL_AIDS_BG,
  SET_ACTIVEOBJ,
  ILaserState,
} from "./types";
export const initState: ILaserState = {
  laserFileInfo: {
    url: "",
    name: "",
    size: 0,
    type: "",
  },
  saveJSON: {
    data: [],
    index: 0,
  },
  coordsInfo: {
    cvWidth: 0,
    cvHeight: 0,
    offsetXcoords: 0,
    offsetYcoords: 0,
  },
  beautyType: "gray",
  laserOption: {
    url: "",
    powerMin: 0,
    powerMax: 100,
    engravingSpeed: 300,
    border: 0,
    thres: 127,
    deadheadSpeed: 500,
  },
  laserBeautyData: {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    defaultWidth: 50, //mm,
    angle: 0,
  },
  laserFilter: {
    invert: false,
    noise: false,
    sketch: false,
  },
  laserAllowGenerate: false,
  visualAidsUrl: "",
  activeObj: {},
};

interface Iaction {
  type: string;
  meta: Partial<ILaserState>;
}

export const laserReducers = (state = initState, action: Iaction) => {
  const { type, meta } = action;
  switch (type) {
    case SET_LASER_FILEINFO:
      return Object.assign({}, state, {
        laserFileInfo: { ...state.laserFileInfo, ...meta },
      });
    case SET_SAVE_JSON:
      return Object.assign({}, state, { saveJSON: meta });
    case SET_COORDSINFO:
      return Object.assign({}, state, {
        coordsInfo: { ...state.coordsInfo, ...meta },
      });
    case SET_BEAUTY_TYPE:
      return Object.assign({}, state, { beautyType: meta });
    case SET_LASER_OPTION:
      return Object.assign({}, state, {
        laserOption: { ...state.laserOption, ...meta },
      });
    case SET_LASER_BEAUTY:
      return Object.assign({}, state, {
        laserBeautyData: { ...state.laserBeautyData, ...meta },
      });
    case SET_LASER_GENERATE:
      return Object.assign({}, state, { laserAllowGenerate: meta });
    case SET_LASER_FILTER:
      return Object.assign({}, state, {
        laserFilter: { ...state.laserFilter, ...meta },
      });
    case UPDATE_VISUAL_AIDS_BG:
      return Object.assign({}, state, { visualAidsUrl: meta });
    case SET_ACTIVEOBJ:
      return Object.assign({}, state, { activeObj: meta });
    default:
      return state;
  }
};
