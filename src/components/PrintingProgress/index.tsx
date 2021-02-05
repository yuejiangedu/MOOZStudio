import React, { SFC } from 'react';
import { Progress } from 'antd';
import classNames from 'classnames';
import styles from './index.styl';
import { useTranslation } from 'react-i18next';
interface Iprops {
  tips: string;
  progress: number;
}

const PrintingProgress: SFC<Iprops> = (props: Iprops) => {
  const { t } = useTranslation();
  return (
    <section className={classNames(styles.printingProgress, { [styles.isshow]: props.progress > 0 })}>
      <div className={styles.progressBar}>
        <p>
          {t(props.tips)}
        </p>
        <Progress
          percent={props.progress} showInfo={false} style={{ height: '14px' }}
          strokeColor="#F9F9F9"
        />
      </div>
    </section>
  );
};

export default PrintingProgress;
