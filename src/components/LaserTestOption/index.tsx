import React, { useState } from 'react';
import { SliderValue } from 'antd/lib/slider';
import { InputNumber, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import style from './index.styl';
import moozHardware from '../../lib/jsonrpc/mooz';
import { useSelector } from 'react-redux'
import { IinitState } from '../../lib/jsonrpc/websocketReducer'
import { IrootState } from '../../rootRedux'

const LaserTestOption = () => {
  const [laserPower, setLaserPower] = useState(0);
  const [laserOpen, setLaserOpen] = useState(false)
  const { isRunning, serialConnected, wifiConnected } = useSelector<IrootState, IinitState>((state) => state.websocketReducer)
  const { t } = useTranslation();
  const onChangeSlide = async (val: any) => {
    if (typeof val === 'number') {
      setLaserPower(val)
    }
    !isRunning && laserOpen && (await moozHardware.writeGcode(`G1 S${val * 2.55}`));

  }

  const onChangeSwitch = async (open: any) => {
    setLaserOpen(open)
    const power = open ? laserPower : 0;
    isRunning && (await moozHardware.writeGcode(`G1 S${power * 2.55}`));
  }

  return (
    <div>
      <div className={style['content-wrap']} >
        <div>
          {t('Switch')} <Switch checked={laserOpen} onChange={onChangeSwitch} disabled={!(serialConnected || wifiConnected)} />
        </div>
        <div>
          {t('Laser Power')}
          <InputNumber
            disabled={!(serialConnected || wifiConnected)}
            defaultValue={laserPower}
            min={0}
            max={100}
            className={style.inputNumber}
            formatter={value => `${value}%`}
            parser={(value: string | undefined) => (value as string).replace('%', '')}
            onChange={onChangeSlide}
          />
        </div>
      </div>
    </div>
  );
}

export default LaserTestOption;