import React from 'react';
import classNames from 'classnames';
import PrintingMoozVersion from './PrintingMoozVersion';
import ImportPrintingFile from './ImportPrintingFile';
import styles from './index.styl';
import VisualControl from '../../components/VisualControl'
interface Iprops {
  setPrintingVersion: (version: string) => void;
  printingVersion: string;
  loadModel: (fileInfo: { name: string; size: number; type: string; path: string }) => void;
  history: any;
  show: boolean;
  operate: (key: string) => void;
}
const PrintingTopTools = (props: Iprops) => {
  const { setPrintingVersion, printingVersion, history, show, operate } = props;
  return (
    <section className={classNames(styles.printTopTools)}>
      <VisualControl hideViewBtn={false} hideFitBtn={true} hideDropdownMenu={true} onClick={operate} />
      <div className={classNames(styles.printTopToolsRight, show ? styles.isshow : styles.hidden)}>
        <PrintingMoozVersion setPrintingVersion={setPrintingVersion} printingVersion={printingVersion} />
        <ImportPrintingFile loadModel={props.loadModel} history={history} />
      </div>
    </section>
  );
};
export default PrintingTopTools;
