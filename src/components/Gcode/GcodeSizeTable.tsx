import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import styles from './index.styl';

interface Iprops {
  tableData: Array<TableArr>;
  t: (str: string) => string;
}
interface TableArr {
  name: string;
  min: number;
  max: number;
}
class Gcode extends PureComponent<Iprops> {
  render() {
    const { t } = this.props;
    const tbody = this.props.tableData.map((item: TableArr) => {
      return (
        <tr key={item.name}>
          <td>
            {item.name}
          </td>
          <td>
            {item.min} mm
          </td>
          <td>
            {item.max} mm
          </td>
          <td>
            {item.max - item.min} mm
          </td>
        </tr>
      );
    });
    return (
      <table className={styles.gcodeTable}>
        <thead>
          <tr>
            <td>
              {t('Axes')}
            </td>
            <td>
              {t('Min')}
            </td>
            <td>
              {t('Max')}
            </td>
            <td>
              {t('Dimension')}
            </td>
          </tr>
        </thead>
        <tbody />
        <tbody>
          {tbody}
        </tbody>
      </table>
    );
  }
}
export default withTranslation()(Gcode);
