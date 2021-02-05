import React from 'react';
import styles from './index.styl';
import { useTranslation } from 'react-i18next';

interface Iprops {
  leftText: string;
  rightText: string;
  toggle: (key: number) => void;
  active: boolean;
}
const VisualizerToggle = (props: Iprops) => {
  const { t } = useTranslation();

  const handleChange = (event: any) => {
    props.toggle(+event.target.dataset.value);
  };
  return (
    <section className={styles.visualizerToggle}>
      <button
        onClick={(event) => {
          handleChange(event);
        }}
        type="button"
      >
        <span className={!props.active ? styles.active : ''} data-value={0}>
          {t(props.leftText)}
        </span>
        <span className={props.active ? styles.active : ''} data-value={1}>
          {t(props.rightText)}
        </span>
      </button>
    </section>
  );
};
export default VisualizerToggle;
