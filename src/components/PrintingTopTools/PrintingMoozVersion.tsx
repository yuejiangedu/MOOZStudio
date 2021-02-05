import React, { useEffect } from 'react';
import { Select } from 'antd';
import { updateMoozVersion } from '../../lib/http/api';
import { buryevent } from '../../lib/ganalysis/ganalysis';
import { getVersionConfig, writeVersionConfig } from '../../lib/http/api'
const { Option } = Select;
interface Iprops {
  setPrintingVersion: (version: string) => void;
  printingVersion: string;
}
const PrintingMoozVersion = (props: Iprops) => {
  const handleChange = (value: string) => {
    writeVersionConfig({ name: 'print3DVersion', value })
    props.setPrintingVersion(value);
    buryevent('select_mooz_type', { 'event_category': '3dp', 'event_label': value });
  };

  useEffect(() => {
    updateMoozVersion({ version: props.printingVersion });
  }, [props.printingVersion]);

  useEffect(() => {
    getVersionConfig().then((data) => {
      const config = data.data
      if (config.print3DVersion) {
        props.setPrintingVersion(config.print3DVersion);
      }
    })
  }, [])

  return (
    <Select
      defaultValue="MOOZ-2 PLUS" style={{ width: 120 }} onChange={handleChange}
      value={props.printingVersion}
    >
      <Option value="MOOZ-1-2">MOOZ-1/2</Option>
      <Option value="MOOZ-2 PLUS">MOOZ-2 PLUS</Option>
      <Option value="MOOZ-3">MOOZ-3</Option>
    </Select>
  );
};
export default PrintingMoozVersion;
