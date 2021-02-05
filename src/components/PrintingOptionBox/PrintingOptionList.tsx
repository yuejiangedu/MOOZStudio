import React from 'react';
import OptionTemp from './OptionTemp';
import styles from './index.styl';

interface Iprops {
  category: any;
  updateData: () => void;
  modifyInputData: (category: string, key: string, value: string) => void;
  changeTipOptions: (options: { show: boolean, label: string, top: string, right: string }) => void;
}
const PrintingOptionList = (props: Iprops) => {
  const optionCategory = props.category.map((item: any) => {
    return (
      <div key={item.title}>
        <OptionTemp
          title={item.title} list={item.data}
          category={item.category}
          updateData={props.updateData}
          modifyInputData={props.modifyInputData}
          changeTipOptions={props.changeTipOptions}
        />
      </div>
    );
  });

  return (
    <div className={styles.printingOptionList}>
      {optionCategory}
    </div>
  );
};

export default PrintingOptionList;
