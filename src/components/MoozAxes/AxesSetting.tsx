import React, { Component } from 'react';
import { Select, Button } from 'antd';
import { withTranslation } from 'react-i18next';
import styles from './index.styl';

interface Iprops{
  changeUnit: (e: any) => void;
  disabled: boolean;
  setInitPoint: () => void;
  goToWorkOrigin: () => void;
  t: (str: string) => string;
  canChangeOrigin: boolean;
}
class AxesSetting extends Component <Iprops> {
  render() {
    const { changeUnit, disabled, setInitPoint, goToWorkOrigin, t, canChangeOrigin } = this.props;
    return (
      <div className={styles.axesSetting}>
        <section>
          <Button type="primary" disabled={disabled && !canChangeOrigin} onClick={setInitPoint}>{t('Set Work Origin')}</Button>
          <Button type="primary" disabled={disabled && !canChangeOrigin} onClick={goToWorkOrigin}>{t('Go To Work Origin')}</Button>
        </section>
        <section>
          <Select
            defaultValue={1} style={{ width: '100%' }} onChange={changeUnit}
            disabled={disabled}
          >
            <Select.Option value={10}>10mm</Select.Option>
            <Select.Option value={1}>1mm</Select.Option>
            <Select.Option value={0.06}>0.06mm</Select.Option>
          </Select>
        </section>
      </div>
    );
  }
}
export default withTranslation()(AxesSetting);
