import classNames from 'classnames';
import _camelCase from 'lodash/camelCase';
import _find from 'lodash/find';
import _isEqual from 'lodash/isEqual';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import General from './General';
import About from './About';
import styles from './index.styl';
import { burypageview } from '../../lib/ganalysis/ganalysis';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

interface Iprops {
  style: { [index: string]: string }
}

const Settings = (props: Iprops) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [sections] = useState([
    {
      id: 'general',
      path: 'general',
      title: 'General',
      icon: require('./images/general.svg'),
      component: () => <General />
    },
    {
      id: 'about',
      path: 'about',
      title: 'About',
      icon: require('./images/about.svg'),
      component: () => <About />



    }
  ]);
  const [activeSection, setActiveSection] = useState(sections[0]);

  const sectionItems = sections.map((section) => {
    return (
      <li
        key={section.id}
        className={classNames(
          { [styles.active]: activeSection.id === section.id }
        )}
      >
        <i>
          <object
            style={{
              verticalAlign: 'middle',
            }}
            data={section.icon}
            type="image/svg+xml"
          >{section.id}
          </object>
        </i>
        <Link to={`/settings/${section.path}`}>
          {t(section.title)}
        </Link>
      </li>
    );
  });

  useEffect(() => {
    if (location.pathname === '/settings') {
      burypageview({ 'page_path': '/settings' });
    }
    const sectionPath = location.pathname.replace(/^\/settings(\/)?/, '');
    const tmpActiveSection = _find(sections, { id: sectionPath }) || sections[0];
    setActiveSection(tmpActiveSection);
  }, [location.pathname])

  return (
    <div className={styles.settings} style={props.style}>
      <header>
        {t('Settings')}
      </header>
      <div className={classNames(styles.container, styles.border)}>
        <div className={classNames(styles.col, styles.sidenav)}>
          <nav className={styles.navbar}>
            <ul className={styles.nav}>
              {sectionItems}
            </ul>
          </nav>
        </div>
        <div className={classNames(styles.col, styles.section)}>
          <div className={styles.heading}>{t(activeSection.title)}</div>
          <div className={styles.content}>
            <activeSection.component />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings;