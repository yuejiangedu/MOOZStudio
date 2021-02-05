import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { IrootState } from '../../rootRedux'
import { Istate } from '../../rootRedux/type'
import { ILaserState } from '../../containers/Laser/types'
import { rotateCoordConvertByStart, inverseRotateCoordConvertByStart, mm2px, px2mm } from '../../lib/units';
import styles from './index.styl';
import InputOption from './InputOption';
import SliderOption from './SliderOption';
import SizeOption from './SizeOption';
import PositionOption from './PositionOption';
import { Radio } from 'antd';
import { usePublish } from '../../lib/hooks/usePubSub'
import { useTranslation } from 'react-i18next'

const LaserOptionsBox = () => {
  const { coordsInfo, laserFileInfo, activeObj } = useSelector<IrootState, ILaserState>((state) => state.laserReducers)
  const { DPI } = useSelector<IrootState, Istate>((state) => state.rootReducers)
  const publish = usePublish()
  const { t } = useTranslation();
  const [realWidth, setRealWidth] = useState(0)
  const [realHeight, setRealHeight] = useState(0)
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  })

  const changeAxis = (value: number | undefined, key: string) => {
    const { height, scaleY, angle } = activeObj;
    const { offsetXcoords, offsetYcoords, cvHeight } = coordsInfo;
    let val4Pixel = 0;
    let coords = null;
    if (value !== undefined) {
      if (key === 'left') {
        setPosition({ ...position, x: Number(value) })
        coords = inverseRotateCoordConvertByStart(Number(value), position.y, angle, 0, height * scaleY, DPI);
      } else {
        setPosition({ ...position, y: Number(value) })
        coords = inverseRotateCoordConvertByStart(position.x, Number(value), angle, 0, height * scaleY, DPI);
      }
      val4Pixel = key === 'left' ? (coords.x + offsetXcoords) : (cvHeight - coords.y - offsetYcoords);
    }
    publish('objStateChange', { key: key, value: val4Pixel });
  }

  const changeSize = (value: number | undefined, key: string) => {
    if (laserFileInfo.type === 'svg' || (activeObj.id && activeObj.id.includes('text'))) {
      scaleXY(value, key);
    } else {
      const { width, height } = activeObj;
      let val4Pixel = 0;
      if (value) {
        val4Pixel = key === 'scaleX' ? mm2px(value) / width : mm2px(value) / height;
      }
      publish('objStateChange', { key: key, value: val4Pixel });
    }
  }

  const scaleXY = (value: number | undefined, key: string) => {
    const { width, height } = activeObj;
    if (value) {
      const changeVal = key === 'scaleX' ? height * value / width : width * value / height;
      const val = key === 'scaleX' ? [value, changeVal] : [changeVal, value];
      const scaleX = mm2px(val[0]) / width;
      const scaleY = mm2px(val[1]) / height;
      publish('objStateChange', { key: 'scaleX', value: scaleX });
      publish('objStateChange', { key: 'scaleY', value: scaleY });
    }
  }

  useEffect(() => {
    if (!activeObj.id) return
    const { height, scaleY, left, top, angle } = activeObj;
    const { offsetXcoords, offsetYcoords, cvHeight } = coordsInfo;
    const coordsAfterotate = rotateCoordConvertByStart((left - offsetXcoords), (cvHeight - offsetYcoords - top), angle, 0, height * scaleY, DPI);
    const x = Number(Number(coordsAfterotate.x).toFixed(1));
    const y = Number(Number(coordsAfterotate.y).toFixed(1));
    setPosition({ x, y })
  }, [
    activeObj.height,
    activeObj.scaleY,
    activeObj.left,
    activeObj.top,
    activeObj.angle,
    coordsInfo.offsetXcoords,
    coordsInfo.offsetYcoords,
    coordsInfo.cvHeight]
  )

  useEffect(() => {
    if (!activeObj.id) return
    const { width, scaleX } = activeObj;
    const realWidth = Number(px2mm(width * scaleX).toFixed(1));
    setRealWidth(realWidth)
  }, [activeObj.width, activeObj.scaleX])

  useEffect(() => {
    if (!activeObj.id) return
    const { height, scaleY } = activeObj;
    const realHeight = Number(px2mm(height * scaleY).toFixed(1));
    setRealHeight(realHeight)
  }, [activeObj.height, activeObj.scaleY])


  return (

    <div className={styles.laserOption} style={{ border: 'none' }}>
      {/gray|binary/.test(activeObj.gcodeType) ? (
        <Radio.Group
          defaultValue={activeObj.gcodeType || 'gray'}
          buttonStyle="solid"
          onChange={(e) => {
            publish('toggleBeautyType', e.target.value);
          }}
          value={activeObj.gcodeType || 'gray'}
          className={styles.laserBeautyType}
        >
          <Radio.Button value="gray"> {t('Gray')}</Radio.Button>
          <Radio.Button value="binary"> {t('Binary')}</Radio.Button>
        </Radio.Group>
      ) : null}
      <div>
        <InputOption
          disable={!activeObj.id}
          x={position.x}
          y={position.y}
          height={realHeight}
          width={realWidth}
        />
        <SizeOption
          changeSize={changeSize}
          height={realHeight}
          width={realWidth}
          disable={!activeObj.id}
        />
        <PositionOption
          x={position.x}
          y={position.y}
          changeAxis={changeAxis}
          disable={!activeObj.id}
        />
        <SliderOption
          disable={!activeObj.id}
        />
      </div>
    </div>

  );


}

export default LaserOptionsBox