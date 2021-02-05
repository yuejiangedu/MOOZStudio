import React from 'react';
import classNames from 'classnames';
import { bindActionCreators, Dispatch } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { SliderValue } from 'antd/lib/slider';
import * as http from '../../lib/http/api';
import styles from './index.styl';
import PrintingVisualizer from '../../components/PrintingVisualizer/index';
import PrintingInformationBar from '../../components/PrintingInformationBar/index';
import PrintingGcodeVisualizer from '../../components/PrintingGcodeVisualizer/index';
import PrintingTopTools from '../../components/PrintingTopTools/index';
import * as printingActions from './actions';
import ModelOperation from '../../components/ModelOperation';
import PrintingProgress from '../../components/PrintingProgress';
import PrintingVisualizerToggle from '../../components/PrintingVisualizerToggle';
import PrintingPreviewControl from '../../components/PrintingPreviewControl';
import PrintingModelControl from '../../components/PrintingModelControl';
import PrintingOptionBox from '../../components/PrintingOptionBox';
import PrintingGcodeLayerControl from '../../components/PrintingGcodeLayerControl';
import { updateSliceProgress } from '../../lib/jsonrpc/websocketReducer';
import { CAMERA_MODE_ROTATE } from '../../constants';
import { IrootState } from '../../rootRedux/index';
import { burypageview, buryevent } from '../../lib/ganalysis/ganalysis';

const mapStateToProps = (state: IrootState) => {
  return {
    printingVersion: state.printingReducers.printingVersion,
    file: state.printingReducers.file,
    sliceProgress: state.websocketReducer.sliceProgress,
    gcode: state.printingReducers.gcode,
    gcodeLineType: state.printingReducers.gcodeLineType,
    controlPattern: state.printingReducers.controlPattern,
    model3Ddata: state.printingReducers.model3Ddata,
    clippingHeight: state.printingReducers.clippingHeight,
    configFile: state.printingReducers.configFile,
    printMaterial: state.printingReducers.printMaterial,
    model3Dsize: state.printingReducers.model3Dsize,
    modelDetection: state.printingReducers.modelDetection,
    isometricRotation: state.printingReducers.isometricRotation
  };
};
const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators({
    setPrintingVersion: printingActions.setPrintingVersion,
    updatePrintingFile: printingActions.updatePrintingFile,
    updatePrintingGcode: printingActions.updatePrintingGcode,
    updateGcodeLineType: printingActions.updateGcodeLineType,
    updateClippingHeight: printingActions.updateClippingHeight,
    updateControlPattern: printingActions.updateControlPattern,
    updateModel3Ddata: printingActions.updateModel3Ddata,
    updateSliceProgress: updateSliceProgress,
    updateConfigFile: printingActions.updateConfigFile,
    updateMaterial: printingActions.updateMaterial,
    updateModel3Dsize: printingActions.updateModel3Dsize,
    updateModelDection: printingActions.updateModelDection
  }, dispatch);
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>

interface Iprops extends PropsFromRedux {
  location: any;
  style: { display: string };
  history: any;
}
interface Istate {
  showGcodeVisualizer: boolean;
  progressTip: string;
  cameraMode: string;
  currentView: string;
  cameraAspect: { [index: string]: string[] };
  viewZoom: { gcodeView: number; modelView: number };
}
class Printing extends React.Component<Iprops, Istate> {
  public state = {
    showGcodeVisualizer: false,
    progressTip: 'Slicing',
    cameraMode: CAMERA_MODE_ROTATE,
    cameraAspect: {
      gcodeView: ['front'],
      modelView: ['front']
    },
    viewZoom: {
      gcodeView: 1,
      modelView: 1
    },
    currentView: 'modelView'
  }

  operateZoom = (key: string) => {
    const curView = this.state.currentView;
    const val: { [index: string]: number } = {
      'zoomIn': this.state.viewZoom[curView] - 0.1,
      'zoomOut': this.state.viewZoom[curView] + 0.1
    };
    this.setState((state) => {
      return {
        viewZoom: {
          ...state.viewZoom,
          [curView]: val[key]
        }
      };
    });
  }

  cameraOperate = (key: string) => {
    const curView = this.state.currentView;
    if (/^[3d|top|right|left|front]+$/.test(key)) {
      this.setState((state) => {
        return {
          cameraAspect: {
            ...state.cameraAspect,
            [curView]: [key]
          }
        };
      });
    } else {
      (key === 'zoomIn' || key === 'zoomOut') && this.operateZoom(key);
    }
  }

  generating = () => {
    const { name, path, type } = this.props.file;
    const { gcode } = this.props;
    const { model3Ddata } = this.props;
    buryevent('btn_generate_gcode', { 'event_category': '3dp' });
    if (name && path && type) {
      http.sliceModel({ name, path, type, model3Ddata }).then((data) => {
        const { result } = data.data;
        const gcodeStr = data.data.gcode.join('\n');
        gcode.data === gcodeStr ? this.toggle(1) : this.props.updatePrintingGcode({ data: gcodeStr, msg: result });
        buryevent('status_generating_gcode', { 'event_category': '3dp', 'event_label': 'success' });
      });
    }
  }

  clippingModel = (height: SliderValue) => {
    this.props.updateClippingHeight(Number(height));
  }

  changLineTypeVal = (label: string, value: boolean) => {
    const { gcodeLineType } = this.props;
    const newList = gcodeLineType.map((item) => {
      if (item.label === label) {
        item.value = value;
      }
      return item;
    });
    this.props.updateGcodeLineType(newList);
  }

  toggle = (key: number) => {
    this.setState({
      showGcodeVisualizer: !!key,
      currentView: key ? 'gcodeView' : 'modelView'
    });
  }

  creatingGcodeModel = (prg: number) => {
    this.setState({
      progressTip: 'Generating preview model'
    });
    this.props.updateSliceProgress({ progress: prg * 100 });
    if (prg === 1) {
      setTimeout(() => {
        this.props.updateSliceProgress({ progress: 0 });
        this.setState({
          progressTip: 'Slicing',
          showGcodeVisualizer: true,
          currentView: 'gcodeView'
        });
      }, 500);
    }
  }

  exportGcode = () => {
    buryevent('btn_export_gcode', { 'event_category': '3dp', 'event_label': 'clicked' });
    const filename = this.props.file.name + '.gcode';
    const content = this.props.gcode.data;
    const ele: HTMLAnchorElement = document.createElement('a');
    ele.download = filename;
    ele.style.display = 'none';
    // 字符内容转变成blob地址
    const blob = new Blob([content]);
    ele.href = URL.createObjectURL(blob);
    ele.click();
    URL.revokeObjectURL(ele.href);
  }

  componentDidUpdate(pre: Iprops) {
    if (this.props.location.pathname === '/printing' && pre.location.pathname !== this.props.location.pathname) {
      burypageview({ 'page_path': '/3dp' });
    }
  }

  render() {
    const { location,
      printingVersion,
      style,
      setPrintingVersion,
      updatePrintingFile,
      file,
      history,
      sliceProgress,
      gcode,
      gcodeLineType,
      clippingHeight,
      controlPattern,
      model3Ddata,
      updateModel3Ddata,
      configFile,
      updateConfigFile,
      printMaterial,
      updateMaterial,
      updateModel3Dsize,
      model3Dsize,
      modelDetection,
      updateModelDection,
      isometricRotation } = this.props;
    const { cameraAspect, viewZoom } = this.state;
    return (
      <div style={style} className={classNames(styles.container, 'mooz-content')}>
        <section className={classNames(styles.main, 'mooz-content-box')}>

          <PrintingGcodeVisualizer
            show={true} location={location} printingVersion={printingVersion}
            gcode={gcode.data}
            gcodeLineList={gcodeLineType}
            clippingHeight={clippingHeight}
            creatingGcodeModel={this.creatingGcodeModel}
            zoom={viewZoom.gcodeView}
            cameraPosition={cameraAspect.gcodeView}
            style={{
              display: (this.state.showGcodeVisualizer) ? 'block' : 'none'
            }}
          />

          <PrintingVisualizer
            show={true} location={location}
            printingVersion={printingVersion}
            file={file}
            controlPattern={controlPattern}
            updateModel3Ddata={updateModel3Ddata}
            model3Ddata={model3Ddata}
            zoom={viewZoom.modelView}
            cameraPosition={cameraAspect.modelView}
            updatePrintingFile={updatePrintingFile}
            updateModel3Dsize={updateModel3Dsize}
            updateModelDection={updateModelDection}
            isometricRotation={isometricRotation}
            model3Dsize={model3Dsize}
            style={{
              display: (this.state.showGcodeVisualizer) ? 'none' : 'block'
            }}
          />
          <PrintingTopTools
            setPrintingVersion={setPrintingVersion} printingVersion={printingVersion} loadModel={updatePrintingFile}
            history={history}
            show={!this.state.showGcodeVisualizer}
            operate={this.cameraOperate}
          />
          <PrintingProgress tips={this.state.progressTip} progress={sliceProgress} />
          <PrintingVisualizerToggle
            active={this.state.showGcodeVisualizer} leftText="Prepare" rightText="Preview"
            toggle={this.toggle}
          />
          <PrintingPreviewControl
            list={gcodeLineType} onChange={this.changLineTypeVal} show={this.state.showGcodeVisualizer}
          />
          <PrintingModelControl
            show={!this.state.showGcodeVisualizer}
            disable={!file.path}
          />
          <PrintingInformationBar modelName={file.name} model3Dsize={model3Dsize} gcodeSize={gcode.msg} />
          <PrintingGcodeLayerControl show={this.state.showGcodeVisualizer} onSlide={this.clippingModel} />
        </section>
        <aside className={classNames(styles.asider, 'mooz-option-sider')}>
          <div className={styles.asiderInner}>
            <PrintingOptionBox
              updateConfigFile={updateConfigFile} configFile={configFile} printMaterial={printMaterial}
              updateMaterial={updateMaterial}
              printingVersion={printingVersion}
            />
            <ModelOperation
              generating={this.generating}
              export={this.exportGcode}
              generatingDisabled={!modelDetection}
              exportDisabled={!gcode.data}
            />
          </div>
        </aside>
      </div>
    );
  }
}

export default connector(Printing);
