import React, { SFC } from 'react';
import { Checkbox } from 'antd';
import classNames from 'classnames';
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
  onChange: (label: string, value: boolean) => void;
  disabled: boolean;
}
const LineTypeControl: SFC<Iprops> = (props: Iprops) => {
  const { t } = useTranslation();
  const lineTypeItem = props.list.map((item) => {
    return (
      <li key={item.typeCode}>
        <Checkbox
          checked={item.value}
          onChange={(event) => props.onChange(item.label, event.target.checked)}
        >
          {t(item.label)}
        </Checkbox>
        <i style={{ backgroundColor: `rgb(${item.color[0]},${item.color[1]},${item.color[2]})` }} />
      </li>
    );
  });
  return (
    <section className={classNames(styles.lineTypeControl, { [styles.showLineType]: !props.disabled })}>
      <ul>
        {lineTypeItem}
      </ul>
    </section>
  );
};

export default LineTypeControl;
