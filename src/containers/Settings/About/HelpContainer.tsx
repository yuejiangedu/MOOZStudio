import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import styles from './index.styl';

const HelpContainer = () => {
  const [downLoadUrl, setDownLoadUrl] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const lang = i18next.language;
    lang === 'en' ? setDownLoadUrl('https://www.dobot.cc/downloadcenter/dobot-mooz.html#most-download') : setDownLoadUrl('https://cn.dobot.cc/downloadcenter/dobot-mooz.html#most-download');
  }, [i18next.language])

  return (
    <div className={styles.helpContainer}>
      <button
        type="button"
        className="btn btn-default"
        onClick={() => {
          window.open(downLoadUrl, '_blank');
        }}
      >
        {t('Downloads')}
      </button>
    </div>
  );
};

export default HelpContainer;
