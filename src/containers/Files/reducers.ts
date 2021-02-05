import {
  SET_HASFILEINFOS,
  IFilesState,
} from "./types";
export const initState: IFilesState = {
  hasFileInfos: false
};

interface Iaction {
  type: string;
  meta: Partial<IFilesState>;
}

export const filesReducers = (state = initState, action: Iaction) => {
  const { type, meta } = action;
  switch (type) {
    case SET_HASFILEINFOS:
      return Object.assign({}, state, { hasFileInfos: meta });
    default:
      return state;
  }
};
