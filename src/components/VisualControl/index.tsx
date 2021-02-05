import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import { Button, Tooltip } from 'antd';

interface Iprops {
  hideViewBtn?: boolean;
  hideFitBtn?: boolean;
  hideDropdownMenu?: boolean;
  onClick: (key: string) => void;
}

const VisualControl = (props: Iprops) => {
  const { t } = useTranslation();

  const handleOnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const datakey = (e.target as HTMLDivElement)!.getAttribute('data-key');
    props.onClick(datakey as string);
  }

  const { hideViewBtn, hideFitBtn } = props;

  return (
    <div className={styles.container} onClick={handleOnClick}>
      <span style={{ display: hideViewBtn ? 'none' : 'inline-block' }}>
        <Button data-key="top">
          <Tooltip
            placement="top"
            title={t('Top View')}
          >
            <img src={require('../../images/camera-top-view.png')} alt="" data-key="top" />
          </Tooltip>
        </Button>
        <Button data-key="front">
          <Tooltip
            placement="top"
            title={t('Front View')}
          >
            <img src={require('../../images/camera-front-view.png')} alt="" data-key="front" />
          </Tooltip>
        </Button>
        <Button data-key="right">
          <Tooltip
            placement="top"
            title={t('Right Side View')}
          >
            <img src={require('../../images/camera-right-side-view.png')} alt="" data-key="right" />
          </Tooltip>
        </Button>
        <Button data-key="left">
          <Tooltip
            placement="top"
            title={t('Left Side View')}
          >
            <img src={require('../../images/camera-left-side-view.png')} alt="" data-key="left" />
          </Tooltip>
        </Button>
        <Button data-key="3d">
          <Tooltip
            placement="top"
            title={t('3D View')}
          >
            <img src={require('../../images/camera-3d-view.svg')} alt="" data-key="3d" />
          </Tooltip>
        </Button>
      </span>

      <span style={{ display: hideFitBtn ? 'none' : 'inline-block' }}>
        <Button data-key="zoomFit">
          <Tooltip
            placement="top"
            title={t('Zoom to Fit')}
          >
            <img src={require('../../images/zoom-fit.svg')} alt="" data-key="zoomFit" />
          </Tooltip>
        </Button>
      </span>
      <Button data-key="zoomIn" >
        <Tooltip
          placement="top"
          title={t('Zoom In')}
        >
          <img src={require('../../images/zoom-in.svg')} alt="" data-key="zoomIn" />
        </Tooltip>
      </Button>
      <Button data-key="zoomOut"  >
        <Tooltip
          placement="top"
          title={t('Zoom Out')}
        >
          <img src={require('../../images/zoom-out.svg')} alt="" data-key="zoomOut" />
        </Tooltip>
      </Button>
    </div>
  )
}

export default VisualControl;