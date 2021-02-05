import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import { connect } from 'react-redux';
import pubsub from 'pubsub-js';
import { withTranslation } from 'react-i18next';
import moozHardware from '../../lib/jsonrpc/mooz';
import styles from './index.styl';
import { Tooltip } from '../Tooltip';
import { buryevent } from '../../lib/ganalysis/ganalysis';

interface Iprops {
  gcode: string;
  isRunning: boolean;
  serialConnected: boolean;
  temp: number;
  isCheckDoor: boolean;
  runGcodeState: any;
  updateRunGcodeState: (state: any) => void;
  t: (str: string) => string;
}

class SportControl extends Component<Iprops> {
  step = 0;

  state = {
    modalShow: false
  }

  gcodeQueue: Array<any> = [];

  componentDidMount() {
    pubsub.subscribe('writeGcode', () => {
      this.waitToWriteGcode();
    });
  }

  async waitToWriteGcode() {
    const { gcode, serialConnected, runGcodeState, updateRunGcodeState } = this.props;
    const { pausePrint, startPrint, step } = runGcodeState;
    const gcodeList = gcode.split('\n');
    const currentGcode = this.gcodeQueue.shift();
    if (step <= gcodeList.length - 1 && serialConnected && startPrint) {
      if (!pausePrint) {
        this.gcodeQueue.push(moozHardware.writeGcode(gcodeList[step]));
        updateRunGcodeState({
          step: step + 1
        });
        await currentGcode;
      }
    } else {
      this.initState();
    }
  }

  writeGcode() {
    const { gcode, serialConnected, runGcodeState, updateRunGcodeState } = this.props;
    const { pausePrint, startPrint, step } = runGcodeState;
    const gcodeList = gcode.split('\n');
    if (step <= gcodeList.length - 1 && serialConnected && startPrint) {
      if (!pausePrint) {
        if (this.gcodeQueue.length < 8) {
          this.gcodeQueue.push(moozHardware.writeGcode(gcodeList[step]));
          updateRunGcodeState({
            step: step + 1
          });
          this.writeGcode();
        } else {
          this.waitToWriteGcode();
        }
      }
    } else {
      this.initState();
    }
  }

  startRun = () => {
    this.props.updateRunGcodeState({
      startPrint: true,
      pausePrint: false,
      toggleBtn: true
    });
    setTimeout(() => {
      this.writeGcode();
    }, 100);
    buryevent('btn_start_print', { 'event_category': 'workspace' });
  }

  getTemp = () => {
    const { t } = this.props;
    if (this.props.temp >= 100 || !this.props.isCheckDoor) {
      this.startRun();
    } else {
      Modal.confirm({
        title: t('Protective Shield Disconnect'),
        content: '',
        okText: t('OK'),
        cancelText: t('Cancel'),
      });
    }
  }

  stopRun = () => {
    this.timeOutStop();
  }

  timeOutStop = () => {
    const timer = setTimeout(async () => {
      const { isRunning } = this.props;
      if (!isRunning && this.props.runGcodeState.startPrint) {
        await moozHardware.writeGcode('M106 S0');
        await moozHardware.writeGcode('G28');
        this.initState();
      } else {
        clearTimeout(timer);
        this.timeOutStop();
      }
    }, 300);
    buryevent('btn_stop_print', { 'event_category': 'workspace' });
  }

  pauseRun = async () => {
    this.props.updateRunGcodeState({
      startPrint: true,
      pausePrint: true,
      toggleBtn: false
    });
    await moozHardware.writeGcode('G1 Z1 S0');
    buryevent('btn_pause_print', { 'event_category': 'workspace' });
  }

  initState = () => {
    this.props.updateRunGcodeState({
      startPrint: false,
      pausePrint: false,
      toggleBtn: false,
      step: 0
    });
  }

  render() {
    const { serialConnected, runGcodeState, t } = this.props;
    const { pausePrint, toggleBtn } = runGcodeState;
    const connect = serialConnected;
    return (
      <div className={styles.sportControl}>
        <Tooltip
          placement="top"
          content={t('To improve stability,it is recommended to use U disk to print offline')}
          hideOnClick
        >
          {toggleBtn
            ? (
              <Button
                disabled={pausePrint || !connect}
                type="danger" icon="pause" onClick={() => {
                  this.pauseRun();
                }}
              />
            )
            : (
              <Button
                disabled={!connect}
                type="primary" icon="caret-right" onClick={() => {
                  this.getTemp();
                }}
              />
            )
          }
        </Tooltip>
        <Button
          disabled={!connect}
          type="danger" icon="stop" onClick={() => {
            this.stopRun();
          }}
        />
      </div>
    );
  }
}

const mapStatesToProps = (state: any) => {
  return {
    serialConnected: !!state.websocketReducer.serialConnected,
    isRunning: !!state.websocketReducer.isRunning,
    temp: state.websocketReducer.temp.temp
  };
};
export default connect(mapStatesToProps)(withTranslation()(SportControl));
