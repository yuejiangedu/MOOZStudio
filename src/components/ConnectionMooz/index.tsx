import React, { Component, Dispatch } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Input, Button } from 'antd';
import debounce from 'lodash/debounce';
import SelectPort from './SelectPort';
import styles from './index.styl';
import ConnectButton from './ConnectButton';
import moozHardware from '../../lib/jsonrpc/mooz';
import { setSerialConnected, setWifiConnected, updateError } from '../../lib/jsonrpc/websocketReducer';
import ProtectiveShield from './ProtectiveShield';
import { Tooltip } from '../Tooltip';
import { buryevent } from '../../lib/ganalysis/ganalysis';
import { IsetCheckDoor } from '../../rootRedux/type';

interface Iprops {
  setSerialConnected: (connect: boolean) => void;
  setWifiConnected: (connect: boolean) => void;
  serialConnected: boolean;
  t: (str: string) => string;
  wifiConnected: boolean;
  setCheckDoor: IsetCheckDoor;
  isCheckDoor: boolean;
  handleClose: (key: string) => void;
  transferGcode: () => void;
  countDown: number | undefined;
  updateError: (error: { error: string }) => void;
}
interface Istate {
  portList: { name: string; value: string }[];
  refreshLoading: boolean;
  selectedPort: null | string;
  wifiAddr: string;
  tipsVisible: boolean;
  [key: string]: any;
}
class Connect extends Component<Iprops, Istate> {
  state = {
    portList: [],
    refreshLoading: false,
    selectedPort: null,
    serialportConnected: false,
    disableSelect: false,
    wifiAddr: '',
    tipsVisible: false
  };

  connect = '';

  handleRefreshPort = () => {
    this.setState({
      refreshLoading: true
    });
    moozHardware.searchList().then((res: { path: string }[]) => {
      if (!Array.isArray(res)) {
        return;
      }
      const portList = res.map(item => {
        return { name: item.path, value: item.path };
      });
      this.setState({
        portList,
        refreshLoading: false
      });
    });
  }

  handleOpen = debounce((key: string, val: null | string) => {
    if (!val || (key === 'wifi' && !this.isValidIP(val))) {
      const { updateError, t } = this.props;
      updateError({ error: t('No port selected or IP port input error') });
      key === 'serial' && buryevent('btn_connect_via_serialport', { 'event_category': 'workspace', 'event_label': 'fail_未选择端口' });
      key === 'wifi' && buryevent('btn_connect_via_wifi', { 'event_category': 'workspace', 'event_label': 'fail_未输入IP或是IP输入错误' });
      return;
    }
    this.connect = key;
    moozHardware.connect({ port: val, type: key }).then(res => {
      let eventName: string;
      key === 'serial' ? eventName = 'btn_connect_via_serialport' : eventName = 'btn_connect_via_wifi';
      if (res === 'ok') {
        const { setSerialConnected, setWifiConnected } = this.props;
        const setConnect: { [index: string]: (val: boolean) => void } = { 'serial': setSerialConnected, 'wifi': setWifiConnected };
        setConnect[key](true);
        buryevent(eventName, { 'event_category': 'workspace', 'event_label': 'success' });
      } else {
        buryevent(eventName, { 'event_category': 'workspace', 'event_label': `fail_${res}` });
      }
    });
  }, 3000)


  isValidIP = (ip: string) => {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]):[0-9]+$/;
    return reg.test(ip);
  }

  handleSelectPort = (selectedPort: string) => {
    this.setState({
      selectedPort,
    });
  }

  changWifiOpt = (e: any, key: string) => {
    this.setState({
      [key]: e.target.value
    });
  }

  toggleDoorCheck = () => {
    this.props.setCheckDoor(false);
    this.setState({
      tipsVisible: false
    });
  }

  swChange = (isCheck: boolean) => {
    isCheck && this.props.setCheckDoor(isCheck);
    this.setState({
      tipsVisible: !isCheck
    });
  }

  render() {
    const { selectedPort, wifiAddr, tipsVisible } = this.state;
    const { isCheckDoor, t, wifiConnected, serialConnected, countDown } = this.props;
    const countDownTime = countDown ? `${countDown}s` : '';
    return (
      <div>
        <div className={styles.connectMooz}>
          <SelectPort
            portList={this.state.portList}
            handleRefreshPort={this.handleRefreshPort}
            loading={this.state.refreshLoading}
            handleSelected={this.handleSelectPort}
            disableSelect={serialConnected || wifiConnected}
          />
          <ConnectButton
            connected={serialConnected}
            handleOpen={() => {
              this.handleOpen('serial', selectedPort);
            }}
            disabled={wifiConnected}
            handleClose={() => {
              this.props.handleClose('serial');
            }}
          />
        </div>
        <div className={styles.connectMooz}>
          <p>Wifi :</p>
          <Input
            placeholder={t('IPPort')} onChange={(e) => {
              this.changWifiOpt(e, 'wifiAddr');
            }} value={wifiAddr}
          />
          <div className={styles.wifiHandle}>
            <ConnectButton
              disabled={serialConnected || countDown}
              connected={wifiConnected}
              countDown={countDown}
              handleOpen={() => {
                this.handleOpen('wifi', wifiAddr);
              }}
              handleClose={debounce(() => {
                this.props.handleClose('wifi');
              }, 1000)}
            />
            <Tooltip
              placement="bottom"
              content={t('Due to the influence of WiFi transmission stability and speed,it is recommended to use U disk to print offline')}
              hideOnClick
            >
              <Button type="primary" disabled={!this.props.wifiConnected || countDown} onClick={this.props.transferGcode}>{this.props.t('Send Gcode') + ' ' + countDownTime}</Button>

            </Tooltip>
          </div>
        </div>
        <ProtectiveShield
          isCheckDoor={isCheckDoor} toggle={this.toggleDoorCheck} visible={tipsVisible}
          swChange={this.swChange}
        />
      </div>

    );
  }
}

const mapStatesToProps = (state: any) => ({
  serialConnected: state.websocketReducer.serialConnected,
  wifiConnected: state.websocketReducer.wifiConnected
});
const mapDispachToProps = (dispatch: Dispatch<any>) => ({
  setSerialConnected(connect: boolean) {
    dispatch(setSerialConnected(connect));
  },
  setWifiConnected(connect: boolean) {
    dispatch(setWifiConnected(connect));
  },
  updateError(error: { error: string }) {
    dispatch(updateError(error));
  }
});
export default connect(mapStatesToProps, mapDispachToProps)(withTranslation()(Connect));
