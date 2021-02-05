import React from 'react';
import { connect } from 'react-redux';
import { SimulatorComponent } from '../../components/Simulator';
import { startRenderPathDemo } from '../../components/Simulator/RenderPath';

class Simulator extends React.Component<{ gcode: string }> {
  fileReader = new FileReader();

  canvasRef = React.createRef();

  state = {
    setStop: () => { },
    cncTotalTime: 0
  }


  componentDidMount() {
    this.fileReader.onload = (e) => {
      console.log(e);
      startRenderPathDemo(this.fileReader.result, this.canvasRef.current, this.RenderCallback);
    };
    if (this.props.gcode) {
      const prefix = 'G1 Z1\n';
      startRenderPathDemo(prefix + this.props.gcode, this.canvasRef.current, this.RenderCallback);
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.gcode !== this.props.gcode) {
      const prefix = 'G1 Z1\n';
      startRenderPathDemo(prefix + this.props.gcode, this.canvasRef.current, this.RenderCallback);
    }
  }

  RenderCallback = (setStop: () => void, cncTotalTime: number) => {
    this.setState({
      setStop: setStop,
      cncTotalTime: cncTotalTime
    });
  }

  handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const blob = e.target.files[0];
      this.fileReader.readAsText(blob);
    }
  }

  render() {
    return (
      <SimulatorComponent
        canvasRef={this.canvasRef} setStop={this.state.setStop}
        cncTotalTime={this.state.cncTotalTime}
        handleFileInput={this.handleFileInput}
      />
    );
  }
}

const mapStatesToProps = (states: any) => ({
  gcode: states.rootReducers.gcode
});
export default connect(mapStatesToProps)(Simulator);
