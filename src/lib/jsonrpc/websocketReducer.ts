const updatePositionType = 'UPDATAPOSITION';
const updataRunningType = 'UPDATERUNNINGSTATE';
const initType = 'INIT';
const serialStatue = 'SERIALSTATUE';
const updateTemp = 'UPDATETEMP';
const wifiStatue = 'WIFISTATUE';
const updateProgram = 'UPDATEPROGRAM';
const updateErrorMsg = 'URDATEERRORMSG';
const endTransferFile = 'ENDTRANSFERFILE';
const endStop = 'ENDSTOP';
const sliceProgress = 'SLICEPROGRESS';
const readStlFiles = 'READSTLFILES';
const downloadNewFile = 'DOWNLOADNEWFILE';
export interface IinitState {
  positions: {
    x: number;
    y: number;
    z: number;
    e: number;
  };
  isRunning: boolean;
  serialConnected: boolean;
  wifiConnected: boolean;
  temp: number;
  fileProgram: number;
  error: string;
  transferFile: { fileMsg: { name: string; size: number } };
  endStop: number | null;
  sliceProgress: number;
  readStlFiles: any;
  downloadNewFile: { fileName: string; progress: number; savePath: string } | null;
}

export const initState: IinitState = {
  positions: {
    x: 0,
    y: 0,
    z: 0,
    e: 0
  },
  isRunning: false,
  serialConnected: false,
  wifiConnected: false,
  temp: 0,
  fileProgram: 0,
  error: '',
  transferFile: { fileMsg: { name: '', size: 0 } },
  endStop: null,
  sliceProgress: 0,
  readStlFiles: {},
  downloadNewFile: null
};
type actionType = typeof updatePositionType |
  typeof updataRunningType |
  typeof endTransferFile |
  typeof endStop |
  typeof updateErrorMsg |
  typeof initType |
  typeof serialStatue |
  typeof updateTemp |
  typeof wifiStatue |
  typeof updateProgram |
  typeof sliceProgress |
  typeof readStlFiles |
  typeof downloadNewFile

interface Iaction {
  type: actionType | string;
  payload: any;
}
export const websocketReducer = function (state = initState, action: Iaction) {
  switch (action.type) {
    case updatePositionType:
      return {
        ...state,
        positions: action.payload.positions
      };
    case updataRunningType:
      return {
        ...state,
        isRunning: action.payload.isRunning
      };
    case initType:
      return initState;
    case serialStatue:
      return {
        ...state,
        serialConnected: action.payload
      };
    case updateTemp:
      return {
        ...state,
        temp: action.payload
      };
    case wifiStatue:
      return {
        ...state,
        wifiConnected: action.payload
      };
    case updateProgram:
      return {
        ...state,
        fileProgram: action.payload
      };
    case updateErrorMsg:
      return {
        ...state,
        error: action.payload
      };
    case endTransferFile:
      return {
        ...state,
        transferFile: action.payload
      };
    case endStop:
      return {
        ...state,
        endStop: action.payload
      };
    case sliceProgress:
      return {
        ...state,
        sliceProgress: action.payload
      };
    case readStlFiles:
      return {
        ...state,
        readStlFiles: action.payload
      };
    case downloadNewFile:
      return {
        ...state,
        downloadNewFile: action.payload
      };
    default:
      return { ...state };
  }
};

export const updatePositionAction = (positions: typeof initState.positions) => ({
  type: updatePositionType,
  payload: { positions }
});

export const resetWebsocket = () => ({
  type: initType,
  payload: null
});

export const updateRunningAction = ({ isRunning }: { isRunning: boolean }) => ({
  type: updataRunningType,
  payload: { isRunning }
});

export const setSerialConnected = (connected: boolean) => ({
  type: serialStatue,
  payload: connected
});

export const setWifiConnected = (connected: boolean) => ({
  type: wifiStatue,
  payload: connected
});

export const updateTemperature = (temp: number) => ({
  type: updateTemp,
  payload: temp
});

export const updateTransferFileProgress = ({ progress }: { progress: number }) => ({
  type: updateProgram,
  payload: progress
});

export const updateError = ({ error }: { error: string }) => ({
  type: updateErrorMsg,
  payload: error
});

export const updateTransferFileMsg = (params: any) => ({
  type: endTransferFile,
  payload: params
});


export const updateEndStop = (params: any) => ({
  type: endStop,
  payload: params
});

export const updateSliceProgress = ({ progress }: { progress: number }) => {
  return ({
    type: sliceProgress,
    payload: progress
  });
};

export const updateReadStlFiles = (params: any) => {
  return ({
    type: readStlFiles,
    payload: params
  });
};

export const updateDownloadNewFile = (params: any) => {
  return ({
    type: downloadNewFile,
    payload: params
  });
};
