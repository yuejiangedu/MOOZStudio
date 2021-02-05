/* eslint import/no-dynamic-require: 0 */
import Font from 'gcanvas/lib/font';
import { Provider } from 'react-redux';
import moment from 'moment';
import qs from 'qs';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Route
} from 'react-router-dom';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { TRACE, DEBUG, INFO, WARN, ERROR } from 'universal-logger';
import { initReactI18next } from 'react-i18next';
import ReduxStore from './rootRedux';
import { Provider as GridSystemProvider } from './components/GridSystem';
import settings from './config/settings';
import log from './lib/log';
import series from './lib/promise-series';
import promisify from './lib/promisify';
import App from './containers/App';
import './styles/vendor.styl';
import './styles/app.styl';
import './assets/icon/iconfont.css';
import '!!script-loader!./lib/gcode/opencv';

const renderPage = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const rootContainer = (AppComponent: React.FunctionComponent<any>) => (
    <GridSystemProvider
      breakpoints={[576, 768, 992, 1200]}
      containerWidths={[540, 720, 960, 1140]}
      columns={12}
      gutterWidth={0}
      layout="floats"
    >
      <Provider store={ReduxStore}>
        <Router>
          <Route path="/" component={AppComponent} />
        </Router>
      </Provider>
    </GridSystemProvider>
  );
  ReactDOM.render(rootContainer(App), container);
  if ((module as any).hot) {
    (module as any).hot.accept('./containers/App', () => {
      import('./containers/App').then(({ default: NewApp }) => {
        ReactDOM.render(rootContainer(NewApp), container);
      });
    });
  }
};
const requireFzFont = () => {
  Font.load(require('!!./fonts/fz_regular.typeface'));
};
requireFzFont();
series([
  () => {
    const obj = qs.parse(window.location.search.slice(1));
    const level = {
      trace: TRACE,
      debug: DEBUG,
      info: INFO,
      warn: WARN,
      error: ERROR
    }[(obj.log_level as any) || (settings.log.level as any)];
    log.setLevel(level);
  },
  () => promisify((next: any) => {
    i18next
      .use(LanguageDetector)
      .use(initReactI18next)
      .init(settings.i18next, () => {
        next();
      });
  })(),
  () => promisify((next: any) => {
    const locale = i18next.language;
    if (locale === 'en') {
      next();
      return;
    }

    require('bundle-loader!moment/locale/' + locale)(() => {
      log.debug(`moment: locale=${locale}`);
      moment().locale(locale);
      next();
    });
  })()
], null).then(() => {
  log.info(`${settings.productName} ${settings.version}`);

  { // Prevent browser from loading a drag-and-dropped file
    // @see http://stackoverflow.com/questions/6756583/prevent-browser-from-loading-a-drag-and-dropped-file
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    }, false);

    window.addEventListener('drop', (e) => {
      e.preventDefault();
    }, false);
  }

  { // Hide loading
    const loading = document.getElementById('loading');
    loading && loading.remove();
  }

  { // Change backgrond color after loading complete
    const body = document.querySelector('body');
    if (body) {
      body.style.backgroundColor = '#FAFDFF';
    }
  }
  renderPage();
}).catch((err: string) => {
  log.error(err);
});
