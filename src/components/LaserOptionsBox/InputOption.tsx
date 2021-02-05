import React, { useState, useEffect } from 'react';
import { InputNumber, Tooltip } from 'antd';
import { IrootState } from '../../rootRedux'
import { ILaserState } from '../../containers/Laser/types'
import { useSelector } from 'react-redux'
import { usePublish } from '../../lib/hooks/usePubSub'
import { useTranslation } from 'react-i18next';
import { ISettingState } from '../../containers/Settings/reducers'

interface Iprops {
  disable: boolean;
  x: number;
  y: number;
  height: number;
  width: number;
}

const InputOption = (props: Iprops) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [borderMax, setBorderMax] = useState(0);
  const inputOptionArr: Array<{
    label: string,
    value: string,
    unit: string,
    type: string,
    step: number,
    border?: boolean
  }> = [{
    label: 'Engraving Speed',
    value: 'engravingSpeed',
    unit: 'mm/min',
    type: 'gray,binary,laser-svg,text',
    step: 5
  },
  {
    label: 'Traveling Speed',
    value: 'deadheadSpeed',
    unit: 'mm/min',
    type: 'gray,binary,laser-svg,text',
    step: 5
  },
  {
    label: 'Border',
    value: 'border',
    unit: 'mm',
    type: 'gray',
    step: 0.1,
    border: true
  },
    ];
  const { laserOption, beautyType } = useSelector<IrootState, ILaserState>((state) => state.laserReducers);
  const { moozVersion } = useSelector<IrootState, ISettingState>(state => state.settingReducers);
  const publish = usePublish();
  const { t } = useTranslation();
  const { x, y, width, height } = props;
  useEffect(() => {
    let tmpBorderMax = Number(Math.min(x, y, Number(moozVersion) - (x + width), Number(moozVersion) - (y + height)).toFixed(1));
    tmpBorderMax > 0 ? tmpBorderMax = tmpBorderMax : tmpBorderMax = 0;
    setBorderMax(tmpBorderMax)
  }, [x, y, moozVersion])
  const inputOption = inputOptionArr.map((item) => {
    const propsVal = laserOption[item.value];
    return (
      (item.type).includes(beautyType)
        ? (
          <section key={item.value}>
            <label> {t(item.label)}:</label>
            <Tooltip title={t('BorderTip', { count: borderMax })}
              placement="left"
              visible={item.border && showTooltip} trigger='hover'>
              <input
                min={0}
                value={propsVal}
                type="number"
                step={item.step}
                max={item.border ? borderMax : Infinity}
                disabled={!showTooltip && props.disable}
                onBlur={() => {
                  setShowTooltip(false)
                }}
                onChange={(e) => {
                  console.log(e.currentTarget.value);
                  publish('changeLaserOption', { key: item.value, value: e.currentTarget.value as number | string })
                  setShowTooltip(false)
                  if (item.border && e.currentTarget.value && parseInt(e.currentTarget.value) > borderMax) {
                    publish('changeLaserOption', { key: item.value, value: borderMax as number | string })
                    setShowTooltip(true);
                  } else {
                    publish('changeLaserOption', { key: item.value, value: e.currentTarget.value as number | string })
                    setShowTooltip(false)
                  }
                }} />{item.unit}
            </Tooltip>
          </section>
        ) : null
    );
  });

  return (
    <React.Fragment>
      {inputOption}
    </React.Fragment>
  );
}

export default InputOption;
