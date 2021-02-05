import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Icon, Button } from 'antd';
import styles from './index.styl';
import { useTranslation } from 'react-i18next';

interface Iprops {
  onClick: (key: string) => void;
  cameraMode: string
}
const Dropdownmenu = (props: Iprops) => {
  const { t } = useTranslation();
  let initMode = props.cameraMode === 'rotate' ? 'toRotateMode' : 'toPanMode';
  const [mode, setMode] = useState(initMode);
  const iconPath: { [index: string]: string } = {
    'toRotateMode': require('../Visualizer/images/rotate-camera.svg'),
    'toPanMode': require('../Visualizer/images/move-camera.svg')
  }

  const onclick = ({ key }: { key: string }) => {
    setMode(key)
    props.onClick(key)
  }

  useEffect(() => {
    props.cameraMode === 'rotate' ? setMode('toRotateMode') : setMode('toPanMode');
  }, [props.cameraMode])

  const menu = (
    <Menu onClick={onclick}>
      <Menu.Item key="toPanMode" data-key="toPanMode">
        <img src={iconPath['toPanMode']} alt="#"
          data-key="toPanMode"
          style={{ width: '20px', height: '20px', marginRight: '8px' }} />
        {t('Move the camera')}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="toRotateMode" data-key="toRotateMode">
        <img src={iconPath['toRotateMode']} alt="#"
          data-key="toRotateMode"
          style={{ width: '20px', height: '20px', marginRight: '8px' }} />
        {t('Rotate the camera')}
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={['click']} className={styles.dropdown} >
      <Button className={styles.btntag} data-key="camerOption">
        <img src={iconPath[mode]} alt="" data-key="camerOption" />
        <Icon type="down" />
      </Button>
    </Dropdown>
  )
}
export default Dropdownmenu;