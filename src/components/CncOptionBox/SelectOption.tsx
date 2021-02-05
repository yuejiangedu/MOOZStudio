import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Select } from 'antd';
import styles from './index.styl';
import { buryevent } from '../../lib/ganalysis/ganalysis';

interface Iprops {
  cncOption: any;
  setCncOption: (obj: any) => void;
  t: (str: string) => string;
}
class SelectOption extends PureComponent<Iprops> {
  handleChange = (e: any) => {
    this.props.setCncOption({ carvingTool: e.currentTarget.value });
    e.currentTarget.value === 'vBit' && buryevent('btn_select_cnc_tools', { 'event_category': 'cnc', 'event_label': 'v-bit' });
    if (e.currentTarget.value === 'FlatEndMill') {
      const flatEndMillSize = e.currentTarget.lastElementChild.firstElementChild.firstElementChild.firstElementChild.innerText;
      buryevent('btn_select_cnc_tools', { 'event_category': 'cnc', 'event_label': `flat_${flatEndMillSize}` });
    }
  }

  changFlatEndMillSize = (val: number) => {
    this.props.setCncOption({ flatEndMillSize: val });
  }

  render() {
    const { cncOption, t } = this.props;
    const activeTool = cncOption.carvingTool;
    return (
      <div className={styles.selectOption}>
        <button
          type="button" value="vBit" onClick={(e) => {
            this.handleChange(e);
          }}
          className={classNames({ [styles.active]: activeTool === 'vBit' })}
        >
          <img src={require('./img/toolA.jpg')} alt="#" />
          <p>{t('Carving V-Bit')}</p>
        </button>
        <button
          type="button" value="FlatEndMill" onClick={(e) => {
            this.handleChange(e);
          }}
          className={classNames({ [styles.active]: activeTool === 'FlatEndMill' })}
        >
          <img src={require('./img/toolB.jpg')} alt="#" />
          <p>{t('Flat End Mill')}</p>
          <Select defaultValue={1.5} onChange={this.changFlatEndMillSize} date-id='FlatEndMill'>
            <Select.Option value={1.5}>
              1.5mm
            </Select.Option>
            <Select.Option value={2.5}>
              2.5mm
            </Select.Option>
          </Select>
        </button>
      </div>
    );
  }
}
export default SelectOption;
