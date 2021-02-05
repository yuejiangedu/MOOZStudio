import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import classNames from 'classnames';
import { buryevent } from '../../../lib/ganalysis/ganalysis';
import i18next from 'i18next';
import { IrootState } from '../../../rootRedux';
import { ISettingState } from '../reducers';
import { saveState } from '../../../lib/localStorage';
import { setMoozVersion } from '../actions';

const General = () => {
  const [imgURL, setImgURL] = useState(require('../../../images/moozModelPro.png'));
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18next.language);
  const { moozVersion } = useSelector<IrootState, ISettingState>(state => state.settingReducers);
  const dispatch = useDispatch();

  const changeLanguage = (event: any) => {
    if (event.target.value === i18next.language) {
      return;
    }
    localStorage.setItem("language", event.target.value);
    i18next.changeLanguage(event.target.value);
    setLang(event.target.value);
    buryevent('select_language', { 'event_category': 'settings', 'event_label': event.target.value });
  }

  const changeVersion = (event: any) => {
    dispatch(setMoozVersion(event.target.value));
    saveState({ moozVersion: event.target.value });
    let event_label = '';
    event.target.value === '200' ? event_label = 'MOOZ-2PLUS' : event_label = 'MOOZ-1/2';
    buryevent('select_mooz_type', { 'event_category': 'settings', 'event_label': event_label });
  }

  useEffect(() => {
    moozVersion === '200' ? setImgURL(require('../../../images/moozModelPro.png')) : setImgURL(require('../../../images/moozModel.png'));
  }, [moozVersion])

  return (
    <form style={{ marginTop: -10 }}>
      <div className={styles.formContainer}>
        <section>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <object
                data={require('../images/languages.svg')}
                type="image/svg+xml"
              >languages
                  </object>
              <label>{t('Language')}</label>
              <select
                className={classNames(
                  'form-control',
                  styles.formControl,
                  styles.short
                )}
                value={lang}
                onChange={changeLanguage}
              >
                <option value="en">English (US)</option>
                <option value="zh-tw">中文 (繁體)</option>
                <option value="zh-cn">中文 (简体)</option>
                <option value="ru">Русский</option>
                {/*<option value="cs">Čeština</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="fr">Français (France)</option>
                <option value="it">Italiano</option>
                <option value="hu">Magyar</option>
                <option value="nl">Nederlands</option>
                <option value="pt-br">Português (Brasil)</option>
                <option value="tr">Türkçe</option>
                <option value="ru">Русский</option>
                <option value="ja">日本語</option> */}
              </select>
            </div>
          </div>
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <object
                data={require('../images/version.svg')}
                type="image/svg+xml"
              >version
                  </object>
              <label>{t('MOOZ Versions')}</label>
              <select
                className={classNames(
                  'form-control',
                  styles.formControl,
                  styles.short
                )}
                value={moozVersion}
                onChange={changeVersion}
              >
                <option value="130">MOOZ-1/2</option>
                <option value="200">MOOZ-2 PLUS</option>
              </select>
            </div>
          </div>
        </section>
        <footer>
          <img src={imgURL} alt="#" />
        </footer>
      </div>
    </form>
  )
}

export default General;