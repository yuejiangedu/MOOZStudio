import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VirtualList from 'react-tiny-virtual-list';
import styles from './dashboard.styl';
import cx from 'classnames';
import escape from 'lodash/escape';
import throttle from 'lodash/throttle';
import get from 'lodash/get';
import {
  CONTAINER_MARGIN,
  NAVBAR_HEIGHT,
  WORKSPACE_HEADERTOOL_HEIGHT,
} from '../../constants';

interface Istate {
  cameraMode: string;
  cameraPosition: string[];
  disabled: boolean;
  gcode: { [index: string]: string | boolean }
  objects: { [index: string]: { [index: string]: boolean } };
  projection: string;
  viewZoom: number;
  virtualList: { [index: string]: number }
}
interface Iprops {
  show: boolean;
  state: Istate;
}

const Dashboard = (props: Iprops) => {
  const [virtualList, setVirtualList] = useState({ visibleHeight: 0 });
  const [visibleHeight, setVisibleHeight] = useState(0);
  const node = useRef<HTMLDivElement>(null);

  const [lines, setLines] = useState([])

  let styleShow = { display: props.show ? 'block' : 'none', height: visibleHeight };

  const rowHeight = 20;

  const { t } = useTranslation();


  const renderItem = ({ index, style }: { index: number, style: any }) => (
    <div key={index} style={style}>
      <div className={styles.line}>
        <span className={cx(styles.label, styles.labelDefault)}>
          {index + 1}
        </span>
        {escape(lines[index])}
      </div>
    </div>
  );

  const getVisibleHeight = () => {
    const clientHeight = document.documentElement.clientHeight;
    const visibleHeight = clientHeight - NAVBAR_HEIGHT - WORKSPACE_HEADERTOOL_HEIGHT - 2 * CONTAINER_MARGIN;
    return { visibleHeight: visibleHeight, gcodeHeight: visibleHeight - 35 };
  }

  const resizeVirtualList = throttle(() => {
    if (!node.current) {
      return;
    }
    let height = getVisibleHeight();
    setVisibleHeight(height.visibleHeight)
    if (height.gcodeHeight > 0) {
      setVirtualList({ visibleHeight: height.gcodeHeight })
    }

  }, 32); // 60hz


  useEffect(() => {
    resizeVirtualList();
    setLines(get(props, 'state.gcode.content', '')
      .split('\n')
      .filter((line: string) => line.trim().length > 0));
    window.addEventListener('resize', resizeVirtualList);
    return () => {
      window.removeEventListener('resize', resizeVirtualList)
    }
  }, [])

  useEffect(() => {
    setLines(get(props, 'state.gcode.content', '')
      .split('\n')
      .filter((line: string) => line.trim().length > 0));
  }, [props.state.gcode.content])

  useEffect(() => {
    resizeVirtualList();
  }, [props.show])

  return (
    <div className={cx(styles.dashboard)}
      style={styleShow} >
      <header style={{ height: 30, marginLeft: '10px', lineHeight: '30px' }}> {t('G-code')}</header>
      <div style={{ height: 'calc(100% - 30px)' }}>
        <div ref={node}
          className={cx(
            styles.gcodeViewer
          )}
        >
          {lines.length > 0 && (
            <VirtualList
              width="100%"
              height={virtualList.visibleHeight}
              style={{
                padding: '5px '
              }}
              itemCount={lines.length}
              itemSize={rowHeight}
              renderItem={renderItem}
            />)}

          {lines.length === 0 && (
            <div className={styles.absoluteCenter} >
              <p>{t('Drag a Gcode file')}</p>
            </div>)}
        </div>
      </div>
    </div>
  )
}
export default Dashboard;