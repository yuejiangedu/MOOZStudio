export const UPDATE_MOOZ_CONNECT = 'UPDATE_MOOZ_CONNECT';
export const UPDATE_MOOZ_OBJ = 'UPDATE_MOOZ_OBJ';
export const UPDATE_END_TYPE = 'UPDATE_END_TYPE';
export const UPDATE_RUNGCODESTATE = 'UPDATE_RUNGCODESTATE';

export interface IWorkspaceState {
  moozConnect: boolean,
  mooz: null,
  endType: null,
  runGcodeState: {
    startPrint: boolean,
    pausePrint: boolean,
    toggleBtn: boolean,
    step: number
  }
};

export type IupdateMoozConnect = (text: boolean) => {
  type: string;
  meta: typeof text;
};
export type IupdateMoozObj = (text: Partial<IWorkspaceState["mooz"]>) => {
  type: string;
  meta: typeof text;
};
export type IupdateEndType = (text: Partial<IWorkspaceState["endType"]>) => {
  type: string;
  meta: typeof text;
};
export type IupdateRunGcodeState = (text: Partial<IWorkspaceState["runGcodeState"]>) => {
  type: string;
  meta: typeof text;
};