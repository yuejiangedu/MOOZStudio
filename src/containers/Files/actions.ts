import * as types from "./types";

export const setHasFileInfos: types.IsetHasfileinfos = (meta: any) => {
  return {
    type: types.SET_HASFILEINFOS,
    meta: meta,
  };
};
