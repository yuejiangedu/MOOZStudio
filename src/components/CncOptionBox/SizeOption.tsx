import React, { PureComponent } from 'react';
import { InputNumber } from 'antd';
interface Iprops {
  height: number | undefined;
  width: number | undefined;
  updatePlane: (obj: any) => void;
  plane: any;
  DPI: number;
  fileType: string;
  changeSize: (value: number | undefined, key: string) => void;
  t: (str: string) => void;
  disable: boolean;
}
class SizeOption extends PureComponent<Iprops> {
  render() {
    const { width, height, changeSize, t, disable } = this.props;
    return (
      <React.Fragment>
        <section>
          <label>{t('Size X')}:</label>
          <InputNumber
            min={1} value={width} type=""
            step={0.1}
            title=""
            disabled={disable}
            onChange={(value) => {
              changeSize(value, 'scaleX');
            }}
          /> mm
        </section>
        <section>
          <label>{t('Size Y')}:</label>
          <InputNumber
            min={1} value={height} type=""
            step={0.1}
            title=""
            disabled={disable}
            onChange={(value) => {
              changeSize(value, 'scaleY');
            }}
          /> mm
        </section>
      </React.Fragment>
    );
  }
}
export default SizeOption;
