import React, { PureComponent } from 'react';
import { Slider, InputNumber, Row, Col } from 'antd';
import styles from './index.styl';

interface Iprops {
  cncOption: any;
  setCncOption: (obj: any) => void;
  t: (str: string) => void;
  disable: boolean;
}
class SliderOption extends PureComponent<Iprops> {
  sliderOptionArr: any[];

  constructor(props: Iprops) {
    super(props);
    this.sliderOptionArr = [{
      label: 'Spindle Speed',
      value: 'cncThres'
    }];
  }

  changeOption = (value: any, key: string) => {
    const { setCncOption } = this.props;
    setCncOption({ [key]: value });
  }

  render() {
    const { disable } = this.props;
    const slideOption = this.sliderOptionArr.map((item) => {
      const propsVal = this.props.cncOption[item.value];
      return (
        <div className={styles.slider} key={item.value}>
          <label>{this.props.t(item.label)}:</label>
          <Row>
            <Col span={16}>
              <Slider
                min={1}
                max={100}
                onChange={(value) => {
                  this.changeOption(value, item.value);
                }}
                tooltipVisible={false}
                value={typeof propsVal === 'number' ? propsVal : 0}
                disabled={disable}
              />
            </Col>
            <Col span={8}>
              <InputNumber
                style={{ width: '50px', marginLeft: 16 }}
                min={1}
                max={100}
                type=""
                disabled={disable}
                value={propsVal}
                onChange={(value) => {
                  this.changeOption(value, item.value);
                }}
              />
            </Col>
          </Row>
        </div>
      );
    });
    return (
      <React.Fragment>
        {slideOption}
      </React.Fragment>
    );
  }
}
export default SliderOption;
