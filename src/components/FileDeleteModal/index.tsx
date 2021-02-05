import React, { useState, useEffect } from 'react';
import styles from './index.styl';
import { Modal } from 'antd';
import { deleteFiles } from '../../lib/http/api';
import { useTranslation } from 'react-i18next';

interface Iprops {
  showModal: boolean;
  switchShowModal: (status: boolean) => void;
  deleteFilePath: any[];
  changesuccessFlag: (flag: boolean) => void;
  refresh: () => void;
  changeDeleteStatus: (status: boolean) => void;
}
const FilesHeader = (props: Iprops) => {
  const [tip, setTip] = useState('');
  const { t } = useTranslation();

  const handleOk = () => {
    props.changesuccessFlag(false);
    props.changeDeleteStatus(true);
    props.deleteFilePath.forEach((item, index) => {
      deleteFiles({ deleteInfos: item }).then((res) => {
        if (res.data === 'success') {
          if (index === props.deleteFilePath.length - 1) {
            props.changeDeleteStatus(false);
            props.changesuccessFlag(true);
            props.refresh();
          }
        } else {
          props.changesuccessFlag(false);
          props.refresh();
        }
      })
    })
    props.switchShowModal(false);
  }

  const handleCancel = () => {
    props.switchShowModal(false);
  }
  useEffect(() => {
    if (props.deleteFilePath) {
      if (props.deleteFilePath.length === 1) {
        const sliceIndex = props.deleteFilePath[0].pathName.lastIndexOf('/');
        const tipInfo = props.deleteFilePath[0].pathName.substr(sliceIndex + 1);
        setTip(tipInfo);
      } else {
        const tipInfo = ` ${props.deleteFilePath.length} ${t('deleteTipNumber')}`;
        setTip(tipInfo);
      }
    }
  }, [props.deleteFilePath])
  return (
    <div className={styles.container} style={{ display: props.showModal ? 'block' : 'none' }}>
      <Modal
        title={t('deleteTipTitle')}
        visible={props.showModal}
        onOk={handleOk}
        onCancel={handleCancel}
        centered={true}
        mask={false}
        okText={t('Delete')}
        okType={'danger'}
        cancelText={t('Cancel')}
        bodyStyle={{ 'borderBottom': '1px solid #e8e8e8' }}
      >
        <p>{t('deleteTipConfirm')}{tip}</p>
        <p className={styles.danger}>{t('deleteTipRestore')}</p>
      </Modal>
    </div>
  )
}
export default FilesHeader;