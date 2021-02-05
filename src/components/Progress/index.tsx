import React from 'react';
import { Progress, Button } from 'antd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import style from './index.styl';

interface Iprops {
  percent: number;
  cancel?: () => void;
  showCancel?: boolean;
}
export const ProgressComponent = (props: Iprops) => {
  const { t } = useTranslation();
  return (
    <div className={classNames(style.container, { [style.show]: props.percent > 0 })}>
      <Progress
        type="circle" percent={props.percent} width={100}
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
      />
      <Button type="danger" className={classNames(style.cancel, { [style.showBtn]: props.showCancel })} onClick={props.cancel}>{t('Cancel')}</Button>
    </div>
  );
};
