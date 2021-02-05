import {
  Istate,
  SET_GCODE,
  SET_GENERATE_GCODE_TYPE,
  SET_GCODE_SIZE,
  SET_CHECK_DOOR,
  SET_PRINT_TIME,
  UPDATE_DPI,
  SET_PAGE,
} from './type';

export const initState: Istate = {
  gcode: '',
  progressPercent: 0,
  DPI: 96,
  generateGcodeType: '',
  gcodeSize: {
    xmin: 0,
    xmax: 0,
    ymin: 0,
    ymax: 0,
    zmin: 0,
    zmax: 0,
  },
  isCheckDoor: true,
  printTime: 0,
  page: '',
};

type Iaction = {
  type: string;
  meta: Partial<Istate>;
};

export const rootReducers = (state = initState, action: Iaction) => {
  const { type, meta } = action;
  switch (type) {
    case SET_GCODE:
      return Object.assign({}, state, { gcode: meta });
    case SET_GENERATE_GCODE_TYPE:
      return Object.assign({}, state, { generateGcodeType: meta });
    case SET_GCODE_SIZE:
      return Object.assign({}, state, {
        gcodeSize: { ...state.gcodeSize, ...meta },
      });
    case SET_CHECK_DOOR:
      return Object.assign({}, state, { isCheckDoor: meta });
    case SET_PRINT_TIME:
      return Object.assign({}, state, { printTime: meta });
    case UPDATE_DPI:
      return Object.assign({}, state, { DPI: meta });
    case SET_PAGE:
      return Object.assign({}, state, { page: meta });
    default:
      return state;
  }
};
