/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { withTranslation } from 'react-i18next';
import styles from './index.styl';


interface Iprops {
  portList: any[];
  handleRefreshPort: () => void;
  loading: boolean;
  handleSelected: (value: string) => void;
  disableSelect: boolean;
  t: (str: string) => string;
}
class SelectPort extends PureComponent<Iprops> {
  render() {
    const { handleRefreshPort, loading, handleSelected, disableSelect, portList, t } = this.props;
    const optionList = portList.map((option) => {
      return <Select.Option key={option.value} value={option.value}>{option.name}</Select.Option>;
    });
    return (
      <div className={styles.selectPort}>
        <div className={styles.selectLaber}>
          {t('Port') + ' :'}
        </div>
        <div
          className={styles.selectContent}
          onClick={handleRefreshPort}
        >
          <Select
            style={{ width: 200, marginRight: '10px' }} loading={loading}
            placeholder={t('please choose port')}
            onSelect={handleSelected}
            disabled={disableSelect}
          >
            {optionList}
          </Select>
        </div>
      </div>
    );
  }
}
export default withTranslation()(SelectPort);
