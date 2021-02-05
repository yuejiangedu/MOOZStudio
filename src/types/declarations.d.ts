declare module "*.styl" {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}

declare module "universal-logger" {
  export const TRACE: any;
  export const DEBUG: any;
  export const INFO: any;
  export const WARN: any;
  export const ERROR: any;
}

declare module "gcanvas/lib/font" {
  const Font: any;
  export default Font;
}

declare module "pubsub-js" {
  const pubsub: any;
  export default pubsub;
}

