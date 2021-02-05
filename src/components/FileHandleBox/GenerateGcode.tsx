import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next'
import { setProgressAction } from '../../containers/Progress/reducers'
import { useDispatch, useSelector } from 'react-redux'
import { IrootState } from '../../rootRedux'
import { Istate } from '../../rootRedux/type'
import { ILaserState } from '../../containers/Laser/types'
import { ICncState } from '../../containers/CNC/types'
import pubsub from 'pubsub-js';
import { rotateCoordConvertByOrigin, mm2px } from '../../lib/units';
import { setPrintTime, setGcode } from '../../rootRedux/actions'
import { buryevent } from '../../lib/ganalysis/ganalysis';
import { useLocation, useHistory } from 'react-router'
import { FONTSIZE, FONTWEIGHT } from '../../constants';
import Convert2gcode from '../../lib/gcode/Convert2Gcode';
interface Iprops {
  page: string,
  beginGenerating: () => void
}



const GenerateGcode = (props: Iprops) => {
  const { t } = useTranslation()
  const dispatch = useDispatch();
  const { laserOption, laserFileInfo, saveJSON, coordsInfo, laserAllowGenerate } = useSelector<IrootState, ILaserState>((state) => state.laserReducers)
  const { cncOption, cncFileInfo, cncAllowGenerate, cncText, plane } = useSelector<IrootState, ICncState>((state) => state.CNCReducers)
  const { DPI, generateGcodeType } = useSelector<IrootState, Istate>((state) => state.rootReducers)
  const [canGenerate, setCanGenerate] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const filterCncText = (text: any) => {
    return text.map((item: any) => {
      const flipX = !!(item.scale.x < 0);
      const flipY = !!(item.scale.y < 0);
      const scaleX = Math.abs(item.scale.x);
      const scaleY = Math.abs(item.scale.y);
      const fontSize = FONTSIZE * scaleY;
      const positionX = mm2px(item.position.x);
      const positionY = mm2px(item.position.y);
      const x = positionX - item.width * scaleX / 2;
      const yOffset = flipY ? 3 / 4 : 1 / 2;
      const y = positionY - ((item.height - mm2px(FONTWEIGHT)) * scaleY) * yOffset;
      const coord = rotateCoordConvertByOrigin(x, y, item.angle, positionX, positionY, DPI);
      const textType = item.textType;
      const text = item.text;
      return {
        x: mm2px(Number(coord.x)),
        y: mm2px(Number(coord.y)),
        textType,
        fontSize,
        text,
        flipX,
        flipY,
        scaleX,
        scaleY,
        width: item.width,
        height: item.height,
        angle: item.angle
      };
    });
  }

  const convertCoords = (state: any) => {
    const { offsetXcoords, offsetYcoords, cvHeight } = coordsInfo;
    const { left, top, id, scaleY, lineHeight, fontSize, angle } = state;
    const rad = angle * Math.PI / 180;
    if (id && id.includes('text')) {
      const textLineHeight = state.flipY && state.textType !== 1 ? (3 - lineHeight) / 2 : lineHeight;
      state.x = left - offsetXcoords - (fontSize * scaleY / lineHeight) * Math.sin(rad);
      state.y = cvHeight - offsetYcoords - top - ((fontSize - FONTWEIGHT) * textLineHeight * scaleY) * Math.cos(rad);
      state.originFont = (FONTSIZE - FONTWEIGHT) * scaleY;
      state.height = (fontSize - FONTWEIGHT) / lineHeight;
    } else {
      state.x = left - offsetXcoords;
      state.y = cvHeight - offsetYcoords - top;
    }
    return state;
  }

  const getLaserConfig = () => {
    if (!saveJSON.data[saveJSON.index]) return
    const canvasObj = JSON.parse(saveJSON.data[saveJSON.index]);
    const imgState: Array<any> = [];
    const text: any[] = [];
    if (canvasObj) {
      canvasObj.objects.forEach((item: { id: string }) => {
        if (item.id && item.id.includes('image')) {
          imgState.push(convertCoords(item));
        } else if (item.id && item.id.includes('text')) {
          text.push(convertCoords(item));
        }
      });
    }
    return { imgState, text };
  }

  const getCncConfig = () => {
    const { x, y, scaleX, scaleY, width, height, angle, rgba } = plane;
    const realHeight = height as number * Math.abs(scaleY as number);
    const realWidth = width as number * Math.abs(scaleX as number);
    const svgStr = cncFileInfo.url;
    const leftTopDotX = Math.round(mm2px(x) - realWidth / 2);
    const leftTopDotY = Math.round(mm2px(y) + realHeight / 2);
    const coord = rotateCoordConvertByOrigin(leftTopDotX, leftTopDotY, angle as number, mm2px(x), mm2px(y), DPI);
    let coordX, coordY, data;
    if (cncFileInfo.type === 'svg') {
      coordX = mm2px(Number(coord.x));
      coordY = mm2px(Number(coord.y));
      data = svgStr;
    } else {
      coordX = Math.round(mm2px(x) - realWidth / 2);
      coordY = Math.round(mm2px(y) + realHeight / 2);
      data = rgba;
    }
    const imgState =
    {
      centerX: mm2px(x),
      centerY: mm2px(y),
      x: coordX,
      y: coordY,
      scaleX: Math.abs(scaleX as number),
      scaleY: Math.abs(scaleY as number),
      flipX: !!(scaleX as number < 0),
      flipY: !!(scaleY as number < 0),
      width,
      height,
      angle,
      data,
      gcodeType: generateGcodeType
    };
    const text = filterCncText(cncText);
    return { imgState: [imgState], text };
  }

  const generateGcode = () => {
    const { page } = props;
    let config, option;
    if (page === 'cnc') {
      option = cncOption;
      config = getCncConfig();
    } else {
      option = laserOption;
      config = getLaserConfig();
    }
    const convert2gcode = new Convert2gcode({ ...option, page, dpi: DPI });
    return convert2gcode.convert(config);
  }

  const handleGenerate = () => {
    generateGcode().then((gcode: { printTime: number, gcode: string }) => {
      console.log('printTime', Math.trunc(gcode.printTime * 60));
      dispatch(setPrintTime(Math.trunc(gcode.printTime * 60)))
      dispatch(setGcode(gcode.gcode))
      //订阅gcode更新
      const meta = props.page === 'cnc' ? cncFileInfo : laserFileInfo;
      pubsub.publish('gcode:update', { gcode: gcode.gcode, fileinfo: meta });
      dispatch(setProgressAction(100))
      buryevent('btn_generate_gcode', { 'event_category': location.pathname.substring(1) });
      history.push({ pathname: '/workspace' });
    });
  }

  const onClickHandler = () => {
    dispatch(setProgressAction(50))
    props.beginGenerating()
    //激光为同步
    props.page === 'laser' && handleGenerate();
  }

  useEffect(() => {
    props.page === 'cnc' && handleGenerate();
  }, [plane.rgba])

  useEffect(() => {
    props.page === 'laser' && setCanGenerate(laserAllowGenerate)
    props.page === 'cnc' && setCanGenerate(cncAllowGenerate)
  }, [cncAllowGenerate, laserAllowGenerate])

  return (
    <Button
      type="primary"
      title={t('Generate G-code')}
      disabled={!canGenerate}
      onClick={onClickHandler}
    >{t('Generate G-code')}
    </Button>
  )
}

export default GenerateGcode