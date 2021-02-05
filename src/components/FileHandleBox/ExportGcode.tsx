import React from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { buryevent } from '../../lib/ganalysis/ganalysis';
import { useSelector } from 'react-redux'
import { IrootState } from '../../rootRedux'
import { Istate } from '../../rootRedux/type'
import { useLocation } from 'react-router';

const ExportGcode = () => {
  const { t } = useTranslation();
  const { gcode } = useSelector<IrootState, Istate>((state) => state.rootReducers)
  const location = useLocation()
  const buryPageName = {
    '/laser': 'laser',
    '/workspace': 'workspace',
    '/cnc': 'cnc'
  }
  const exportGcode = () => {
    buryevent('btn_export_gcode', { 'event_category': buryPageName[location.pathname], 'event_label': 'clicked' });
    const filename = 'gcode ' + new Date().toLocaleDateString() + '.gcode';
    const content = gcode;
    let ele: HTMLAnchorElement | null = document.createElement('a');
    ele.download = filename;
    ele.style.display = 'none';
    // 字符内容转变成blob地址
    const blob = new Blob([content]);
    ele.href = URL.createObjectURL(blob);
    ele.click();
    ele = null;
  }

  return (
    <Button
      type="primary"
      title={t('Export G-code')}
      onClick={exportGcode}
      disabled={!gcode}
    >
      <span> {t('Export G-code')}</span>
    </Button>
  )
}
export default ExportGcode
