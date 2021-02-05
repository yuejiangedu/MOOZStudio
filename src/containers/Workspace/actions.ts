import * as types from './types'

export const updateMoozConnect: types.IupdateMoozConnect = (text) => {
  return {
    type: types.UPDATE_MOOZ_CONNECT,
    meta: text
  };
};
export const updateMoozObj: types.IupdateMoozObj = (text) => {
  return {
    type: types.UPDATE_MOOZ_OBJ,
    meta: text
  };
};
export const updateEndType: types.IupdateEndType = (text) => {
  return {
    type: types.UPDATE_END_TYPE,
    meta: text
  };
};

export const updateRunGcodeState: types.IupdateRunGcodeState = (text) => {
  return {
    type: types.UPDATE_RUNGCODESTATE,
    meta: text
  };
};
