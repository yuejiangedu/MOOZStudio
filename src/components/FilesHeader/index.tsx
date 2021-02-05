import React from 'react';
import classNames from 'classnames';
import styles from './index.styl';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
interface Iprops {
  deleteStatus: boolean;
  clickDeleteFiles: () => void;
  changeShowNewFoder: (flag: boolean) => void;
  changeNewFoderName: () => void;
  openNewBrowser: () => void;
  changeShowRemove: (flag: boolean) => void;
}

const FilesHeader = (props: Iprops) => {
  const { t } = useTranslation();
  const handleDelete = () => {
    props.clickDeleteFiles();
  }
  const handleNew = () => {
    props.changeShowNewFoder(true);
    props.changeNewFoderName();
  }

  const handleRemove = () => {
    props.changeShowRemove(true);
  }

  return (
    <div className={styles.header}>
      <Button size='large' type="primary" onClick={props.openNewBrowser} className={classNames(styles.download)}>
        <span className={styles.icondownload}></span>
        <span>{t('Download model')}</span>
      </Button>
      <Button size='large' disabled={props.deleteStatus} onClick={handleDelete} className={classNames(styles.delete, props.deleteStatus && styles.disable)}>
        <span className={styles.icondelete}></span>
        <span>{t('Delete')}</span>
      </Button>
      <Button size='large' disabled={props.deleteStatus} onClick={handleRemove} className={classNames(styles.remove, props.deleteStatus && styles.disable)}>
        <span className={styles.iconremove}></span>
        <span>{t('Move to')}</span>
      </Button>
      <Button size='large' onClick={handleNew} className={styles.folderadd}>
        <span className={styles.iconfolderadd}></span>
        <span>{t('New folder')}</span>
      </Button>
      {/* <Button className={classNames(styles.setting)}>
        <Icon type="setting" />
        <span>设置</span>
      </Button> */}
    </div >
  )
}
export default FilesHeader;