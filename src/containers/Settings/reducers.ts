import { loadState } from '../../lib/localStorage';

export const initState = loadState() || {
  moozVersion: '200'
};

interface Iaction {
  type: string;
  meta: string;
}
export const settingReducers = (state = initState, actions: Iaction) => {
  switch (actions.type) {
    case 'SET_MOOZ_VERSION':
      return Object.assign({}, state, { moozVersion: actions.meta });
    default:
      return state;
  }
};

export interface ISettingState {
  moozVersion: string
};