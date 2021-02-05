import {
  UPDATE_MOOZ_CONNECT,
  UPDATE_MOOZ_OBJ,
  UPDATE_END_TYPE,
  UPDATE_RUNGCODESTATE,
  IWorkspaceState
} from './types';

export const initState: IWorkspaceState = {
  moozConnect: false,
  mooz: null,
  endType: null,
  runGcodeState: {
    startPrint: false,
    pausePrint: false,
    toggleBtn: false,
    step: 0
  }
};


interface Iaction {
  type: string;
  meta: Partial<IWorkspaceState>;
}

export const workspaceReducers = (state = initState, action: Iaction) => {
  const { type, meta } = action;
  switch (type) {
    case UPDATE_MOOZ_CONNECT: return Object.assign({}, state, { moozConnect: meta });
    case UPDATE_MOOZ_OBJ: return Object.assign({}, state, { mooz: meta });
    case UPDATE_END_TYPE: return Object.assign({}, state, { endType: meta });
    case UPDATE_RUNGCODESTATE: return Object.assign({}, state, { runGcodeState: { ...state.runGcodeState, ...meta } });
    default: return state;
  }
};
