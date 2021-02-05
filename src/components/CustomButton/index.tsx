import React, { Component } from 'react';
import styles from './index.styl'
import classNames from 'classnames'
const defaultProps = {
  click: () => {
    console.log('click');
  },
  type: 'primary',
  text: 'primary',
  size: 'default',
  disabled: true
};

type DefaultProps = Readonly<typeof defaultProps>

type Iprops = {
  click: () => void;
  type: 'primary' | 'link' | 'default' | 'ghost' | 'dashed' | 'danger' | undefined;
  text: string;
  size: 'large' | 'default' | 'small' | undefined;
  disabled: boolean;
} & Partial<DefaultProps>;


class CustomButton extends Component<Iprops> {
  static defaultProps = defaultProps;

  render() {
    const { click, disabled } = this.props;
    return (
      <button
        type='button' onClick={click}
        disabled={disabled}
        className={classNames(styles.stopBtn, { [styles.disabled]: disabled })}
      >
        {this.props.text}
      </button>
    );
  }
}
export default CustomButton;
