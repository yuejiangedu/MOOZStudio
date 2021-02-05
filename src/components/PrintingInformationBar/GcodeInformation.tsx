import React from 'react';
import styles from './index.styl';
import { useTranslation } from 'react-i18next';

interface Iprops {
  weight: number;
  perLength: number;
  time: number;
}
const GcodeInformation = (props: Iprops) => {
  const { weight, perLength } = props;
  const { t } = useTranslation();
  const formatTime = (s: number) => {
    const hours = Math.floor(s / 60 / 60);
    const min = Math.floor(s % 3600 / 60);
    return `${hours}${t('hour')}${min}${t('min')}`;
  };
  return (
    <section className={styles.gcodeInformation}>
      <div>
        <img src={require('../../assets/printing-icon/time.svg')} alt="#" />
        <span>
          {formatTime(props.time)}
        </span>
      </div>
      <div>
        <img src={require('../../assets/printing-icon/consumable.svg')} alt="#" />
        <span>
          {`${weight}g/${perLength}m`}
        </span>
      </div>
    </section>
  );
};

export default GcodeInformation;
