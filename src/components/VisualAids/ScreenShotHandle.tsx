import React, { Component } from 'react';
import { Icon ,Button } from 'antd';
import styles from './index.styl';

interface Iprops {
  extractFile: () => void;
  reset:()=>void;
  t: (str: string) => string;
}
class ScreenShotHandle extends Component<Iprops> {
  render() {
    return (
      <div className={styles.handleBox}>
        <Button
          type="primary" onClick={() => {
            this.props.reset();
          }}
        >
          <p>{this.props.t('Reset')}</p>
        </Button>
        <Button
          type="primary" onClick={() => {
            this.props.extractFile();
          }}
        >
          <p>{this.props.t('Done')} </p>
        </Button>
      </div>
    );
  }
}

export default ScreenShotHandle;
