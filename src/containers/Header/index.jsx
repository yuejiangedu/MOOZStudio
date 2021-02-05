// import classNames from 'classnames';
import React, { PureComponent } from 'react';
import { Navbar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import semver from 'semver';
import Push from 'push.js';
import PropTypes from 'prop-types';
import { useTranslation, withTranslation } from 'react-i18next';
import UrgencyStopButton from '../../components/CustomButton';
import settings from '../../config/settings';
import styles from './index.styl';
import moozHardware from '../../lib/jsonrpc/mooz';
import { updateRunGcodeState } from '../Workspace/actions';


const newUpdateAvailableTooltip = () => {
  const { t } = useTranslation();
  return (
    <Tooltip
      id="navbarBrandTooltip"
      style={{ color: '#fff' }}
    >
      <div>{t('New update available')}</div>
    </Tooltip>
  );
};

class Header extends PureComponent {
  static propTypes = {
    ...withRouter.propTypes,
    isRunning: PropTypes.bool,
    serialConnected: PropTypes.bool,
    wifiConnected: PropTypes.bool
  };

  state = this.getInitialState();

  actions = {
    requestPushPermission: () => {
      const onGranted = () => {
        this.setState({ pushPermission: Push.Permission.GRANTED });
      };
      const onDenied = () => {
        this.setState({ pushPermission: Push.Permission.DENIED });
      };
      // Note that if "Permission.DEFAULT" is returned, no callback is executed
      const permission = Push.Permission.request(onGranted, onDenied);
      if (permission === Push.Permission.DEFAULT) {
        this.setState({ pushPermission: Push.Permission.DEFAULT });
      }
    },
    checkForUpdates: () => {
      this._isMounted && this.setState({
        latestVersion: '2.4.0',
        latestTime: '2021.1.26'
      });
    }
  };

  _isMounted = false;

  getInitialState() {
    let pushPermission = '';
    try {
      // Push.Permission.get() will throw an error if Push is not supported on this device
      pushPermission = Push.Permission.get();
    } catch (e) {
      // Ignore
    }

    return {
      pushPermission: pushPermission,
      currentVersion: settings.version,
      latestVersion: settings.version
    };
  }

  stop = async () => {
    this.props.updateRunGcodeState({
      startPrint: false,
      pausePrint: false,
      toggleBtn: false,
      step: 0
    });
    await moozHardware.writeGcode('M25 S1');
    await moozHardware.writeGcode('M106 S0');
    await moozHardware.writeGcode('G28');
  }

  componentDidMount() {
    this._isMounted = true;

    // Initial actions
    this.actions.checkForUpdates();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { currentVersion, latestVersion } = this.state;
    const newUpdateAvailable = semver.lt(currentVersion, latestVersion);
    const tooltip = newUpdateAvailable ? newUpdateAvailableTooltip() : <div />;
    const { serialConnected, wifiConnected } = this.props;
    return (
      <Navbar
        fixedTop
        fluid
        inverse
        style={{
          border: 'none',
          margin: 0,
          backgroundColor: '#FAFDFF',
        }}
      >
        <Navbar.Header>
          <OverlayTrigger
            overlay={tooltip}
            placement="right"
          >
            <div
              style={{
                display: 'flex',
                height: 'auto',
                alignSelf: 'center',
                color: '#000',
                padding: '20px 0 10px 15px'
              }}
              target="_blank"
              title="MOOZ Studio"
            >
              <object
                style={{
                  marginRight: '9px',
                  height: '16px',
                  verticalAlign: 'middle'
                }}
                data={require('../../images/logo.svg')}
                alt="#"
                type="image/svg+xml"
              >MOOZ Studio
              </object>
              <span
                style={{
                  fontSize: '16px',
                  lineHeight: '20px',
                  textAlign: 'center'
                }}
              >
                MOOZ&nbsp;Studio
              </span>
              {newUpdateAvailable && (
                <span
                  className="label label-primary"
                  style={{
                    fontSize: '50%',
                    position: 'absolute',
                    top: 2,
                    right: 2
                  }}
                >
                  N
                </span>
              )}
            </div>
          </OverlayTrigger>
        </Navbar.Header>
        <div className={styles.rightControlBox}>
          <UrgencyStopButton
            type="danger" text={this.props.t('Stop')} click={this.stop}
            disabled={!(serialConnected || wifiConnected)}
          />
        </div>
      </Navbar>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    runGcodeState: state.workspaceReducers.runGcodeState,
    serialConnected: !!state.websocketReducer.serialConnected,
    wifiConnected: !!state.websocketReducer.wifiConnected,
    isRunning: !!state.websocketReducer.isRunning,
  };
};
const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    updateRunGcodeState
  }, dispatch);
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Header)));
