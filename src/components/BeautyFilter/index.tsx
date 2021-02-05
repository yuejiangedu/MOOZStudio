import React, { useEffect, useMemo, useState } from 'react';
import { Switch, Row, Col, Select } from 'antd';
import { useTranslation, withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux'
import { IrootState } from '../../rootRedux'
import { ILaserState } from '../../containers/Laser/types'
import { usePublish } from '../../lib/hooks/usePubSub'
interface OtherFilters {
  [index: string]: boolean;
}
const BeautyFilter = () => {
  const { t } = useTranslation()
  const { laserFilter } = useSelector<IrootState, ILaserState>((state) => state.laserReducers)
  const [otherFilterVal, setOtherFilterVal] = useState<undefined | string>('none');
  const publish = usePublish();
  const otherFilter: OtherFilters = {
    noise: false,
    sketch: false
  }
  const invert = useMemo(() => {
    return laserFilter.invert
  }, [laserFilter.invert])

  const getOtherFilterVal = () => {
    let hasOtherFilter = false;
    for (const key in laserFilter) {
      if (Object.prototype.hasOwnProperty.call(laserFilter, key)) {
        if (laserFilter[key] && key !== 'invert') {
          hasOtherFilter = true;
          setOtherFilterVal(key)
        }
      }
    }
    !hasOtherFilter && setOtherFilterVal('none')
  }

  const changeOtherFilter = (val: string) => {
    const filterObj = otherFilter;
    for (const key in filterObj) {
      if (Object.prototype.hasOwnProperty.call(filterObj, key)) {
        filterObj[key] = !!(key === val);
      }
    }
    publish('filterChange', { ...filterObj })
  }

  const changeInvert = (invert: boolean) => {
    publish('filterChange', { invert })
  }

  useEffect(() => {
    getOtherFilterVal();
  }, [laserFilter.noise, laserFilter.sketch])

  return (
    <div>
      <Row>
        <Col span={20}>{t('Invert')}</Col>
        <Col span={4}><Switch
          checked={invert} onChange={(val) => {
            changeInvert(val);
          }}
        />
        </Col>
      </Row>
      <Row gutter={[0, 20]}>
        <Col span={8}>{t('Other')}</Col>
        <Col span={16}>
          <Select
            value={otherFilterVal} onChange={changeOtherFilter} style={{ width: 120, float: 'right' }}
          >
            <Select.Option value="none">{t('None')}</Select.Option>
            <Select.Option value="noise">{t('Retro')}</Select.Option>
            <Select.Option value="sketch">{t('Sketch')}</Select.Option>
          </Select>
        </Col>
      </Row>
    </div>

  )
}

export default BeautyFilter;
