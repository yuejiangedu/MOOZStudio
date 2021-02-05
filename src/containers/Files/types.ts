
export const SET_HASFILEINFOS = "SET_HASFILEINFOS";
export interface IFilesState {
  hasFileInfos: boolean
}
export type IsetHasfileinfos = (
  text: any
) => {
  type: string;
  meta: typeof text;
};