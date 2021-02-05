import React, { SFC, useState } from 'react';
import classNames from 'classnames';
import LineTypeControl from './LineTypeControl';
import styles from './index.styl';
import { useTranslation } from 'react-i18next';

interface Iprops {
  list: Array<{
    label: string;
    value: boolean;
    color: Array<number>;
    typeCode: number;
    visible: string;
  }>;
  show: boolean;
  onChange: (label: string, value: boolean) => void;
}
const PrintingPreviewControl: SFC<Iprops> = (props: Iprops) => {
  const { t } = useTranslation();
  const [showLineType, setShowLineType] = useState(false);
  return (
    <section className={classNames(styles.previewControl, { [styles.isshow]: props.show })}>
      <LineTypeControl list={props.list} onChange={props.onChange} disabled={!showLineType} />
      <button
        type="button" className={classNames(styles.showBtn, { [styles.active]: showLineType })} onClick={() => {
          setShowLineType(!showLineType);
        }}
      >
        <img src={require('../../assets/printing-icon/icon-linetype.svg')} alt="#" />
        {t('Wire type')}
      </button>
    </section>
  );
};

export default PrintingPreviewControl;
