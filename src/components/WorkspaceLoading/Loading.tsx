import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './loader.styl';

export default () => {
  const { t } = useTranslation();
  return (
    <div className={styles.loader}>
      <div className={styles.loaderIcon}>
        <i className="fa fa-spinner fa-spin" />
      </div>
      <div className={styles.loaderText}>
        {t('Loading')}
      </div>
    </div>
  );
};
