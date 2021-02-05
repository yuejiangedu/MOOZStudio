import React, { useEffect, useState } from 'react';
import styles from './index.styl';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import settings from '../../../config/settings';
import moment from 'moment';
import Anchor from '../../../components/Anchor';
import * as http from '../../../lib/http/api';
import semver from 'semver';

const UpdateStatusContainer = () => {
  const [checking, setChecking] = useState(false);
  const [current] = useState(settings.version as string);
  const [latest, setLatest] = useState(settings.version as string);
  const [lastUpdate, setLastUpdate] = useState('');

  const { t } = useTranslation();

  const checkLatestVersion = () => {
    setChecking(true);
    http.versionUpdate().then((response: any) => {
      setChecking(false);
      setLatest(response.data.currentVersion);
      setLastUpdate(response.data.updateDate);
    });
  }

  useEffect(() => {
    checkLatestVersion();
  }, [])

  if (checking) {
    return (
      <div className={styles.updateStatusContainer}>
        <div className={styles.updateStatusIcon}>
          <i className="fa fa-fw fa-spin fa-circle-o-notch" />
        </div>
        <div className={styles.updateStatusMessageContainer}>
          <div className={styles.updateStatusMessage}>
            {t('Checking for updates')}
          </div>
        </div>
      </div>
    )
  } else if ((checking === false) && semver.lt(current, latest)) {
    return (
      <div className={styles.updateStatusContainer}>
        <div className={classNames(styles.updateStatusIcon, styles.warning)}>
          <i className="fa fa-exclamation-circle fa-fw" />
        </div>
        <div className={styles.updateStatusMessageContainer}>
          <div className={styles.updateStatusMessage}>
            {t('There is a new version available now, click download to update')}
          </div>
          <div className={styles.releaseLatest}>
            {t('Version {{version}}', { version: latest })}
            <br />
            {moment(lastUpdate).format('LLL')}
          </div>
        </div>
        <div className={styles.updateStatusActionContainer}>
          <Anchor
            href="https://dobot.cc"
            target="_blank"
          >
            <span className={styles.label}>
              {t('Latest version')}
              <i className="fa fa-external-link fa-fw" />
            </span>
          </Anchor>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.updateStatusContainer}>
        <div className={classNames(styles.updateStatusIcon, styles.info)}>
          <i className="fa fa-check-circle fa-fw" />
        </div>
        <div className={styles.updateStatusMessageContainer}>
          <div className={styles.updateStatusMessage}>
            {t('Current version is already the latest one, no need to update')}
          </div>
        </div>
      </div>
    );
  }
}
export default UpdateStatusContainer;