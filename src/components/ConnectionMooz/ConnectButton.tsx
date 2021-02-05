import React, { PureComponent } from 'react';
import { Button } from 'antd';
import { withTranslation } from 'react-i18next';
import styles from './index.styl';

interface Iprops {
  connected: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  t: (str: string) => string;
  countDown: number | undefined;
  disabled: boolean;
}

class ConnectButton extends PureComponent<Iprops> {
  render() {
    const { connected, handleOpen: handleOpenWs, handleClose: handleCloseWs, t, disabled, countDown } = this.props;
    const countDownTime = countDown ? `${countDown}s` : ''
    return (
      <div>
        <div className={styles.connectBtn}>
          {!connected && (
            <Button
              type="primary"
              onClick={handleOpenWs}
              disabled={disabled}
            >
              {t('Connect') + ' ' + countDownTime}
            </Button>
          )}
          {connected && (
            <Button
              type="danger"
              onClick={handleCloseWs}
              disabled={disabled}
            >
              {t('Disconnect') + ' ' + countDownTime}
            </Button>
          )}
        </div>
      </div>
    );
  }
}
export default withTranslation()(ConnectButton);
