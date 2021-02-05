import React from 'react';
import ModelInformation from './ModelInformation';
import GcodeInformation from './GcodeInformation';
import styles from './index.styl';
import { IprintingState } from '../../containers/Printing/types';

interface Iprops extends Pick<IprintingState, 'model3Dsize'> {
  modelName: string;
  gcodeSize: any;
}
const PrintingInformationBar = (props: Iprops) => {
  const { gcodeSize, model3Dsize } = props;
  return (
    <section className={styles.printingInformationBar}>
      <ModelInformation model3Dsize={model3Dsize} modelName={props.modelName} />
      <GcodeInformation time={gcodeSize.printTime} weight={gcodeSize.filamentWeight} perLength={gcodeSize.filamentLength} />
    </section>
  );
};

export default PrintingInformationBar;
