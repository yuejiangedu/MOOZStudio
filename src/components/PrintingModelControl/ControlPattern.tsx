import React, { SFC } from 'react';
import styles from './index.styl';

interface Iprops {
  activeLabel: string;
  changePattern: (val: string, index: number) => void;
  changeSideInputShow: (key: string) => void;
}
const btnData = [
  {
    label: 'MOVE',
    icon: require('../../assets/printing-icon/icon-translate.svg')
  },
  {
    label: 'SCALE',
    icon: require('../../assets/printing-icon/icon-scale.svg')
  },
  {
    label: 'ROTATE',
    icon: require('../../assets/printing-icon/icon-rotate.svg')
  }
];

const ControlPattern: SFC<Iprops> = (props: Iprops) => {
  const buttons = btnData.map((item, index) => {
    const isActive = props.activeLabel === item.label;
    return (
      <button
        data-key={item.label}
        key={item.label} className={isActive ? styles.active : ''} onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          const datakey = (e.target as HTMLDivElement)!.getAttribute('data-key');
          datakey && props.changeSideInputShow(datakey)
          props.changePattern(item.label, index);
        }}
        type="button"
      >
        <img src={item.icon} alt="#" data-key={item.label} />
      </button>
    );
  });
  return (
    <section className={styles.controlPattern}>
      {buttons}
    </section>
  );
};

export default ControlPattern;
