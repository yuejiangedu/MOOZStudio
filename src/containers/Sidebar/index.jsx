import classNames from 'classnames';
import React, { PureComponent } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import styles from './index.styl';

class Sidebar extends PureComponent {
  static propTypes = {
    ...withRouter.propTypes
  };

  render() {
    const { pathname = '' } = this.props.location;
    const { t } = this.props;
    return (
      <nav className={styles.navbar}>
        <ul className={styles.nav}>
          <li
            className={classNames(
              { [styles.active]: pathname.indexOf('/workspace') === 0 }
            )}
          >
            <Link to="/workspace" title={t('Workspace')}>
              <img
                src={require('./images/xyz.svg')}
                alt="#"
              />
            </Link>
            <span>{t('Workspace')}</span>
          </li>
          <li
            className={classNames(
              { [styles.active]: pathname.indexOf('/printing') === 0 }
            )}
          >
            <Link to="/printing">
              <img
                src={require('./images/printing.svg')}
                alt="#"
              />
            </Link>
            <span>{t('3D Print')}</span>
          </li>
          <li
            className={classNames(
              { [styles.active]: pathname.indexOf('/laser') === 0 }
            )}
          >
            <Link to="/laser">
              <img
                src={require('./images/laser.svg')}
                alt="#"
              />
            </Link>
            <span>{t('Laser')}</span>
          </li>
          <li
            className={classNames(
              { [styles.active]: pathname.indexOf('/cnc') === 0 }
            )}
          >
            <Link to="/cnc">
              <img
                src={require('./images/cnc.svg')}
                alt="#"
              />
            </Link>
            <span>{t('CNC')}</span>
          </li>
          <li
            className={classNames(
              { [styles.active]: pathname.indexOf('/files') === 0 }
            )}
          >
            <Link to="/files">
              <img
                src={require('./images/files.svg')}
                alt="#"
              />
            </Link>
            <span>{t('Files')}</span>
          </li>
        </ul>
        <ul className={styles.nav}>
          <li
            className={classNames(
              { [styles.active]: pathname.indexOf('/settings') === 0 },
              styles.setting
            )}
          >
            <Link to="/settings" title={t('Settings')}>
              <img
                style={{
                  height: '38px',
                  verticalAlign: 'middle'
                }}
                src={require('./images/setting.svg')}
                alt="#"
              />
            </Link>
          </li>
        </ul>
      </nav>
    );
  }
}

export default withRouter(withTranslation()(Sidebar));
