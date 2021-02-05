import React from 'react';
import { Input, Checkbox, Button } from 'antd';
import styles from './index.styl';
import { useTranslation } from 'react-i18next';

interface Iprops {
  inputList: Array<string>;
  top: string;
  data: {
    [index: string]: number | string;
  };
  title: string;
  onchange: (value: string, axis: string) => void;
  onblur: (value: string, axis: string, unit: string) => void;
  uniformScale: boolean;
  changeUniformScale: (checked: boolean) => void;
  reset: () => void;
  IsometricRot: boolean;
  changeIsometricRotaion: (checked: boolean) => void;
}

const FONTCOLOR: { [index: string]: string } = {
  'X': '#E14E2A',
  'Y': '#52E592',
  'Z': '#3282FF'
};

const SideInput = (props: Iprops) => {
  const { t } = useTranslation();
  const inputs = props.inputList.map((axis) => {
    return (
      props.data[axis] !== undefined
        ? (
          <section key={axis}>
            <label style={{ color: FONTCOLOR[axis] }}>
              {axis}
            </label>
            <Input
              suffix={props.data.unit}
              value={props.data[axis]} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                props.onchange(event.target.value, axis);
              }}
              onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
                props.onblur(event.target.value, axis, props.data.unit as string);
              }}
              onKeyDown={(event: React.KeyboardEvent) => {
                event.keyCode === 13 && props.onblur(props.data[axis] as string, axis, props.data.unit as string);
              }}
            />
          </section>
        ) : null
    );
  });

  const scalePercentInput = props.inputList.map((axis) => {
    return (
      <section key={`${axis}p`}>
        <Input
          suffix="%"
          value={props.data[`${axis}p`]} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            props.onchange(event.target.value, `${axis}p`);
          }}
          onBlur={(event: React.ChangeEvent<HTMLInputElement>) => {
            props.onblur(event.target.value, `${axis}`, '%');
          }}
          onKeyDown={(event: React.KeyboardEvent) => {
            event.keyCode === 13 && props.onblur(props.data[`${axis}p`] as string, `${axis}`, '%');
          }}
        />
      </section>
    );
  });

  return (
    <section className={styles.sideInput}>
      <header>
        {t(props.title)}
      </header>
      <div className={styles.sideInputContent}>
        <ul>
          {inputs}
        </ul>
        {props.title === 'SCALE' ? (
          <ul>
            {scalePercentInput}
          </ul>
        ) : null}
      </div>
      <footer style={{ display: props.title === 'SCALE' ? 'flex' : 'none' }}>
        <Checkbox
          checked={props.uniformScale}
          onChange={(event) => {
            props.changeUniformScale(event.target.checked);
          }}
        >
          {t('Proportional zoom')}
        </Checkbox>
        <Button type="primary" onClick={props.reset}>
          {t('Reset')}
        </Button>
      </footer>
      <footer style={{ display: props.title === 'ROTATE' ? 'flex' : 'none' }}>
        <Checkbox
          checked={props.IsometricRot}
          onChange={(event) => {
            props.changeIsometricRotaion(event.target.checked);
          }}
        >
          {t('IsometricRotation')}
        </Checkbox>
      </footer>
      <i style={{ top: props.top }} />
    </section>
  );
};

export default SideInput;
