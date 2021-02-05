import React, { useState, useEffect } from 'react';
import { Slider, InputNumber, Row, Col } from 'antd';
import styles from './index.styl';
import { IrootState } from '../../rootRedux'
import { ILaserState } from '../../containers/Laser/types'
import { usePublish } from '../../lib/hooks/usePubSub'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
interface Iprops {
  disable: boolean;
}
const SliderOption = (props: Iprops) => {
  const sliderOptionArr: Array<{
    label: string;
    value: string;
    type: string;
    min: number;
    max: number;
  }> = [{
    label: 'Min Power',
    value: 'powerMin',
    type: 'gray',
    min: 0,
    max: 100,
  },
  {
    label: 'Max Power',
    value: 'powerMax',
    type: 'gray,binary,text,laser-svg',
    min: 0,
    max: 100,
  },
  {
    label: 'Threshold',
    value: 'thres',
    type: 'binary',
    min: 0,
    max: 255,
  }];

  const { laserOption, beautyType } = useSelector<IrootState, ILaserState>((state) => state.laserReducers);
  const { t } = useTranslation();
  const publish = usePublish();
  const { disable } = props;
  const sliderOption = sliderOptionArr.map((item) => {
    const propsVal = laserOption[item.value];
    let i18nStr = item.label;
    if (['binary', 'text', 'laser-svg'].includes(beautyType) && i18nStr === 'Max Power') {
      i18nStr = 'Laser Power';
    }
    return (
      item.type.includes(beautyType) ? (
        <div className={styles.slider} key={item.value}>
          <label>{t(i18nStr)}:</label>
          <Row>
            <Col span={12}>
              <Slider
                min={item.min}
                max={item.max}
                onChange={(value) => {
                  publish('changeLaserOption', { key: item.value, value: value as number | string })
                }}
                value={propsVal ? Number(propsVal) : 0}
                tooltipVisible={false}
                disabled={disable}
                style={{ marginRight: '10px' }}
              />
            </Col>
            <Col span={12}>
              <input
                style={{ width: '50px' }}
                min={item.min}
                max={item.max}
                value={propsVal}
                type="number"
                disabled={disable}
                onChange={(e) => {
                  publish('changeLaserOption', { key: item.value, value: e.currentTarget.value as number | string })
                }} />{item.value !== 'thres' ? '%' : ''}
            </Col>
          </Row>
        </div>
      ) : null
    );
  });
  return (
    <React.Fragment>
      {sliderOption}
    </React.Fragment>
  );

}

export default SliderOption;
