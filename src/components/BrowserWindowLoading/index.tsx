import React from 'react';
import styles from './index.styl';
import { useTranslation } from 'react-i18next';

const BrowserWindowLoading = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.box}>
      <div className={styles.container}>
        <img src={require("../FilesContent/image/loading.gif")} alt="" />
        <div className={styles.text}>{t('downloadLoading')}</div>
      </div>
    </div>
  )
}
export default BrowserWindowLoading;