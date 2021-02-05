import React from 'react';
import { connect } from 'react-redux';
import { ProgressComponent } from '../../components/Progress';


interface Iprops {
  percent: number,
  cancel?: () => void,
  showCancel?: boolean
}
class Progress extends React.Component<Iprops> {
  render() {
    return <ProgressComponent percent={this.props.percent} cancel={this.props.cancel} showCancel={this.props.showCancel} />;
  }
}
function mapStatesToProps(states: any) {
  return {
    percent: states.progressReducer.percent
  };
}
export default connect(mapStatesToProps)(Progress);
