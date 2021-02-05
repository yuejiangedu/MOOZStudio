import React, { Component } from 'react';
import includes from 'lodash/includes';
import cx from 'classnames';
import { withTranslation } from 'react-i18next';
import styles from './index.styl';
import {changeDecimal} from '../../lib/units'
import {
  AXIS_E,
  AXIS_X,
  AXIS_Y,
  AXIS_Z
} from '../../constants';

interface Iprops{
  tableData: any;
  axes: string;
  t: (str: string) => string;
}
class AxesTable extends Component <Iprops> {
  columns: Array<any>;

  constructor(props: any) {
    super(props);
    this.columns = [
      {
        title: props.t('Axes'),
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: props.t('Machine Position'),
        dataIndex: 'value',
        key: 'value',
      }
    ];
  }

  renderAxis = (name: string) => {
    return Object.keys(this.props.tableData).map((axis: string): JSX.Element | undefined => {
      if (axis === name) {
        return (
          <tr key={axis}>
            <td>
              {axis.toUpperCase()}
            </td>
            <td>
              {changeDecimal(this.props.tableData[axis],3)} 
              <span>mm</span>
            </td>
          </tr>
        );
      } else {
        return undefined;
      }
    });
  }

  render() {
    const { axes, t } = this.props;
    const hasAxisE = includes(axes, AXIS_E);
    const hasAxisX = includes(axes, AXIS_X);
    const hasAxisY = includes(axes, AXIS_Y);
    const hasAxisZ = includes(axes, AXIS_Z);
    return (
      <table className={cx('table-bordered', styles.axesTable)}>
        <thead>
          <tr>
            <th title={t('Axes')}>{t('Axes')}</th>
            <th title={t('Machine Position')}>{t('Machine Position')}</th>
          </tr>
        </thead>
        <tbody>
          {hasAxisE && this.renderAxis(AXIS_E)}
          {hasAxisX && this.renderAxis(AXIS_X)}
          {hasAxisY && this.renderAxis(AXIS_Y)}
          {hasAxisZ && this.renderAxis(AXIS_Z)}
        </tbody>
      </table>
    );
  }
}
export default withTranslation()(AxesTable);
