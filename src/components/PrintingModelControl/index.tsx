import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import ControlPattern from './ControlPattern';
import styles from './index.styl';
import SideInput from './SideInput';
import { useDispatch, useSelector } from 'react-redux'
import { changeIsometricRotation, updateControlPattern, updateModel3Ddata } from '../../containers/Printing/actions'
import { IprintingState } from '../../containers/Printing/types'
import { IrootState } from '../../rootRedux'
interface Iprops {
  show: boolean;
  disable: boolean;
}
const PrintingModelControl = (props: Iprops) => {
  const [top, setTop] = useState<string>('20%');
  const [uniformScale, setUniformScale] = useState(true);
  const [showControlBox, setShowControlBox] = useState(true);
  const [sideInputShow, setSideInputShow] = useState(true);
  const [currentInput, setCurrentInput] = useState('MOVE');
  const dispatch = useDispatch();
  const { model3Dsize, model3Ddata, controlPattern, isometricRotation } = useSelector<IrootState, IprintingState>((state) => state.printingReducers)
  const inputList = ['X', 'Y', 'Z'];
  const [data, setData] = useState<{ [index: string]: { [index: string]: number | string } }>({
    'MOVE': {
      X: 0,
      Y: 0,
      unit: 'mm'
    },
    'SCALE': {
      X: 0,
      Y: 0,
      Z: 0,
      Xp: 0,
      Yp: 0,
      Zp: 0,
      unit: 'mm'
    },
    'ROTATE': {
      X: 0,
      Y: 0,
      Z: 0,
      unit: '°'
    }
  });

  const combineData = () => {
    setData({
      'MOVE': {
        X: model3Ddata.moveX,
        Y: model3Ddata.moveY,
        unit: 'mm'
      },
      'SCALE': {
        X: model3Dsize.modelSize.widthX,
        Y: model3Dsize.modelSize.widthY,
        Z: model3Dsize.modelSize.height,
        Xp: Math.round(model3Ddata.scaleX * 100),
        Yp: Math.round(model3Ddata.scaleY * 100),
        Zp: Math.round(model3Ddata.scaleZ * 100),
        unit: 'mm'
      },
      'ROTATE': {
        X: Math.round(180 * model3Ddata.rotateX / Math.PI),
        Y: Math.round(180 * model3Ddata.rotateY / Math.PI),
        Z: Math.round(180 * model3Ddata.rotateZ / Math.PI),
        unit: '°'
      }
    });
  };

  const onBlur = (value: string, axis: string, unit: string) => {
    if (/^-?\d*(\.\d*)?$/.test(value) || value === '') {
      const val = value === '' ? 0 : convertData(parseFloat(value), axis, unit);
      const axisArr = (uniformScale && controlPattern === 'SCALE') ? inputList : [axis];
      setAxisData(axisArr, val);
    }
  }


  const convertMethods: { [index: string]: (value: number, axis?: string, unit?: string) => number } = {
    'MOVE': (value: number) => {
      return value;
    },
    'SCALE': (value: number, axis?: string, unit?: string) => {
      const sizeName: { [index: string]: string } = {
        X: 'widthX',
        Y: 'widthY',
        Z: 'height'
      };
      const scaleVal = unit === 'mm' ? value / (model3Dsize.orgModelSize as { [index: string]: number })[sizeName[axis as string]] : value / 100;
      return scaleVal;
    },
    'ROTATE': (value: number) => {
      return Math.round(value * Math.PI / 180 * 1000) / 1000;
    }
  };

  const convertData = (value: number, axis: string, unit: string) => {
    return convertMethods[controlPattern](value, axis, unit);
  };

  const changePattern = (val: string, index: number) => {
    dispatch(updateControlPattern(val));
    const top = ['20%', '50%', '80%'][index];
    setTop(top);
  };

  const setAxisData = (axisArr: string[], val: number) => {
    axisArr.forEach((axis) => dispatch(updateModel3Ddata({ [controlPattern.toLocaleLowerCase() + axis]: val })));
  };

  const onchange = (value: string, axis: string) => {
    Object.assign(data, {
      [controlPattern]: {
        ...data[controlPattern],
        [axis]: value
      }
    })
    setData(JSON.parse(JSON.stringify(data)))
  };

  const reset = () => {
    setAxisData(inputList, 1);
  };

  const shrinkControlBox = () => {
    setShowControlBox(!showControlBox);
  }

  const changeSideInputShow = (key: string) => {
    if (currentInput === key) {
      setSideInputShow(!sideInputShow);
    } else {
      setCurrentInput(key);
      setSideInputShow(true);
    }
  }

  const changeIsometricRotaion = (value: boolean) => {
    dispatch(changeIsometricRotation(value))
  }

  useEffect(() => {
    combineData();
  }, [model3Ddata, model3Dsize]);


  return (
    <section className={classNames(styles.printingModelControl, { [styles.isshow]: props.show && !props.disable })}>
      <span className={classNames(styles.shrink, { [styles.isRetract]: !showControlBox })} onClick={shrinkControlBox}></span>
      <section style={{ opacity: showControlBox ? '1' : '0' }} >
        <ControlPattern
          activeLabel={controlPattern}
          changePattern={changePattern}
          changeSideInputShow={changeSideInputShow}
        />
        {sideInputShow ?
          <SideInput
            inputList={inputList} top={top} data={data[controlPattern]}
            onchange={onchange}
            title={controlPattern}
            uniformScale={uniformScale}
            changeUniformScale={(value) => setUniformScale(value)}
            reset={reset}
            onblur={onBlur}
            changeIsometricRotaion={changeIsometricRotaion}
            IsometricRot={isometricRotation}
          /> : null
        }
      </section>
    </section>
  );
};

export default PrintingModelControl;
