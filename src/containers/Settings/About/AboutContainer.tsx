import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import settings from '../../../config/settings';
import i18next from 'i18next';
import styles from './index.styl';
import Anchor from '../../../components/Anchor';

const AboutContainer = () => {
  const [wiki, setWiki] = useState('');
  const [current] = useState(settings.version as string);
  const { t } = useTranslation();
  useEffect(() => {
    const lang = i18next.language;
    lang === 'en' ? setWiki('https://www.dobot.cc/products/mooz-overview.html') : setWiki('https://cn.dobot.cc/products/mooz-overview.html');
  }, [i18next.language])

  return (
    <div className={styles.aboutContainer}>
      <img src={require('../../../images/logo-badge-32x32.png')} alt="" className={styles.productLogo} />
      <div className={styles.productDetails}>
        <div className={styles.aboutProductName}>
          {`${settings.productName} ${current}`}
        </div>
        <div className={styles.aboutProductDescription}>
          {t('Web-based software for Dobot MOOZ, including Laser Engravig and CNC Carving')}
        </div>
        <Anchor
          className={styles.learnmore}
          href={wiki}
          target="_blank"
        >
          {t('Learn more')}
          <i className="fa fa-arrow-circle-right" style={{ marginLeft: 5 }} />
        </Anchor>
      </div>
    </div>
  );
}
export default AboutContainer;