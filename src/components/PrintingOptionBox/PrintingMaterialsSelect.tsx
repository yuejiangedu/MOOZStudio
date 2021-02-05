import React, { useState, useEffect } from 'react';
import { Select, Modal, Input, Icon } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import { addCustomConfigFile, getConfigFileList, modifyConfigFile, deleteCustomConfigFile } from '../../lib/http/api';
import { buryevent } from '../../lib/ganalysis/ganalysis';

const { confirm } = Modal;
const { Option } = Select;
interface Iprops {
  printMaterial: string;
  updateMaterial: (name: string) => void;
  updateData: () => void;
  materialConfigs: Array<{
    unit: string;
    value: number;
    label: string;
    key: string;
  }>;
  printingVersion: string;
  modifyMaterialInput: (key: string, value: string) => void;
  changeTipOptions: (options: { show: boolean, label: string, top: string, right: string }) => void;
}
const PrintingMaterialsSelect = (props: Iprops) => {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [materialList, setList] = useState<{ material: string; canDelete: boolean }[]>([]);
  const { t } = useTranslation();

  const handleChange = (value: string) => {
    setVisible(value === 'custom_material');
    value !== 'custom_material' && props.updateMaterial(value);
  };

  const updateMaterialList = () => {
    getConfigFileList({ type: 'material' }).then((result) => {
      result.data.push('custom_material');
      setList(result.data.map((material: string) => {
        return {
          material,
          canDelete: !/pla|petg|tpu|custom/.test(material)
        };
      }));
    });
  };

  const customFile = () => {
    if (!input) {
      return;
    }
    addCustomConfigFile({ customName: input, isMaterialFile: true }).then((data) => {
      if (data.data.result !== 'success') {
        Modal.error({
          title: data.data.result,
          content: '',
        });
        props.updateMaterial('pla');
      } else {
        props.updateMaterial(input);
        updateMaterialList();
      }
    });
    setVisible(false);
    setInput('');
    buryevent('btn_created_new_material', { 'event_category': '3dp', 'event_label': 'confirm' });
  };

  const handleData = async (key: string, value: number) => {
    await modifyConfigFile({ category: 'material', itemKey: key, value });
    props.updateData();
  };

  const deleteProfile = (material: string) => {
    confirm({
      title: t('Confirm Delete'),
      content: t('You will delete the configuration file {{name}} Are you sure', { name: material }),
      okText: t('Delete'),
      cancelText: t('Cancel'),
      icon: null,
      okType: 'danger',
      onOk() {
        deleteCustomConfigFile({ fileName: `material.${material}.def.json` }).then(() => {
          updateMaterialList();
          if (props.printMaterial === material) {
            props.updateMaterial('pla');
          }
        });
        buryevent('btn_deleted_new_material', { 'event_category': '3dp', 'event_label': 'confirm' });
      },
      onCancel() {
        buryevent('btn_deleted_new_material', { 'event_category': '3dp', 'event_label': 'canceled' });
      }
    });
  };

  const inputChange = (value: string) => {
    if (/^[5A-Za-z0-9-]+$/.test(value) || value === '') {
      setInput(value);
    }
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

  useEffect(() => {
    updateMaterialList();
  }, []);


  useEffect(() => {
    updateMaterialList();
    props.updateMaterial('pla');
  }, [props.printingVersion]);

  return (
    <section className={styles.printingMaterialsSelect}>
      <div className={styles.materialsSelect}>
        <label>{t('Material')}</label>
        <span>
          <Select
            value={props.printMaterial} style={{ width: 170 }} onChange={handleChange}
            optionLabelProp="label"
            className="deep-border"
          >
            {materialList.map((item) => {
              return (
                <Option
                  value={item.material} key={item.material}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: item.material === 'custom_material' ? '1px solid #F1F1F1' : 'none',
                    marginTop: item.material === 'custom_material' ? '5px' : '0'
                  }}
                  label={t(item.material).toUpperCase()}
                >
                  {item.material === 'custom_material' ? t(item.material) : t(item.material).toUpperCase()}{item.canDelete ? (
                    <Icon
                      type="close" className={styles.selectOptionIcon} onClick={(e) => {
                        e.stopPropagation();
                        deleteProfile(item.material);
                      }}
                    />
                  ) : null}
                </Option>
              );
            })}
          </Select>
        </span>
      </div>
      <div>
        {
          props.materialConfigs.map((item) => {
            return (
              <section className={styles.materialConfigsList} key={item.key}
                onMouseEnter={handleMousEenter}
                onMouseLeave={handleMouseLeave}
                data-label={item.label}
              >
                <label>{t(item.label)}</label>
                <Input
                  value={item.value} style={{ width: 150 }} onChange={(e) => {
                    props.modifyMaterialInput(item.key, e.target.value)
                  }}
                  onBlur={(e) => {
                    handleData(item.key, parseFloat(e.target.value.replace(/[^0-9\.]+/g, '')))
                  }}
                  suffix={item.unit}
                />
              </section>
            );
          })
        }
      </div>
      <Modal
        title={t('custom_material')}
        visible={visible}
        onOk={customFile}
        onCancel={() => {
          setVisible(false);
          buryevent('btn_created_new_material', { 'event_category': '3dp', 'event_label': 'canceled' });
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

export default PrintingMaterialsSelect;
