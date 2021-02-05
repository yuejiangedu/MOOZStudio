import React, { Component } from 'react';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import AxesTable from './AxesTable';
import KeyPad from './KeyPad';
import AxesSetting from './AxesSetting';
import styles from './index.styl';
import { IinitState } from '../../lib/jsonrpc/websocketReducer';
import moozHardware from '../../lib/jsonrpc/mooz';
import { IrootState } from '../../rootRedux/index'

const MoozAxes = () => {
  const { positions, serialConnected, wifiConnected, isRunning, endStop } = useSelector<IrootState, Partial<IinitState>>(state => {
    return {
      positions: state.websocketReducer.positions,
      serialConnected: state.websocketReducer.serialConnected,
      wifiConnected: state.websocketReducer.wifiConnected,
      isRunning: state.websocketReducer.isRunning,
      endStop: state.websocketReducer.endStop
    }
  });

  let moveUnit = '1';
  const jog = (val: string) => {
    if (val === 'HOME') {
      moozHardware.setHome('');
    } else if (val.endsWith('0')) {
      moozHardware.setHome(val.split('').join(' '));
    } else {
      console.log('jog ', val + moveUnit);
      moozHardware.move(val + moveUnit);
    }
  }
  const changeUnit = (e: number) => {
    moveUnit = '' + e;
  }
  const setInitPoint = () => {
    moozHardware.setInitPoint();
  }

  const goToWorkOrigin = () => {
    moozHardware.goToWorkOrigin();
  }

  const disable = !serialConnected || wifiConnected;
  const endStopIsReady = endStop === 2 || endStop === 3;
  return (
    <div className={styles.moozAxes}>
      <AxesTable tableData={positions} axes="xyz" />
      <Spin spinning={isRunning}>
        <KeyPad jog={jog} disabled={disable} />
        <AxesSetting
          changeUnit={changeUnit} setInitPoint={setInitPoint} goToWorkOrigin={goToWorkOrigin}
          disabled={disable} canChangeOrigin={endStopIsReady}
        />
      </Spin>
    </div>
  );
}

export default MoozAxes;
