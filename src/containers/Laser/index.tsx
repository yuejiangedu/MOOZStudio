import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import { useTranslation } from 'react-i18next';
import LaserOptionsBox from '../../components/LaserOptionsBox';
import FileHandleBox from '../../components/FileHandleBox';
import Text from '../../components/Text';
import { setLaserFileInfo, setBeautyType } from './actions';
import LaserVisualizer from '../../components/LaserVisualizer';
import ProgressComponent from '../Progress';
import LaserTestOption from '../../components/LaserTestOption';
import { SIDERWIDTH } from '../../constants';
import BeautyFilter from '../../components/BeautyFilter';
import VisualAids from '../../components/VisualAids';
import DefaultPicture from '../../components/DefaultPicture';
import VisualControl from '../../components/VisualControl';
import { burypageview } from '../../lib/ganalysis/ganalysis';
import DropDownContainer from '../../components/DropDownContainer'
import HelperTips from '../../components/HelperTips'
import { IrootState } from '../../rootRedux'
import { SVG_TITLE } from './constants'
import { ILaserState } from './types'
import { useLocation } from 'react-router'
const { Sider, Content } = Layout;

interface Iprops {
  style: { [index: string]: string }
}

const Laser = (props: Iprops) => {
  const [svgPath, setSVGPath] = useState<NodeRequire[]>([]);
  const [textArr, setTextArr] = useState<any[]>([])
  const { saveJSON } = useSelector<IrootState, ILaserState>(state => state.laserReducers);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const laserVisualizerRef: any = useRef(null);

  const beginGenerating = () => {
    laserVisualizerRef.current.setBeautyData();
  }

  const camera = {
    zoomFit: () => {
      laserVisualizerRef.current.zoomFit();
    },
    zoomOut: () => {
      laserVisualizerRef.current.zoomOut();

    },
    zoomIn: () => {
      laserVisualizerRef.current.zoomIn();
    },
  }

  //获取的图片
  const getDefaultPicturePath = () => {
    const svg = [];
    for (let index = 0; index < SVG_TITLE.length; index++) {
      svg.push(require(`../../images/defaultsvg/${index + 1}.js`).svg);

    }
    setSVGPath([...svg])
  }

  const importPic = (meta: {
    url: string,
    name: string,
    type: string,
    size: number
  }) => {
    dispatch(setLaserFileInfo(meta));
    dispatch(setBeautyType(meta.type));
  }

  const page = useMemo(() => {
    return location.pathname === '/laser' ? 'laser' : ''
  }, [location.pathname])

  useEffect(() => {
    getDefaultPicturePath();
  }, [])

  useEffect(() => {
    if (location.pathname === '/laser') {
      burypageview({ 'page_path': '/laser' });
    }
  }, [location.pathname])

  useEffect(() => {
    const jsonData = saveJSON.data[saveJSON.index] || '';
    const canvasObj = jsonData && JSON.parse(jsonData);
    const newTextArr: any[] = [];
    canvasObj.objects && canvasObj.objects.forEach((item: any) => {
      if (item.id && item.id.includes('text')) {
        newTextArr.push(item);
      }
    });
    setTextArr([...newTextArr])
  }, [saveJSON.data[saveJSON.index]])

  const siderComponents = [
    {
      name: 'Laser Test',
      component: <LaserTestOption />,
      suffix: null
    },
    {
      name: 'Picture Assisted Engraving',
      component: <VisualAids />
      ,
      suffix: <HelperTips title={t('Auxiliary Carving')} content={t('Auxiliary Infos')} />
    },
    {
      name: 'File',
      component: <FileHandleBox beginGenerating={beginGenerating} page={page} />,
      suffix: null
    },
    {
      name: 'Text',
      component: <Text text={textArr} />,
      suffix: null
    },
    {
      name: 'Select Image',
      component: <DefaultPicture
        importPic={importPic}
        svgTitle={SVG_TITLE}
        svgPath={svgPath}
        pngPath={[]}
        pngTitle={[]} />,
      suffix: null
    },
    {
      name: 'Filter',
      component: <BeautyFilter />,
      suffix: null
    },
    {
      name: 'Laser Option',
      component: <LaserOptionsBox />,
      suffix: null
    }
  ]

  return (
    <Layout className="mooz-content" style={props.style} >
      <Content className="mooz-content-box">
        <ProgressComponent />
        <header className="visualizer-tool">
          <VisualControl
            hideViewBtn={true}
            hideDropdownMenu={true}
            onClick={(key: string) => { key && camera[key]() }} />
        </header>
        <LaserVisualizer ref={laserVisualizerRef} />
      </Content>
      <Sider width={SIDERWIDTH} className="mooz-option-sider">
        <div>
          {siderComponents.map((item, index) => {
            return (
              <DropDownContainer
                title={t(item.name)}
                content={item.component}
                suffix={item.suffix}
                key={index}
              />
            )
          })}
        </div>
      </Sider>
    </Layout>
  )
}

export default Laser