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
  IprintingState,
} from "./types";

export const initState: IprintingState = {
  printingVersion: "MOOZ-2 PLUS",
  file: {
    name: "",
    size: 0,
    type: "",
    path: "",
  },
  gcode: {
    data: "",
    msg: {
      gcodeFilename: "",
      printTime: 0,
      filamentLength: 0,
      filamentWeight: 0,
      gcodeFilePath: "",
    },
  },
  clippingHeight: 100,
  controlPattern: "MOVE",
  configFile: "fast_print",
  printMaterial: "pla",
  model3Ddata: {
    moveX: 0,
    moveY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    rotateMatrix: "[[1, 0, 0], [0, 1, 0], [0, 0, 1]]",
  },
  isometricRotation: true,
  model3Dsize: {
    modelSize: { widthX: 0, widthY: 0, height: 0 },
    orgModelSize: { widthX: 0, widthY: 0, height: 0 },
  },
  modelDetection: false,
  gcodeLineType: [
    {
      label: "WALL-INNER",
      value: true,
      color: [0, 255, 0],
      typeCode: 1,
      visible: "u_wall_inner_visible",
    },
    {
      label: "WALL-OUTER",
      value: true,
      color: [255, 33, 33],
      typeCode: 2,
      visible: "u_wall_outer_visible",
    },
    {
      label: "SKIN",
      value: true,
      color: [255, 255, 0],
      typeCode: 3,
      visible: "u_skin_visible",
    },
    {
      label: "SKIRT",
      value: true,
      color: [250, 140, 53],
      typeCode: 4,
      visible: "u_skirt_visible",
    },
    {
      label: "SUPPORT",
      value: true,
      color: [75, 0, 130],
      typeCode: 5,
      visible: "u_support_visible",
    },
    {
      label: "FILL",
      value: true,
      color: [141, 75, 187],
      typeCode: 6,
      visible: "u_fill_visible",
    },
    {
      label: "TRAVEL",
      value: false,
      color: [68, 206, 246],
      typeCode: 7,
      visible: "u_travel_visible",
    },
    {
      label: "UNKNOWN",
      value: true,
      color: [75, 0, 130],
      typeCode: 8,
      visible: "u_unknown_visible",
    },
  ],
};

interface Iaction {
  type: string;
  meta: Partial<IprintingState>;
}

export const printingReducers = (state = initState, action: Iaction) => {
  if (action.type === SET_PRINTING_VERSION) {
    return Object.assign({}, state, { printingVersion: action.meta });
  }
  if (action.type === UPDATE_PRINTING_FILE) {
    return Object.assign({}, state, { file: action.meta });
  }
  if (action.type === UPDATE_PRINTING_GCODE) {
    return Object.assign({}, state, {
      gcode: { ...state.gcode, ...action.meta },
    });
  }
  if (action.type === UPDATE_GCODE_LINETYPE) {
    return Object.assign({}, state, { gcodeLineType: action.meta });
  }
  if (action.type === UPDATE_CLIPPING_HEIGHT) {
    return Object.assign({}, state, { clippingHeight: action.meta });
  }
  if (action.type === UPDATE_CONTROL_PATTERN) {
    return Object.assign({}, state, { controlPattern: action.meta });
  }
  if (action.type === UPDATE_MODEL3D_DATA) {
    return Object.assign({}, state, {
      model3Ddata: { ...state.model3Ddata, ...action.meta },
    });
  }
  if (action.type === UPDATE_CONFIG_FILE) {
    return Object.assign({}, state, { configFile: action.meta });
  }
  if (action.type === UPDATE_MATERIAL) {
    return Object.assign({}, state, { printMaterial: action.meta });
  }
  if (action.type === UPDATE_MODEL3D_SIZE) {
    return Object.assign({}, state, {
      model3Dsize: { ...state.model3Dsize, ...action.meta },
    });
  }
  if (action.type === UPDATE_MODEL_DECTION) {
    return Object.assign({}, state, { modelDetection: action.meta });
  }
  if (action.type === CHANGE_ISOMETRIC_ROTATION) {
    return Object.assign({}, state, { isometricRotation: action.meta });
  }
  return state;
};
