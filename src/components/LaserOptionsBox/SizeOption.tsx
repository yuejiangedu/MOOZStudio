import React, { PureComponent } from 'react';
import { InputNumber } from 'antd';
import { useTranslation } from 'react-i18next'
interface Iprops {
  height: number | undefined;
  width: number | undefined;
  changeSize: (value: number | undefined, key: string) => void;
  disable: boolean;
}
const SizeOption = (props: Iprops) => {
  const { t } = useTranslation();
  const { width, height, changeSize, disable } = props;
  return (
    <React.Fragment>
      <section>
        <label> {t('Size X')}:</label>
        <input
          min={1} value={width}
          type="number"
          step={0.1}
          disabled={disable}
          onChange={(e) => {
            e.currentTarget.value && changeSize(parseFloat(e.currentTarget.value), 'scaleX');
          }} /> mm
        </section>
      <section>
        <label> {t('Size Y')}:</label>
        <input
          min={1} value={height}
          type="number"
          step={0.1}
          disabled={disable}
          onChange={(e) => {
            e.currentTarget.value && changeSize(parseFloat(e.currentTarget.value), 'scaleY');
          }} /> mm
        </section>
    </React.Fragment>
  );
}
export default SizeOption;
