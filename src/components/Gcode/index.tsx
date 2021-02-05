import React, { PureComponent } from 'react';
import _isEqual from 'lodash/isEqual';
import { withTranslation } from 'react-i18next';

import GcodeSizeTable from './GcodeSizeTable';

interface Iprops {
  gcodeSize: GcodeSize;
  t: (str: string) => string;
}
interface GcodeSize {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  zmin: number;
  zmax: number;
}
interface TableArr {
  name: string;
  min: number;
  max: number;
}
class Gcode extends PureComponent<Iprops> {
  constructor(props: Iprops) {
    super(props);
    this.state = {
      tableData: [
        { name: 'X', min: 0, max: 0 },
        { name: 'Y', min: 0, max: 0 },
        { name: 'Z', min: 0, max: 0 }
      ]
    };
  }

  componentDidUpdate(prevProps: any) {
    if (!_isEqual(prevProps.gcodeSize, this.props.gcodeSize)) {
      this.setTableData();
    }
  }

  setTableData = () => {
    const { xmin, xmax, ymin, ymax, zmin, zmax } = this.props.gcodeSize;
    this.setState({
      tableData: [
        { name: 'X', min: Math.round(xmin), max: Math.round(xmax) },
        { name: 'Y', min: Math.round(ymin), max: Math.round(ymax) },
        { name: 'Z', min: Math.round(zmin), max: Math.round(zmax) }
      ]
    });
  }

  render() {
    const { tableData } = this.state;
    return (
      <div style={{ position: 'relative', height: '117px' }}>
        <GcodeSizeTable tableData={tableData} />
      </div>
    );
  }
}
export default withTranslation()(Gcode);