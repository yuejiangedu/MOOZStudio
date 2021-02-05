import React from 'react';
import { Menu, Icon, } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';


interface Iprops {
  isShow: boolean,
  position: {
    left: number;
    top: number;
  },
  clickMenu: (key: string) => void,
  hideKey?: string[]
}

const ContextMenu = (props: Iprops) => {
  const { t } = useTranslation();
  const { isShow, position, hideKey } = props;
  const { left, top } = position;
  const hideArr = hideKey || [];
  const clickMenu = (val: { key: string }) => {
    props.clickMenu(val.key);
  }

  return (isShow ? (
    <Menu
      onClick={clickMenu} mode="vertical"
      className={styles.contextMenu}
      style={{ left, top, border: '1px solid #ccc' }}
    >
      {!hideArr.includes('0') ? <Menu.Item key="0" className={styles.menuItem}><Icon type="close" />{t('Delete')}</Menu.Item> : null}
      {!hideArr.includes('1') ? <Menu.Item key="1" className={styles.menuItem}><Icon type="column-width" />{t('Horizontal Flip')}</Menu.Item> : null}
      {!hideArr.includes('2') ? <Menu.Item key="2" className={styles.menuItem}><Icon type="column-height" />{t('Vertical Flip')}</Menu.Item> : null}
      {!hideArr.includes('3') ? <Menu.Item key="3" className={styles.menuItem}><Icon type="align-center" />{t('Align Center')}</Menu.Item> : null}
      {!hideArr.includes('4') ? <Menu.Item key="4" className={styles.menuItem}><Icon type="redo" />{t('Reset')}</Menu.Item> : null}
    </Menu>
  ) : null);
}

export default ContextMenu
