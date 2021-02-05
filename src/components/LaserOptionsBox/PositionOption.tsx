import React from 'react';
import { InputNumber } from 'antd';
import { useTranslation } from 'react-i18next'
interface Iprops {
  x: number;
  y: number;
  disable: boolean;
  changeAxis: (val: number | undefined, key: string) => void;
}
const PositionOption = (props: Iprops) => {
  const { t } = useTranslation();
  const { x, y, changeAxis, disable } = props;
  return (
    <React.Fragment>
      <section>
        <label> {t('axisX')}:</label>
        <input
          min={0} value={x}
          type="number"
          step={0.1}
          disabled={disable}
          onChange={(e) => {
            e.currentTarget.value && changeAxis(parseFloat(e.currentTarget.value), 'left');
          }} /> mm
        </section>
      <section>
        <label> {t('axisY')}:</label>
        <input
          min={0} value={y}
          type="number"
          step={0.1}
          disabled={disable}
          onChange={(e) => {
            e.currentTarget.value && changeAxis(parseFloat(e.currentTarget.value), 'top');
          }} /> mm
      </section>
    </React.Fragment>
  );
}
export default PositionOption;
