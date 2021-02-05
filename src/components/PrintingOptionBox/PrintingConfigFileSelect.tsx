import React, { SFC, useState, useEffect } from 'react';
import { Select, Modal, Input, Icon } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import { addCustomConfigFile, getConfigFileList, deleteCustomConfigFile } from '../../lib/http/api';
import { buryevent } from '../../lib/ganalysis/ganalysis';

const { confirm } = Modal;
const { Option } = Select;
interface Iprops {
  configFile: string;
  updateConfigFile: (name: string) => void;
  printingVersion: string;
}
const PrintingConfigFileSelect: SFC<Iprops> = (props: Iprops) => {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [configList, setList] = useState<{ name: string; canDelete: boolean }[]>([]);
  const { t } = useTranslation();

  const updateConfigList = async () => {
    const result = await getConfigFileList({ type: 'quality' });
    for (let index = 0; index < result.data.length; index++) {
      const element = result.data[index];
      element === 'custom' && result.data.splice(index, 1);
    }
    result.data.push('custom_quality');
    setList(result.data.map((name: string) => {
      return {
        name,
        canDelete: !/high_quality|fast_print|custom/.test(name)
      };
    }));
  };

  const handleChange = (value: string) => {
    setVisible(value === 'custom_quality');
    value !== 'custom_quality' && props.updateConfigFile(value);
  };


  const customFile = () => {
    addCustomConfigFile({ customName: input, isMaterialFile: false }).then((data) => {
      if (data.data.result !== 'success') {
        Modal.error({
          title: data.data.result,
          content: '',
        });
        props.updateConfigFile('fast_print');
      } else {
        props.updateConfigFile(input);
        updateConfigList();
      }
    });
    setVisible(false);
    setInput('');
    buryevent('btn_created_new_profile', { 'event_category': '3dp', 'event_label': 'confirm' });
  };

  const deleteProfile = (name: string) => {
    confirm({
      title: t('Confirm Delete'),
      content: t('You will delete the configuration file {{name}} Are you sure', { name }),
      okText: t('Delete'),
      cancelText: t('Cancel'),
      icon: null,
      okType: 'danger',
      onOk() {
        deleteCustomConfigFile({ fileName: `quality.${name}.def.json` }).then(() => {
          updateConfigList();
          if (props.configFile === name) {
            props.updateConfigFile('fast_print');
          }
        });
        buryevent('btn_deleted_new_profile', { 'event_category': '3dp', 'event_label': 'confirm' });
      },
      onCancel() {
        buryevent('btn_deleted_new_profile', { 'event_category': '3dp', 'event_label': 'canceled' });
      }
    });
  };


  const inputChange = (value: string) => {
    if (/^[5A-Za-z0-9-]+$/.test(value) || value === '') {
      setInput(value);
    }
  };

  useEffect(() => {
    updateConfigList();
  }, []);

  useEffect(() => {
    updateConfigList();
    props.updateConfigFile('fast_print');
  }, [props.printingVersion]);

  return (
    <section className={styles.printingConfigFileSelect}>
      <label>{t('Printing Setting')}</label>
      <span>
        <Select
          value={props.configFile} style={{ width: 170 }}
          onChange={handleChange}
          optionLabelProp="label"
          className="deep-border"
        >
          {configList.map((item) => {
            return (
              <Option
                value={item.name}
                key={item.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: item.name === 'custom_quality' ? '1px solid #F1F1F1' : 'none',
                  marginTop: item.name === 'custom_quality' ? '5px' : '0'
                }}
                label={t(item.name.replace('_', ''))}
              >
                {t(item.name.replace('_', ''))}{item.canDelete ? (
                  <Icon
                    type="close" className={styles.selectOptionIcon} onClick={(e) => {
                      e.stopPropagation();
                      deleteProfile(item.name);
                    }}
                  />
                ) : null}
              </Option>
            );
          })}
        </Select>
      </span>
      <Modal
        title={t('custom')}
        visible={visible}
        onOk={customFile}
        onCancel={() => {
          setVisible(false);
          buryevent('btn_created_new_profile', { 'event_category': '3dp', 'event_label': 'canceled' });
        }}
        bodyStyle={{ border: 'none' }}
        width={388}
        maskClosable={false}
        okText={t('OK')}
        cancelText={t('Cancel')}
      >
        <p>{t('Please enter a new name')}</p>
        <Input
          placeholder={t('English numerals and dash are supported')}
          value={input} onChange={(e) => {
            inputChange(e.target.value);
          }}
        />
      </Modal>
    </section>
  );
};

export default PrintingConfigFileSelect;
