/* eslint-disable no-await-in-loop */
import pubsub from 'pubsub-js';
import DJ from './dobot-jsonprotocol';
import ReduxStore from '../../rootRedux';
import {
  updatePositionAction,
  updateRunningAction,
  resetWebsocket,
  updateTemperature,
  updateTransferFileProgress,
  updateError,
  updateTransferFileMsg,
  updateDownloadNewFile,
  updateEndStop,
  updateSliceProgress,
  updateReadStlFiles
} from './websocketReducer';

class MOOZHardware extends DJ {
  protected sendRequest: any;

  static gcode = 'GCODE'

  static search = 'SEARCH'

  static connect = 'CONNECT'

  static disconnect = 'DISCONNECT'

  static getPose = 'GETPOSE'

  static getTemp = 'GETTEMP'

  static running = 'RUNNING'

  static error = 'ERROR'

  static transfer = 'TRANSFER'

  static transferGcode = 'TRANSFERGCODE'

  static updateError = 'UPDATEERROR'

  static endTransferFile = 'ENDTRANSFERFILE'

  static endStop = 'ENDSTOP'

  static stopTransmission = 'STOPTRANSMISSION'

  static sliceProgress = 'SLICEPROGRESS';

  static readStlFiles = 'READSTLFILES';

  static downloadNewFile = 'DOWNLOADNEWFILE'

  transferGcode(gcode: string) {
    return this.sendRequest(MOOZHardware.transfer, { gcode });
  }

  connect(opt: any) {
    return this.sendRequest(MOOZHardware.connect, { ...opt });
  }

  stopTransmission() {
    return this.sendRequest(MOOZHardware.stopTransmission);
  }


  disconnect() {
    return this.sendRequest(MOOZHardware.disconnect);
  }

  searchList() {
    return this.sendRequest(MOOZHardware.search);
  }

  setInitPoint() {
    return this.sendRequest(MOOZHardware.gcode, { gcode: 'D20' });
  }

  goToWorkOrigin() {
    this.sendRequest(MOOZHardware.gcode, { gcode: 'G28' });
    this.sendRequest(MOOZHardware.gcode, { gcode: 'G1 X0 Y0 Z0 F3000' });
  }

  /**
     * 转化为相对运动
     */
  convertToRelativeMove() {
    return this.sendRequest(MOOZHardware.gcode, { gcode: 'G91' });
  }

  /**
     * 转化为绝对运动
     */
  convertToAbsoluteMove() {
    return this.sendRequest(MOOZHardware.gcode, { gcode: 'G90' });
  }

  /**
     * 传输 GCode 字符串
     * @param {string} gcode GCode 字符串
     */
  writeGcode(gcode: string) {
    return this.sendRequest(MOOZHardware.gcode, { gcode });
  }

  /**
     * 点动控制
     */
  move(dir: string) {
    this.sendRequest(MOOZHardware.gcode, { 'gcode': 'G91' });
    this.sendRequest(MOOZHardware.gcode, { 'gcode': `G1 ${dir} F3000` });
    this.sendRequest(MOOZHardware.gcode, { 'gcode': 'G90' });
  }

  /**
     * 回零
     */
  setHome(dir: string) {
    this.sendRequest(MOOZHardware.gcode, { 'gcode': `G28 ${dir}`.trim() });
  }

  /**
     * 获取姿势
     */
  getPose() {
    return this.sendRequest('vm.Mooz.GetPose', null);
  }

  /**
     * 获取温度
     */
  getTemperature() {
    return this.sendRequest(MOOZHardware.getTemp, null);
  }

  /**
     * 获取功率
     */
  getPower() {
    return this.sendRequest('vm.Mooz.GetPower', null);
  }

  /**
     * 获取末端类型
     */
  getEndType() {
    return this.sendRequest('vm.Mooz.GetEndType', null);
  }

  /**
     * 获取运行状态
     */
  getRunningState() {
    return this.sendRequest('vm.Mooz.GetRunningState', null);
  }

  /**
     * 获取自动调平参数
     */
  getAutoLevellingParams() {
    return this.sendRequest('vm.Mooz.GetAutoLevellingParams', null);
  }

  // eslint-disable-next-line class-methods-use-this
  handleSocketClose() {
    ReduxStore.dispatch(resetWebsocket());
  }

  // eslint-disable-next-line class-methods-use-this
  _handleReport({ method, params }: { method: string, params: any }) {
    switch (method) {
      case MOOZHardware.getPose:
        ReduxStore.dispatch(updatePositionAction(params));
        break;
      case MOOZHardware.running:
        ReduxStore.dispatch(updateRunningAction(params));
        pubsub.publish('checkRunning', params);
        break;
      case MOOZHardware.getTemp:
        ReduxStore.dispatch(updateTemperature(params));
        break;
      case MOOZHardware.gcode:
        pubsub.publish('writeGcode', params);
        break;
      case MOOZHardware.error:
        ReduxStore.dispatch(resetWebsocket());
        break;
      case MOOZHardware.transferGcode:
        ReduxStore.dispatch(updateTransferFileProgress(params));
        break;
      case MOOZHardware.updateError:
        ReduxStore.dispatch(updateError(params));
        break;
      case MOOZHardware.endTransferFile:
        ReduxStore.dispatch(updateTransferFileMsg(params));
        break;
      case MOOZHardware.endStop:
        ReduxStore.dispatch(updateEndStop(params));
        break;
      case MOOZHardware.sliceProgress:
        ReduxStore.dispatch(updateSliceProgress(params));
        break;
      case MOOZHardware.readStlFiles:
        ReduxStore.dispatch(updateReadStlFiles(params));
        break;
      case MOOZHardware.downloadNewFile:
        ReduxStore.dispatch(updateDownloadNewFile(params));
        break;
      default:
        break;
    }
  }
}
const addr = 'ws://localhost:9094';
const moozHardware = new MOOZHardware(addr);
moozHardware.init();
export default moozHardware;
