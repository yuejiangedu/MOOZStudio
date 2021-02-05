import {
  UPDATE_PLAN,
  SET_CNC_FILEINFO,
  SET_CNC_RGBA,
  SET_CNC_OPTION,
  SET_CNC_GENERATE,
  SET_CNC_TEXTTYPE,
  UPDATE_CNC_TEXT,
  SET_CAMERAPOSITION,
  ICncState,
} from "./types";

export const initState: ICncState = {
  plane: {
    name: "plane",
    x: 0, //mm
    y: 0, //mm
    width: 400,
    height: 400,
    scaleX: 1,
    scaleY: 1,
    defaultWidth: 40, //mm,
    angle: 0,
    rotateZ: 0,
    active: false,
    rgba: [],
  },
  cncTextType: 0,
  cncFileInfo: {
    name: "",
    size: 0,
    type: "",
    url: "",
    originUrl: "",
  },
  cncRGBA: {
    data: new Uint8ClampedArray(),
    height: 0,
    width: 0,
  },
  cncOption: {
    cncSpeed: 200,
    saveHeight: 1,
    curvingMax: 1.5,
    depth: 1.5,
    cncThres: 50,
    carvingTool: "vBit",
    deadheadSpeed: 200,
    cuttingAngulus: 200,
    cuttingDiameter: 0.3,
    openToolDefinition: false,
    flatEndMillSize: 1.5,
  },
  cncAllowGenerate: false,
  cncText: [],
  cameraPosition: ["top"],
};

interface Iaction {
  type: string;
  meta: Partial<ICncState>;
}

export const CNCReducers = (state = initState, action: Iaction) => {
  const { type, meta } = action;
  switch (type) {
    case UPDATE_PLAN:
      return Object.assign({}, state, { plane: { ...state.plane, ...meta } });
    case SET_CNC_FILEINFO:
      return Object.assign({}, state, {
        cncFileInfo: { ...state.cncFileInfo, ...meta },
      });
    case SET_CNC_RGBA:
      return Object.assign({}, state, { cncRGBA: meta });
    case SET_CNC_OPTION:
      return Object.assign({}, state, {
        cncOption: { ...state.cncOption, ...meta },
      });
    case SET_CNC_GENERATE:
      return Object.assign({}, state, { cncAllowGenerate: meta });
    case SET_CNC_TEXTTYPE:
      return Object.assign({}, state, { cncTextType: meta });
    case UPDATE_CNC_TEXT:
      return Object.assign({}, state, { cncText: meta });
    case SET_CAMERAPOSITION:
      return Object.assign({}, state, { cameraPosition: meta });
    default:
      return state;
  }
};
