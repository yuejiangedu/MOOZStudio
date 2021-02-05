import React from 'react';
import { Slider, InputNumber } from 'antd';
import { SliderValue } from 'antd/lib/slider';
import style from './index.styl';

interface Iprops {
  inputValue: number,
  onChange: (value: SliderValue|number|undefined) => void;
}
export const IntegerStepSlide = (props: Iprops) => (
  <div className={style.container}>
    <div className={style.slider}>
      <Slider
        min={0}
        max={100}
        onChange={props.onChange}
        value={props.inputValue}
      />
    </div>

    <InputNumber
      min={0}
      max={100}
      style={{ marginLeft: 16, width: 60 }}
      value={props.inputValue}
      onChange={props.onChange}
      size="small"
      formatter={value => `${value}%`}
      parser={(value) => (value ? value.replace('%', '') : 0)}
    />
  </div>
);
