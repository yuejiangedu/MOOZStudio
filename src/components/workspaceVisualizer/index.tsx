// import chainedFunction from 'chained-function';
import ExpressionEvaluator from 'expr-eval';
import pubsub from 'pubsub-js';
import React from 'react';
import { Layout } from 'antd';
import * as History from 'history';
import log from '../../lib/log';
import * as WebGL from '../../lib/three/WebGL';
import styles from './index.styl';
import Visualizer from './WorkspaceVisualizer';
import PrimaryToolbar from './PrimaryToolbar';
import WorkflowControl from './WorkflowControl';
import Dashboard from '../WorkspaceDashboard/Dashboard';
import Loading from '../WorkspaceLoading/Loading';
import ExportGcode from '../FileHandleBox/ExportGcode';
import SportControl from '../SportControl';

import VisualControl from '../VisualControl';

import {
  CAMERA_MODE_PAN,
  CAMERA_MODE_ROTATE
} from '../../constants';


const { Header, Content } = Layout;

const translateExpression = (function () {
  const { Parser } = ExpressionEvaluator;
  const reExpressionContext = new RegExp(/\[[^\]]+\]/g);

  return function (gcode: string) {
    if (typeof gcode !== 'string') {
      log.error(`Invalid parameter: gcode=${gcode}`);
      return '';
    }

    const lines = gcode.split('\n');
    return lines.map(line => {
      try {
        line = line.replace(reExpressionContext, (match) => {
          const expr = match.slice(1, -1);
          return Parser.evaluate(expr);
        });
      } catch (e) {
        // Bypass unknown expression
      }

      return line;
    }).join('\n');
  };
}());

//显示gcode文件名的组件
const GCodeName = ({ name, ...props }: { name: string }) => {
  if (!name) {
    return null;
  }
  return (
    <div
      style={{
        display: 'inline-block',
        position: 'absolute',
        bottom: 8,
        left: 8,
        fontSize: '1.5rem',
        color: '#000',
        opacity: 0.5,
      }}
      {...props}
    >
      {name}
    </div>
  );
};

interface Iprops {
  generateGcodeType: string;
  location: History.Location;
  setGcodeSize: (gcodeSize: { xmax: number; xmin: number; ymax: number; ymin: number; zmax: number; zmin: number }) => void;
  gcode: string;
  isCheckDoor: boolean;
  runGcodeState: { [index: string]: boolean };
  updateRunGcodeState: (text: string) => { [index: string]: string };
  moozVersion: string;
  history: History;
  setProgressAction: (progress: number) => void;
  setGcode: (gcode: string) => void;
}
interface Istate {
  gcode: { displayName: boolean; loading: boolean; content: string; name: string };
  disabled: boolean;
  projection: string;
  objects: { [index: string]: { [index: string]: boolean } };
  cameraMode: string;
  cameraPosition: string[];
  viewZoom: number;
}

class VisualizerWidget extends React.Component<Iprops, Istate> {
  public state: Istate = {
    gcode: {
      displayName: true,
      loading: false,
      content: '',
      name: ''
    },
    disabled: false,
    projection: 'orthographic',
    objects: {
      coordinateSystem: {
        visible: true
      },
      gridLineNumbers: {
        visible: true
      }
    },
    cameraMode: CAMERA_MODE_ROTATE,
    cameraPosition: ['3d'], // 'top', '3d', 'front', 'left', 'right'
    viewZoom: 1
  };

  actions = {
    uploadFile: (gcode: string, meta: { name: string; size: number }) => {
      const { name } = { ...meta };
      gcode = translateExpression(gcode);
      this.actions.loadGCode(name, gcode);
    },
    loadGCode: (name: string, gcode: string) => {
      this.setState((state) => ({
        gcode: {
          ...state.gcode,
          content: gcode,
          name: name
        }
      }));
    },

    toggle3DView: () => {
      if (!WebGL.isWebGLAvailable() && this.state.disabled) {
        return;
      }
      this.setState((state) => ({
        disabled: !state.disabled
      }));
    },

    toPerspectiveProjection: () => {
      this.setState(() => ({
        projection: 'perspective'
      }));
    },
    toOrthographicProjection: () => {
      this.setState(() => ({
        projection: 'orthographic'
      }));
    },
    toggleGCodeFilename: () => {
      this.setState((state) => ({
        gcode: {
          ...state.gcode,
          displayName: !state.gcode.displayName
        }
      }));
    },
    toggleCoordinateSystemVisibility: () => {
      this.setState((state) => ({
        objects: {
          ...state.objects,
          coordinateSystem: {
            ...state.objects.coordinateSystem,
            visible: !state.objects.coordinateSystem.visible
          }
        }
      }));
    },
    toggleGridLineNumbersVisibility: () => {
      this.setState((state) => ({
        objects: {
          ...state.objects,
          gridLineNumbers: {
            ...state.objects.gridLineNumbers,
            visible: !state.objects.gridLineNumbers.visible
          }
        }
      }));
    },
    loadCallback: () => {
      this.setState((state) => ({
        gcode: {
          ...state.gcode,
          loading: false,
        }
      }));
    },
    changeLoadstate: () => {
      this.setState((state) => ({
        gcode: {
          ...state.gcode,
          loading: true,
        }
      }));
    },

    camera: {
      toRotateMode: () => {
        this.setState(() => ({
          cameraMode: CAMERA_MODE_ROTATE
        }));
      },
      toPanMode: () => {
        this.setState(() => ({
          cameraMode: CAMERA_MODE_PAN
        }));
      },
      operateZoom: (key: string) => {
        const val: { [index: string]: number } = {
          'zoomIn': this.state.viewZoom - 0.1,
          'zoomOut': this.state.viewZoom + 0.1
        };
        this.setState({
          viewZoom: val[key]
        });
      },

      cameraOperate: (key: string) => {
        if (/^[3d|top|right|left|front]+$/.test(key)) {
          this.setState({ cameraPosition: [key] });
        } else if (/^[toPanMode|toRotateMode]+$/.test(key)) {
          key === 'toPanMode' && this.actions.camera.toPanMode();
          key === 'toRotateMode' && this.actions.camera.toRotateMode();
        } else {
          (key === 'zoomIn' || key === 'zoomOut') && this.actions.camera.operateZoom(key);
        }
      }
    }
  }

  componentDidMount() {
    //订阅gcode更新
    pubsub.subscribe('gcode:update', (_: string, Infos: { gcode: string; fileinfo: { name: string; size: number } }) => {
      this.actions.uploadFile(Infos.gcode, Infos.fileinfo);
      this.props.setProgressAction(0);
    });
  }

  componentWillUnmount() {
    pubsub.unsubscribe('gcode:update');
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.location.pathname !== this.props.location.pathname && this.props.location.pathname === '/workspace') {
      setTimeout(() => {
        this.setState({
          disabled: false
        });
      }, 0);
    }
  }

  render() {
    const { generateGcodeType, gcode, isCheckDoor, runGcodeState, updateRunGcodeState, moozVersion, history, setProgressAction, setGcodeSize } = this.props;
    const capable = {
      view3D: WebGL.isWebGLAvailable() && !this.state.disabled
    };
    const showDashboard = !capable.view3D && !this.state.gcode.loading;
    const showVisualizer = capable.view3D;
    return (
      <Layout className={styles.visualizer}>
        <Header className={styles.header}>
          {!this.state.disabled && (
            <VisualControl
              cameraMode={this.state.cameraMode} hideViewBtn={false} hideDropdownMenu={false}
              hideFitBtn={true} onClick={this.actions.camera.cameraOperate}
            />
          )}

          <div className={styles.rightTool}>
            <SportControl
              gcode={gcode} isCheckDoor={isCheckDoor} runGcodeState={runGcodeState}
              updateRunGcodeState={updateRunGcodeState}
            />
            <PrimaryToolbar
              state={this.state}
              actions={this.actions}
            />
            <WorkflowControl
              uploadFile={this.actions.uploadFile}
            />
            <ExportGcode {...this.props} gcode={gcode} />
          </div>
        </Header>
        <Content>
          {this.state.gcode.loading &&
            <Loading />
          }
          {showDashboard ? (
            <Dashboard
              show={true}
              state={this.state}
            />
          ) : null}

          {WebGL.isWebGLAvailable() && (
            <Visualizer
              show={showVisualizer}
              cameraPosition={this.state.cameraPosition}
              generateGcodeType={generateGcodeType}
              moozVersion={moozVersion}
              state={this.state}
              history={history}
              setProgressAction={setProgressAction}
              setGcodeSize={setGcodeSize}
              zoom={this.state.viewZoom}
              loadCallback={this.actions.loadCallback}
              changeLoadstate={this.actions.changeLoadstate}
            />
          )}
          {(showVisualizer && this.state.gcode.displayName) && (
            <GCodeName
              name={this.state.gcode.name}
            />
          )}
        </Content>
      </Layout>
    );
  }
}

export default VisualizerWidget;
