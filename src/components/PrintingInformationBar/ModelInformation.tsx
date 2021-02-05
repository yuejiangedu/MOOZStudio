import React from 'react';
import styles from './index.styl';
import { IprintingState } from '../../containers/Printing/types';

interface Iprops extends Pick<IprintingState, 'model3Dsize'> {
  modelName: string;
}
const ModelInformation = (props: Iprops) => {
  const { model3Dsize, modelName } = props;
  return (
    <section className={styles.modelInformation}>
      <label>{modelName.replace(/_\d*$/gi, '')}</label>
      <span>
        {`${model3Dsize.modelSize.widthX}*${model3Dsize.modelSize.widthY}*${model3Dsize.modelSize.height}mm`}
      </span>
    </section>
  );
};

export default ModelInformation;
