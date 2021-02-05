import React, { useState, useEffect } from 'react';
import PrintingOptionList from './PrintingOptionList';
import { optionCategory, materialConfigs } from './constant';
import PrintingMaterialsSelect from './PrintingMaterialsSelect';
import PrintingConfigFileSelect from './PrintingConfigFileSelect';
import { getConfigFileData } from '../../lib/http/api';
import { useLocation } from 'react-router';
import OptionTips from './OptionTips';

interface Iprops {
  configFile: string;
  updateConfigFile: (name: string) => void;
  printMaterial: string;
  updateMaterial: (name: string) => void;
  printingVersion: string;
}
const PrintingOptionBox = (props: Iprops) => {
  const [configList, setConfigList] = useState(optionCategory);
  const [materialConfigList, setMaterialConfigList] = useState(materialConfigs);
  const [tipOptions, setTipOptions] = useState({} as { show: boolean, label: string, top: string, right: string });

  const changeTipOptions = (options: { show: boolean, label: string, top: string, right: string }) => {
    setTipOptions(options)
  }


  const location = useLocation()
  const modifyData = (target: any, data: any) => {
    target.forEach((item: any) => {
      item.value = data[item.key].default_value;
      item.child && item.child.length !== 0 && modifyData(item.child, data);
    });
  };

  const updateConfigData = (quality: any) => {
    optionCategory.forEach(item => {
      let temdata = item.data;
      item.data.forEach((lin: any) => {
        let temlinValue = lin.value;
        if (quality.overrides[item.category].children.adhesion_type) {
          temlinValue = quality.overrides[item.category].children.adhesion_type.default_value;
        }
        if (lin.extra && lin.extra[temlinValue]) {
          temdata = [...item.data, ...lin.extra[temlinValue]];
        }
      })
      modifyData(temdata, quality.overrides[item.category].children);
    });
    setConfigList(JSON.parse(JSON.stringify(optionCategory)));
  };

  const updateMaterialConfig = (material: any) => {
    modifyData(materialConfigs, material.overrides);
    setMaterialConfigList(JSON.parse(JSON.stringify(materialConfigs)));
  };

  const updateData = () => {
    getConfigFileData({ fileName: props.configFile, materialName: props.printMaterial }).then((result: any) => {
      updateConfigData(result.data.quality);
      updateMaterialConfig(result.data.material);
    });
  };

  const modifyItem = (item: any, key: string, value: string) => {
    const match = item.some((sun: any) => {
      if (sun.key === key) {
        sun.value = value
        return true
      } else if (sun.child && sun.child.length !== 0) {
        return modifyItem(sun.child, key, value);
      }
      return false
    });
    return match
  }

  const modifyInputData = (category: string, key: string, value: string) => {
    const match = configList.some((item) => {
      if (item.category === category) {
        let temdata = item.data;
        item.data.forEach((sun: any) => {
          if (sun.extra && sun.extra[sun.value]) {
            temdata = [...item.data, ...sun.extra[sun.value]];
          }
        })
        return modifyItem(temdata, key, value)
      }
      return false
    })
    match && setConfigList(JSON.parse(JSON.stringify(configList)))
  }

  const modifyMaterialInput = (key: string, value: string) => {
    const match = modifyItem(materialConfigList, key, value)
    match && setMaterialConfigList(JSON.parse(JSON.stringify(materialConfigList)))
  }

  const listener = () => {
    changeTipOptions({ show: false, label: '', top: '', right: '' });
  }

  useEffect(() => {
    window.addEventListener('mousewheel', listener)
    return () => {
      window.removeEventListener('mousewheel', listener)
    }
  }, [])

  useEffect(() => {
    updateData();
  }, [props.configFile, props.printMaterial, props.printingVersion]);

  useEffect(() => {
    location.pathname === '/printing' && updateData();
  }, [location.pathname]);

  return (
    <React.Fragment>
      <PrintingMaterialsSelect
        updateMaterial={props.updateMaterial} printMaterial={props.printMaterial} materialConfigs={materialConfigList} modifyMaterialInput={modifyMaterialInput}
        updateData={updateData}
        printingVersion={props.printingVersion}
        changeTipOptions={changeTipOptions}
      />
      <PrintingConfigFileSelect updateConfigFile={props.updateConfigFile} configFile={props.configFile} printingVersion={props.printingVersion} />
      <PrintingOptionList category={configList} updateData={updateData} modifyInputData={modifyInputData} changeTipOptions={changeTipOptions} />
      <OptionTips positionInfos={tipOptions} />
    </React.Fragment>
  );
};

export default PrintingOptionBox;
