import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import i18next from 'i18next';
import { Switch, Route, useLocation, useHistory } from 'react-router';
import Header from './Header';
import Sidebar from './Sidebar';
import Workspace from './Workspace';
import styles from './App.styl';
import { updateDPI } from '../rootRedux/actions';
import { getDPI } from '../lib/units';
import Files from './Files';
import Settings from './Settings';
import Laser from './Laser';
import CNC from './CNC';
import Printing from './Printing';

const App = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const accepted = ([
    '/workspace',
    '/settings',
    '/settings/general',
    '/settings/about',
    '/laser',
    '/cnc',
    '/printing',
    '/files'
  ].indexOf(location.pathname) >= 0);

  const updateLanguages = () => {
    const browerLang = navigator.language ? navigator.language.toLowerCase() : (navigator as any).userLanguage.toLowerCase();
    const Cachelang = localStorage.getItem('language');
    Cachelang ? i18next.changeLanguage(Cachelang) : i18next.changeLanguage(browerLang);
  };

  useEffect(() => {
    const DPI = getDPI()[0] || 96;
    dispatch(updateDPI(DPI));
    updateLanguages();
    document.oncontextmenu = () => {
      return false;
    };
  }, []);

  if (!accepted) {
    return (
      <Redirect
        to={{
          pathname: '/workspace',
          state: {
            from: location
          }
        }}
      />
    );
  }
  return (
    <div>
      <Header />
      <aside className={styles.sidebar} id="sidebar">
        <Sidebar />
      </aside>
      <div className={styles.main}>
        <div className={styles.content}>
          <Laser
            style={{
              display: (location.pathname !== '/laser') ? 'none' : 'flex'
            }}
          />
          <CNC
            style={{
              display: (location.pathname !== '/cnc') ? 'none' : 'flex'
            }}
          />
          <Printing
            location={location}
            history={history}
            style={{
              display: (location.pathname !== '/printing') ? 'none' : 'flex'
            }}
          />
          <Workspace
            style={{
              display: (location.pathname !== '/workspace') ? 'none' : 'flex'
            }}
          />
          <Switch>
            <Route path="/settings">
              <Settings
                style={{
                  display: location.pathname.includes('/settings') ? 'block' : 'none'
                }}
              />
            </Route>
            <Route path="/files">
              <Files
                location={location}
              />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
};
export default App;
