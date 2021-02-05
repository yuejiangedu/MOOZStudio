import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Switch, Tooltip, Button } from 'antd'
import styles from './index.styl'
interface Iprops {
  t: (str: string) => string;
  toggle: () => void;
  isCheckDoor: boolean;
  visible: boolean;
  swChange: (bool: boolean) => void;
}
class ProtectiveShield extends Component<Iprops>{
  render() {
    const { t, toggle, isCheckDoor, visible, swChange } = this.props;
    const tipsCom = () => {
      return (
        <div className={styles.protectiveTips} >
          <p>{t('Warning')}</p>
          <article>
            {t('The protective shield function is turned off! Please make sure your satety and DO NOT TOUCH the laser beam and carving bit through the whole process')}
          </article>
          <article>
            {t('Children must be supervised by adults Please disconnect the power in time after use')}
          </article>
          <Button
            type="primary"
            onClick={toggle}
          >
            {t('OK')}
          </Button>
        </div>
      )
    }
    return (
      <div className={styles.protectiveShield}>
        <span>
          {t('ProtectiveShield')} :
        </span>
        <Tooltip overlayClassName={styles.tooltipCustom} placement="bottomRight" title={tipsCom} trigger='click' overlayStyle={{ maxWidth: '322px', maxHeight: 'auto' }} visible={visible}>
          <Switch checkedChildren={t('Open')} unCheckedChildren={t('Close')} defaultChecked checked={isCheckDoor} onChange={swChange} />
        </Tooltip>
      </div>
    )
  }
}

export default withTranslation()(ProtectiveShield);