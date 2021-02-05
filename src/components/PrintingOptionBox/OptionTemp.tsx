import React, { useState, useEffect } from 'react';
import { Input, Icon, Checkbox, Select } from 'antd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import { modifyConfigFile } from '../../lib/http/api';

const { Option } = Select;
interface Iprops {
  title: string;
  list: any;
  category: string;
  updateData: () => void;
  modifyInputData: (category: string, key: string, value: string) => void;
  changeTipOptions: (options: { show: boolean, label: string, top: string, right: string }) => void;
}

const OptionTemplate = (props: Iprops) => {
  const [show, setShow] = useState(true);
  const { t } = useTranslation();

  const toggle = () => {
    setShow(!show);
  };
  const handleMousEenter = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    let options = {
      show: true,
      label: e.currentTarget.dataset.label,
      top: (e.currentTarget.getBoundingClientRect().top - 25) + 'px',
      right: (document.body.clientWidth - e.currentTarget.getBoundingClientRect().left + 30) + 'px',
    }
    props.changeTipOptions(options);
  }
  const handleMouseLeave = (e: any) => {
    let options = {
      show: false,
      label: e.currentTarget.dataset.label,
      top: (e.currentTarget.getBoundingClientRect().top - 25) + 'px',
      right: (document.body.clientWidth - e.currentTarget.getBoundingClientRect().left + 30) + 'px',
    }
    props.changeTipOptions(options);
  }

  const handleData = async (key: string, value: string | number | boolean) => {
    await modifyConfigFile({ category: props.category, itemKey: key, value });
    props.updateData();
  };

  const inputType = (data: any) => {
    if ('check' in data) {
      return (
        <Checkbox
          checked={data.value} onChange={(e: any) => {
            handleData(data.key, e.target.checked);
          }}
        />
      );
    } else if ('selection' in data) {
      return (
        <Select
          value={data.value} style={{ width: 150 }} onChange={(value: string) => {
            handleData(data.key, value);
          }}
        >
          {data.selection.map((item: string) => {
            return (<Option value={item} key={item}>{t(item)}</Option>);
          })}
        </Select>
      );
    } else {
      return (
        <Input
          value={data.value} suffix={data.unit} onChange={(e) => {
            props.modifyInputData(props.category, data.key, e.target.value)
          }}
          onBlur={(e) => {
            handleData(data.key, parseFloat(e.target.value.replace(/[^0-9\.]+/g, '')))
          }}
        />
      );
    }
  };


  const combineList = (data: any, layer: number) => {
    const tsx: JSX.Element[] = [];
    data.map((item: any) => {
      if (item.extra && item.extra[item.value]) {
        data = [...data, ...item.extra[item.value]];
      }
    })
    data.forEach((item: any) => {
      tsx.push(
        <section style={{ marginLeft: `${(layer + 1) * 12}px` }} key={item.label} className={styles.optionList}
          onMouseEnter={handleMousEenter}
          onMouseLeave={handleMouseLeave}
          data-label={item.label}
        >
          <label>{t(item.label)}</label>
          {inputType(item)}
        </section>
      );

      if (item.child && item.child.length !== 0) {
        tsx.push(...combineList(item.child, layer + 1));
      }
    });
    return tsx;
  };

  return (
    <section>
      <div className={styles.optionTemplateTitle}>
        <p>{t(props.title)}</p>
        <span>
          <Icon onClick={toggle} type={show ? 'down' : 'up'} />
        </span>
      </div>
      <div className={classNames(styles.optionTemplateContent, { [styles.isshow]: show })}>
        {combineList(props.list, 0)}
      </div>
    </section>
  );
};

export default OptionTemplate;
