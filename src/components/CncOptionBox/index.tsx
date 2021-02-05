import React, { useEffect, useMemo, useState, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import InputOption from './InputOption';
import SliderOption from './SliderOption';
import SizeOption from './SizeOption';
import PositionOption from './PositionOption';
import SelectOption from './SelectOption';
import ToolSelectionBox from '../ToolSelectionBox';
import { rotateCoordConvertByOrigin, mm2px, px2mm } from '../../lib/units';
import { IrootState } from '../../rootRedux'
import { ICncState } from '../../containers/CNC/types'
import { setCncOption, updatePlane } from '../../containers/CNC/actions'
import { useDispatch, useSelector } from 'react-redux'
import { Istate } from '../../rootRedux/type'
import { usePublish } from '../../lib/hooks/usePubSub'

const initState = {
  realX: 0,
  realY: 0,
  realHeight: 0,
  realWidth: 0,
  activeObj: { width: 0, height: 0, scaleY: 1, scaleX: 1, angle: 0, x: 0, y: 0, name: 'plane' }
}

const reducer = (state: typeof initState, actions: { type: string, value?: any }) => {
  const { scaleY, scaleX, width, height, x, y, angle } = state.activeObj
  switch (actions.type) {
    case 'updateActiveObj':
      return { ...state, activeObj: actions.value.activeObj }
    case 'updateObjState':
      const realWidth = Number(px2mm(width * scaleX).toFixed(1));
      const realHeight = Number(px2mm(height * scaleY).toFixed(1));
      const originX = mm2px(x); //px
      const originY = mm2px(y); //px
      const startX = originX - width * scaleX / 2;
      const startY = originY - height * scaleY / 2;
      const coords = rotateCoordConvertByOrigin(startX, startY, angle, originX, originY, actions.value.dpi);
      const realX = Number(Number(coords.x).toFixed(1));
      const realY = Number(Number(coords.y).toFixed(1));
      return { ...state, realX, realY, realWidth, realHeight }
    default:
      return { ...state }
  }
}

const CncOptionsBox = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const publish = usePublish();
  const [{ activeObj, realWidth, realHeight, realX, realY }, setState] = useReducer(reducer, initState)
  const { cncOption, cncText, plane, cncFileInfo } = useSelector<IrootState, ICncState>(state => state.CNCReducers);
  const { DPI } = useSelector<IrootState, Istate>(state => state.rootReducers);

  const scaleXYSync = (value: number | undefined, key: string) => {
    const { width, height } = activeObj;
    if (value) {
      const changeVal = key === 'scaleX' ? height * value / width : width * value / height;
      const val = key === 'scaleX' ? [value, changeVal] : [changeVal, value];
      const scaleX = mm2px(val[0]) / width;
      const scaleY = mm2px(val[1]) / height;
      publish('objStateChange', Object.assign(activeObj, { scaleX, scaleY }));
    }
  }

  const changeSize = (value: number | undefined, key: string) => {
    if (cncFileInfo.type === 'svg' || activeObj.name === 'text') {
      scaleXYSync(value, key);
    } else {
      const { width, height } = plane;
      let newScale = 0;
      if (value) {
        newScale = key === 'scaleX' ? (mm2px(value) / Number(width)) : (mm2px(value) / Number(height));
        publish('objStateChange', Object.assign(activeObj, { [key]: newScale }));
      }
    }
  }

  const changeAxis = (value: number | undefined, key: string) => {
    const { width, height, scaleY, scaleX, angle } = activeObj;
    const realWidth = px2mm(width * scaleX);
    const realHeight = px2mm(height * scaleY);
    let newScale = 0;
    const rad = angle * Math.PI / 180;
    if (value !== undefined) {
      newScale = key === 'x' ? (value + Math.cos(rad) * realWidth / 2 + Math.sin(rad) * realHeight / 2) : (value + Math.cos(rad) * realHeight / 2 - Math.sin(rad) * realWidth / 2);
    }
    publish('objStateChange', Object.assign(activeObj, { [key]: newScale }));
  }

  const setOption = (obj: typeof cncOption) => {
    dispatch(setCncOption(obj))
  }

  const updatePlaneDate = (val: typeof plane) => {
    dispatch(updatePlane(val))
  }

  const disable = useMemo(() => {
    const activeText = cncText.some((item) => {
      if (item.active) {
        setState({ type: 'updateActiveObj', value: { activeObj: item } })
      }
      return item.active;
    });
    plane.active && setState({ type: 'updateActiveObj', value: { activeObj: plane } })
    return !(plane.active || activeText)
  }, [cncText, plane])

  useEffect(() => {
    setState({ type: 'updateObjState', value: { dpi: DPI } })
  }, [activeObj])

  return (
    <div style={{ border: 'none' }}>
      <div className={styles.laserOption}>
        <SelectOption setCncOption={setOption} cncOption={cncOption} t={t} />
        <ToolSelectionBox
          cncOption={cncOption}
          setCncOption={setOption}
          t={t}
        />
        <InputOption setCncOption={setOption} cncOption={cncOption} disable={disable} t={t} />
        <SizeOption
          plane={plane}
          updatePlane={updatePlaneDate}
          DPI={DPI}
          width={realWidth}
          height={realHeight}
          fileType={cncFileInfo.type as string}
          disable={disable}
          changeSize={changeSize}
          t={t}
        />
        <PositionOption
          X={realX}
          Y={realY}
          disable={disable}
          changeAxis={changeAxis}
          t={t}
        />
        <SliderOption setCncOption={setOption} cncOption={cncOption} disable={disable} t={t} />
      </div>
    </div>

  );
}
export default CncOptionsBox