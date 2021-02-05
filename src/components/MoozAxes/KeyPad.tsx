import React, { Component } from 'react';
import { Row, Col, Button } from 'antd';
import styles from './index.styl';

interface Iprops{
  jog: (name: string) => void;
  disabled: boolean;
}
class KeyPad extends Component <Iprops> {
  keyButtonList: string[] = ['X0', 'Y+', 'Z0', 'X-', 'HOME', 'X+', 'Y0', 'Y-', 'X0Y0']

  render() {
    const { jog, disabled } = this.props;
    const button = this.keyButtonList.map((btnName) => {
      return (
        <Col span={8} key={btnName}>
          <Button
            type="default" onClick={() => {
              jog(btnName);
            }} style={{ width: '100%' }}
            disabled={disabled}
          >
            {btnName}
          </Button>
        </Col>
      );
    });
    return (
      <div className={styles.keyPad}>
        <Row gutter={[10, 10]} style={{ height: '100%' }}>
          <Col span={18} className={styles.leftPad}>
            {button}
          </Col>
          <div className={styles.rightPad}>
            <Button
              type="default" onClick={() => {
                jog('Z+');
              }}
              disabled={disabled}
            >Z+
            </Button>
            <Button
              type="default" onClick={() => {
                jog('Z-');
              }}
              disabled={disabled}
            >Z-
            </Button>
          </div>
        </Row>
      </div>
    );
  }
}
export default KeyPad;
