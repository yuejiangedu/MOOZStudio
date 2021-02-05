import { createStore, combineReducers } from 'redux';
import { workspaceReducers } from '../containers/Workspace/reducers';
import { IWorkspaceState } from '../containers/Workspace/types';
import { settingReducers, ISettingState } from '../containers/Settings/reducers';
import { CNCReducers } from '../containers/CNC/reducers';
import { ICncState } from '../containers/CNC/types';
import { laserReducers } from '../containers/Laser/reducers';
import { ILaserState } from '../containers/Laser/types';
import { printingReducers } from '../containers/Printing/reducers';
import { IprintingState } from '../containers/Printing/types';
import { rootReducers } from './reducers';
import { Istate } from './type';
import { websocketReducer, IinitState } from '../lib/jsonrpc/websocketReducer';

import progressReducer from '../containers/Progress/reducers';
import { filesReducers } from '../containers/Files/reducers';
import { IFilesState } from '../containers/Files/types';

export type IrootState = {
  laserReducers: ILaserState;
  rootReducers: Istate;
  CNCReducers: ICncState;
  settingReducers: ISettingState;
  workspaceReducers: IWorkspaceState;
  websocketReducer: IinitState;
  printingReducers: IprintingState;
  filesReducers: IFilesState;
}


const reducer = combineReducers({
  laserReducers,
  workspaceReducers,
  CNCReducers,
  settingReducers,
  rootReducers,
  progressReducer,
  websocketReducer,
  printingReducers,
  filesReducers,
});


// eslint-disable-next-line new-cap
export default createStore(
  reducer
);
