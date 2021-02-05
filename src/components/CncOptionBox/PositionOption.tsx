import React, { PureComponent } from 'react';
import { InputNumber } from 'antd';

interface Iprops {
  X: number | undefined;
  Y: number | undefined;
  changeAxis: (value: number | undefined, key: string) => void;
  t: (str: string) => void;
  disable: boolean;
}
class PositionOption extends PureComponent<Iprops> {
  render() {
    const { X, Y, changeAxis, t, disable } = this.props;
    return (
      <React.Fragment>
        <section>
          <label> {t('axisX')}:</label>
          <InputNumber
            min={0} type="" value={X}
            step={0.1}
            title=""
            disabled={disable}
            onChange={(value) => {
              changeAxis(value, 'x');
            }}
          /> mm

        </section>
        <section>
          <label> {t('axisY')}:</label>
          <InputNumber
            min={0} type="" value={Y}
            step={0.1}
            title=""
            disabled={disable}
            onChange={(value) => {
              changeAxis(value, 'y');
            }}
          /> mm
        </section>
      </React.Fragment>
    );
  }
}
export default PositionOption
