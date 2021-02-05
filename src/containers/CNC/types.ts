export const UPDATE_PLAN = "UPDATE_PLAN";
export const SET_CNC_FILEINFO = "SET_CNC_FILEINFO";
export const SET_CNC_RGBA = "SET_CNC_RGBA";
export const SET_CNC_OPTION = "SET_CNC_OPTION";
export const SET_CNC_GENERATE = "SET_CNC_GENERATE";
export const SET_CNC_TEXTTYPE = "SET_CNC_TEXTTYPE";
export const UPDATE_CNC_TEXT = "UPDATE_CNC_TEXT";
export const SET_CAMERAPOSITION = "SET_CAMERAPOSITION";
export interface ICncState {
  plane: {
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    defaultWidth?: number;
    angle?: number;
    rotateZ?: number;
    active?: boolean;
    rgba?: number[];
  };
  cncTextType: number;
  cncFileInfo: {
    name?: string;
    size?: number;
    type?: string;
    url?: string;
    originUrl?: string;
  };
  cncRGBA: ImageData;
  cncOption: {
    cncSpeed: number;
    saveHeight: number;
    curvingMax: number;
    depth: number;
    cncThres: number;
    carvingTool: string;
    deadheadSpeed: number;
    cuttingAngulus: number;
    cuttingDiameter: number;
    openToolDefinition: boolean;
    flatEndMillSize: number;
  };
  cncAllowGenerate: boolean;
  cncText: Array<{
    textType: string;
    text: string;
    width: number;
    height: number;
    active: boolean;
    scale: { x: number; y: number };
    position: { x: number; y: number };
    rotationZ: number;
    angle: number;
    scaleX: number;
    scaleY: number;
    x: number;
    y: number;
    name: string;
  }>;
  cameraPosition: string[];
}

export type IupdatePlane = (
  text: Partial<ICncState["plane"]>
) => {
  type: string;
  meta: typeof text;
};

export type IsetCNCFileInfo = (
  text: Partial<ICncState["cncFileInfo"]>
) => {
  type: string;
  meta: typeof text;
};

export type IsetCNCRgbaPixel = (
  text: ImageData | null
) => {
  type: string;
  meta: typeof text;
};

export type IsetCncOption = (
  text: Partial<ICncState["cncOption"]>
) => {
  type: string;
  meta: typeof text;
};

export type IsetCncGenerate = (
  text: boolean
) => {
  type: string;
  meta: boolean;
};

export type IsetCncTextType = (
  text: number
) => {
  type: string;
  meta: number;
};

export type IupdateCncText = (
  text: string[]
) => {
  type: string;
  meta: string[];
};

export type IsetCameraPosition = (
  text: string[]
) => {
  type: string;
  meta: string[];
};
