import React, { useState, useEffect, useRef, useMemo } from 'react'
import FileHandleBox from '../../components/FileHandleBox';
import CncOptionBox from '../../components/CncOptionBox';
import ProgressComponent from '../Progress';
import Text from '../../components/Text';
import CNCVisualizer from '../../components/CNCVisualizer';
import DefaultPicture, { IexportMeta } from '../../components/DefaultPicture/index';
import { PNG_TITLE } from './constants'
import VisualControl from '../../components/VisualControl';
import classNames from 'classnames';
import DropDownContainer from '../../components/DropDownContainer'
import styles from './index.styl';
import { useDispatch, useSelector } from 'react-redux'
import { ICncState } from './types'
import { IrootState } from '../../rootRedux'
import { useTranslation } from 'react-i18next'
import { setCurPage, setGenerateGcodeType } from '../../rootRedux/actions'
import { burypageview } from '../../lib/ganalysis/ganalysis';
import { useLocation } from 'react-router'
import { setCNCFileInfo, setCameraPosition } from './actions'
interface Iprops {
  style: { [index: string]: string }
}

const CNC = (props: Iprops) => {
  const [pngPath, setPNGPath] = useState<string[]>([])
  const { cncText } = useSelector<IrootState, ICncState>(state => state.CNCReducers);
  const { t } = useTranslation()
  const cncVisualizerRef: any = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();
  //获取的图片
  const getDefaultPicturePath = () => {
    const png = [];
    for (let index = 0; index < PNG_TITLE.length; index++) {
      png.push(require(`../../images/defaultpng/${index + 1}.png`));

    }
    setPNGPath([...png])
  }

  const importPic = (meta: IexportMeta) => {
    dispatch(setGenerateGcodeType(meta.type === 'svg' ? 'cnc-svg' : 'cnc'))
    dispatch(setCNCFileInfo(meta));
  }

  const beginGenerating = () => {
    return cncVisualizerRef.current.getBeautyRgbaPixel();
  }

  const updateViewAspect = (view: string) => {
    switch (view) {
      case 'zoomOut':
      case 'zoomIn':
        cncVisualizerRef.current[view]();
        break;
      case 'top':
      case '3d':
      case 'front':
      case 'left':
      case 'right':
        dispatch(setCameraPosition([view]))
        break;
      default:
        break;
    }
  }

  const page = useMemo(() => {
    return location.pathname === '/cnc' ? 'cnc' : ''
  }, [location.pathname])

  useEffect(() => {
    getDefaultPicturePath();
  }, [])


  useEffect(() => {
    if (location.pathname === '/cnc') {
      dispatch(setCurPage('cnc'))
      burypageview({ 'page_path': '/cnc' });
    }
  }, [location.pathname])

  const siderComponents = [
    {
      name: 'File',
      component: <FileHandleBox
        beginGenerating={beginGenerating}
        page={page}
      />,
      suffix: null
    },
    {
      name: 'Text',
      component: <Text
        text={cncText}
      />,
      suffix: null
    },
    {
      name: 'Select Image',
      component: <DefaultPicture
        importPic={importPic}
        svgTitle={[]}
        svgPath={[]}
        pngPath={pngPath}
        pngTitle={PNG_TITLE}
      />,
      suffix: null
    },
    {
      name: 'CNC Options',
      component: <CncOptionBox />,
      suffix: null
    }
  ]

  return (
    <div style={props.style} className={classNames(styles.container, 'mooz-content')}>
      <section className={classNames(styles.main, 'mooz-content-box')}>
        <ProgressComponent />
        <header className="visualizer-tool">
          <VisualControl
            onClick={updateViewAspect} hideFitBtn={true} />
        </header>
        <CNCVisualizer
          ref={cncVisualizerRef}
          show={true}
        />
      </section>
      <aside className={classNames(styles.asider, 'mooz-option-sider')}>
        <div>
          {
            siderComponents.map((component, index) => {
              return (
                <DropDownContainer
                  title={t(component.name)}
                  content={component.component}
                  suffix={component.suffix}
                  key={index}
                />
              )
            })
          }
        </div>
      </aside>
    </div>
  );
}
export default CNC