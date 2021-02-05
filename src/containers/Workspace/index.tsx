import _ from 'lodash';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import pubsub from 'pubsub-js';
import React, { PureComponent, lazy } from 'react';
import { withRouter } from 'react-router-dom';
import * as History from 'history';
import { Layout, Modal } from 'antd';
import { withTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import log from '../../lib/log';
import { updateMoozConnect, updateMoozObj, updateEndType, updateRunGcodeState } from './actions';
import { setProgressAction } from '../Progress/reducers';
import { setGcode, setPrintTime, setCheckDoor, setGcodeSize } from '../../rootRedux/actions';
import moozHardware from '../../lib/jsonrpc/mooz';
import VisualizerWidget from '../../components/WorkspaceVisualizer';
import styles from './index.styl';
import ConnectionMooz from '../../components/ConnectionMooz';
import MoozAxes from '../../components/MoozAxes';
import Gcode from '../../components/Gcode';
import { SIDERWIDTH } from '../../constants';
import OnlinePrintTimer from '../../components/OnLinePrintTimer';
import ProgressComponent from '../Progress';
import { updateError, resetWebsocket, updateTransferFileMsg } from '../../lib/jsonrpc/websocketReducer';
import { changeDecimal } from '../../lib/units';
import { IrootState } from '../../rootRedux/index';
import DropDownContainer from '../../components/DropDownContainer';
import { burypageview, buryevent } from '../../lib/ganalysis/ganalysis';
import { getMac } from '../../lib/http/api';

const mapStateToProps = (state: IrootState) => {
  return {
    moozConnect: state.workspaceReducers.moozConnect,
    mooz: state.workspaceReducers.mooz,
    endType: state.workspaceReducers.endType,
    generateGcodeType: state.rootReducers.generateGcodeType,
    gcode: state.rootReducers.gcode,
    gcodeSize: state.rootReducers.gcodeSize,
    isCheckDoor: state.rootReducers.isCheckDoor,
    runGcodeState: state.workspaceReducers.runGcodeState,
    printTime: state.rootReducers.printTime,
    filePrg: state.websocketReducer.fileProgram,
    error: state.websocketReducer.error,
    transferFile: state.websocketReducer.transferFile,
    moozVersion: state.settingReducers.moozVersion,
  };
};
const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    updateMoozConnect: updateMoozConnect,
    updateMoozObj: updateMoozObj,
    updateEndType: updateEndType,
    setGcode: setGcode,
    updateRunGcodeState: updateRunGcodeState,
    setPrintTime: setPrintTime,
    setCheckDoor: setCheckDoor,
    setProgressAction: setProgressAction,
    updateError: updateError,
    resetWebsocket: resetWebsocket,
    updateTransferFileMsg: updateTransferFileMsg,
    setGcodeSize: setGcodeSize
  }, dispatch);
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>

interface Iprops extends PropsFromRedux {
  style: { display: string };
  t: (x: string) => string;
  location: History.Location;
}
interface Istate {
  mounted: boolean;
  port: string;
  isDraggingFile: boolean;
  countDown: number | undefined;
  Gcodeshow: string;
}

const { Sider, Content } = Layout;


class Workspace extends PureComponent<Iprops, Istate> {
  state = {
    mounted: false,
    port: '',
    isDraggingFile: false,
    countDown: undefined,
    Gcodeshow: 'block',
  }

  private updatePrg = true;

  private countDownSec = 10;

  private showOnlinePrintTimer = false;

  private pauseTimer = false;

  private countDownTimer: NodeJS.Timeout | null = null;

  private resizeDefaultContainer = () => {
    // Publish a 'resize' event
    pubsub.publish('resize'); // Also see "widgets/Visualizer"
  };

  private onResizeThrottled = _.throttle(this.resizeDefaultContainer, 50)

  onDrop = (files: File) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = (event) => {
      const { result, error } = (event.target as FileReader);

      if (error) {
        log.error(error);
        return;
      }

      log.debug('FileReader:', _.pick(file, [
        'lastModified',
        'lastModifiedDate',
        'meta',
        'name',
        'size',
        'type'
      ]));

      const name = file.name;
      const gcode = result;

      const Infos = {
        gcode: gcode,
        fileinfo: { name: name, size: 0 }
      };

      pubsub.publish('gcode:update', Infos);
    };

    try {
      reader.readAsText(file);
    } catch (err) {
      // Ignore error
    }
  };

  setClientID = () => {
    const id = localStorage.getItem('client_id');
    if (!id) {
      getMac().then((data: any) => {
        localStorage.setItem('client_id', data.data);
      }).catch((e: any) => {
        console.log('发生了错误', e);
      });
    }
  }

  componentDidMount() {
    this.addResizeEventListener();
    setTimeout(() => {
      // A workaround solution to trigger componentDidUpdate on initial render
      this.setState({ mounted: true });
    }, 0);
    this.setClientID();
  }

  componentWillUnmount() {
    this.removeResizeEventListener();
  }

  componentDidUpdate(pre: any) {
    if (this.props.location.pathname === '/workspace' && pre.location.pathname !== this.props.location.pathname) {
      burypageview({ 'page_path': '/workspace' });
    }
    const { runGcodeState } = this.props;

    this.resizeDefaultContainer();

    if (pre.runGcodeState.startPrint !== runGcodeState.startPrint) {
      this.showOnlinePrintTimer = runGcodeState.startPrint;
    }
    if (pre.runGcodeState.pausePrint !== runGcodeState.pausePrint) {
      this.pauseTimer = runGcodeState.pausePrint;
    }
    if (pre.filePrg !== this.props.filePrg) {
      this.updatePrg && this.showProgress();
    }
    if (pre.error !== this.props.error && this.props.error) {
      this.error();
    }
    if (pre.transferFile !== this.props.transferFile && this.props.transferFile) {
      this.successTransfer();
    }
  }

  cancelTransfer = () => {
    this.props.setProgressAction(0);
    this.updatePrg = false;
    moozHardware.stopTransmission();
    this.startCountDown();
  }

  successTransfer = debounce(() => {
    const { name, size } = this.props.transferFile.fileMsg;
    const { t } = this.props;
    this.startCountDown();
    Modal.success({
      title: t('transferSuccess'),
      style: {
        top: '50%',
        transform: 'translateY(-50%)'
      },
      content: (
        <div style={{ fontSize: '16px' }}>
          <p>{t('FileName')}: {name} </p>
          <p>{t('File Size')}: {changeDecimal(size / 1024, 3)} KB</p>
        </div>)
    });
    this.props.updateTransferFileMsg(null);
  }, 1000)

  error = debounce(() => {
    const { error, t } = this.props;
    this.props.setProgressAction(0);
    this.updatePrg = false;
    Modal.error({
      title: t('Error'),
      style: {
        top: '50%',
        transform: 'translateY(-50%)'
      },
      content: t(error),
      onOk: () => {
        this.props.updateError({ error: '' });
      }
    });
    if (!this.countDownTimer) {
      this.startCountDown();
    }
  }, 1000)

  handleClose = (key: string) => {
    this.updatePrg = false;
    moozHardware.disconnect().then((res: any) => {
      let eventName: string;
      key === 'serial' ? eventName = 'btn_disconnect_via_serialport' : eventName = 'btn_disconnect_via_wifi';
      if (res === 'ok') {
        this.props.resetWebsocket();
        key === 'wifi' && this.setState({
          countDown: 10
        }, this.startCountDown);
        buryevent(eventName, { 'event_category': 'workspace', 'event_label': 'success' });
      } else {
        buryevent(eventName, { 'event_category': 'workspace', 'event_label': `fail_${res}` });
      }
    });
  }

  startCountDown = () => {
    this.countDownTimer = setTimeout(() => {
      this.countDownSec--;
      if (this.countDownSec !== 0) {
        this.setState({
          countDown: this.countDownSec
        });
        this.startCountDown();
      } else {
        this.countDownSec = 10;
        this.countDownTimer = null;
        this.setState({
          countDown: undefined
        });
      }
    }, 1000);
  }


  transferGcode = () => {
    this.updatePrg = true;
    moozHardware.transferGcode(this.props.gcode).then((res: any) => {
      let ev: string;
      if (res === 'ok') {
        this.props.resetWebsocket();
        ev = 'success';
      } else {
        ev = `fail_${res}`;
      }
      buryevent('btn_send_gcode_via_wifi', { 'event_category': 'workspace', 'event_label': ev });
    });
  }


  addResizeEventListener() {
    window.addEventListener('resize', this.onResizeThrottled);
  }

  removeResizeEventListener() {
    window.removeEventListener('resize', this.onResizeThrottled);
  }

  showProgress() {
    this.props.setProgressAction(this.props.filePrg);
    if (this.props.filePrg === 100) {
      this.props.setProgressAction(0);
    }
  }

  getPrintProgress() {
    const { step } = this.props.runGcodeState;
    const gcodeList = this.props.gcode.split('\n');
    return Math.trunc(step / gcodeList.length * 100);
  }

  render() {
    const { style, gcodeSize, printTime, setPrintTime, t, setCheckDoor, isCheckDoor } = this.props;
    const {
      isDraggingFile,
      countDown,
      Gcodeshow
    } = this.state;
    const printProgress = this.getPrintProgress();
    const siderComponents = [
      {
        name: 'Connection',
        component: <ConnectionMooz
          setCheckDoor={setCheckDoor}
          handleClose={this.handleClose}
          transferGcode={this.transferGcode}
          isCheckDoor={isCheckDoor}
          countDown={countDown}
        />,
        suffix: null
      },
      {
        name: 'Axes',
        component: <MoozAxes />,
        suffix: null
      },
      {
        name: 'File',
        component: <Gcode gcodeSize={gcodeSize} Gcodeshow={Gcodeshow} />,
        suffix: null
      }

    ];
    return (
      <Layout style={style} className="mooz-content">
        <Content style={{ minWidth: '850px' }}>
          <div
            className={classNames(
              styles.dropzoneOverlay,
              { [styles.hidden]: !(isDraggingFile) }
            )}
          >
            <div className={styles.textBlock}>
              {t('Drop G-code file here')}
            </div>
          </div>
          <ProgressComponent showCancel={true} cancel={this.cancelTransfer} />
          <Dropzone
            className="mooz-content-box"
            disabled={false}
            disableClick={true}
            disablePreview={true}
            multiple={false}
            onDragEnter={() => {
              if (!isDraggingFile) {
                this.setState({ isDraggingFile: true });
              }
            }}
            onDragLeave={() => {
              if (isDraggingFile) {
                this.setState({ isDraggingFile: false });
              }
            }}
            onDrop={(acceptedFiles: boolean) => {
              if (isDraggingFile) {
                this.setState({ isDraggingFile: false });
              }
              this.onDrop(acceptedFiles);
            }}
          >
            <VisualizerWidget {...this.props} />
            <OnlinePrintTimer
              printTime={printTime} setPrintTime={setPrintTime} progress={printProgress}
              show={this.showOnlinePrintTimer}
              pause={this.pauseTimer}
            />
          </Dropzone>
        </Content>
        <Sider width={SIDERWIDTH} className="mooz-option-sider">
          <div>
            {
              siderComponents.map((component, index) => {
                return (
                  <DropDownContainer
                    title={t(component.name)}
                    content={component.component}
                    suffix={component.suffix}
                    key={index}
                  />
                );
              })
            }
          </div>
        </Sider>
      </Layout>

    );
  }
}


export default withRouter(connector(withTranslation()(Workspace)));
