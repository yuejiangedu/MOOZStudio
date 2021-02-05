import React, { SFC } from 'react';
import { Slider } from 'antd';
import { SliderValue } from 'antd/lib/slider';
import classNames from 'classnames';
import styles from './index.styl';

interface Iprops {
  show: boolean;
  onSlide: (val: SliderValue) => void;
}
const PrintingGcodeLayerControl: SFC<Iprops> = (props: Iprops) => {
  return (
    <section className={classNames(styles.printingLayerControl, { [styles.isshow]: props.show })}>
      <Slider
        className={styles.slider} vertical defaultValue={100}
        tooltipVisible={false}
        onChange={props.onSlide}
      />
    </section>
  );
};

export default PrintingGcodeLayerControl;
