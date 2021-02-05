import React, { PureComponent } from 'react';
import { InputNumber } from 'antd';
interface Iprops {
  cncOption: any;
  setCncOption: (obj: any) => void;
  t: (str: string) => string;
  disable: boolean;
}
class InputOption extends PureComponent<Iprops> {
  inputOptionArr: any[];

  constructor(props: Iprops) {
    super(props);
    this.inputOptionArr = [{
      label: 'Carving Speed',
      value: 'cncSpeed',
      unit: 'mm/min',
      step: 5
    },
    {
      label: 'Traveling Speed',
      value: 'deadheadSpeed',
      unit: 'mm/min',
      step: 5
    },
    {
      label: 'Carving Depth',
      value: 'curvingMax',
      unit: 'mm',
      step: 0.1
    },
    {
      label: 'Step Depth',
      value: 'depth',
      unit: 'mm',
      step: 0.1
    },
    {
      label: 'Clearance Height',
      value: 'saveHeight',
      unit: 'mm',
      step: 0.1
    }];
  }

  changeOption = (value: number | undefined, key: string) => {
    const { setCncOption } = this.props;
    setCncOption({ [key]: value });
  }

  render() {
    const { disable } = this.props;
    const inputOption = this.inputOptionArr.map((item) => {
      return (
        <section key={item.value}>
          <label>{this.props.t(item.label)}:</label>
          <InputNumber
            min={0} type="" value={this.props.cncOption[item.value]}
            step={item.step}
            title=""
            disabled={disable}
            onChange={(val) => {
              this.changeOption(val, item.value);
            }}
          /> {item.unit}
        </section>
      );
    });
    return (
      <React.Fragment>
        {inputOption}
      </React.Fragment>
    );
  }
}

export default InputOption;
