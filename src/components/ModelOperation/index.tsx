import React from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';


interface Iprops {
  generating: () => void;
  export: () => void;
  generatingDisabled: boolean;
  exportDisabled: boolean;
}
const PrintingTopTools = (props: Iprops) => {
  const { t } = useTranslation();

  return (
    <section style={{ height: '32px', margin: '30px 0 0 6px', display: 'flex', justifyContent: 'space-around' }}>
      <Button type="primary" disabled={props.generatingDisabled} onClick={props.generating}>{t('Generate G-code')}</Button>
      <Button type="primary" disabled={props.exportDisabled} onClick={props.export}>{t('Export G-code')}</Button>
    </section>
  );
};
export default PrintingTopTools;
