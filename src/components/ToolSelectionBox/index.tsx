import React, { Component } from 'react';
import { Switch, Row, Col, InputNumber } from 'antd';

interface Iprops {
  cncOption: any;
  setCncOption: (opt: any) => void;
  t: (str: string) => string;
}

class ToolSeletionBox extends Component<Iprops> {
  changeOption = (val: any, key: string) => {
    this.props.setCncOption({
      [key]: val
    });
  }

  render() {
    const { openToolDefinition, cuttingDiameter, cuttingAngulus } = this.props.cncOption;
    const { changeOption } = this;
    const { t } = this.props;
    return (
      <div style={{ padding: '30px 20px', borderBottom: "1px solid #F1F1F1", marginBottom: "20px" }}>
        <Row align="middle" gutter={[0, 16]}>
          <Col span={16}>{t('Customized Tool')}</Col>
          <Col span={8}><Switch
            checked={openToolDefinition} onChange={(val: boolean) => {
              changeOption(val, 'openToolDefinition');
            }}
          />
          </Col>
        </Row>
        <Row align="middle" gutter={[0, 16]}>
          <Col span={16}>{t('Cutting Diameter')}</Col>
          <Col span={8}>    <InputNumber
            min={0} step={0.1} value={cuttingDiameter}
            disabled={!openToolDefinition}
            formatter={value => `${value}mm`}
            parser={value => {
              return (value ? value.replace('mm', '') : 0);
            }}
            onChange={(value) => {
              changeOption(value, 'cuttingDiameter');
            }}
          />
          </Col>
        </Row>
        <Row align="middle">
          <Col span={16}>{t('Taper Angle')}</Col>
          <Col span={8}><InputNumber
            min={0} type="number" value={cuttingAngulus}
            disabled={!openToolDefinition}
            onChange={(value) => {
              changeOption(value, 'cuttingAngulus');
            }}
          />
          </Col>
        </Row>
      </div>
    );
  }
}
export default ToolSeletionBox;
