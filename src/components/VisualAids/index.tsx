import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import classNames from 'classnames';
import BeautyView from './BeautyView';
import ScreenShotHandle from './ScreenShotHandle';
import styles from './index.styl';
import log from '../../lib/log';
import { buryevent } from '../../lib/ganalysis/ganalysis';
import { useSelector, useDispatch } from 'react-redux'
import { IrootState } from '../../rootRedux'
import { initState } from '../../containers/Settings/reducers';
import { upDateVisualAidsBg } from '../../containers/Laser/actions'

const VisualAids = () => {
  const { t } = useTranslation()
  const { moozVersion } = useSelector<IrootState, typeof initState>((state) => state.settingReducers);
  const [hideTips, setHideTips] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(false)
  const [tips, setTips] = useState(false)
  const [beautyUrl, setBeautyUrl] = useState<string>('')
  const view: any = useRef(null)
  const inputFile: any = useRef(null)
  const dispatch = useDispatch();
  const changeShow = (event: any) => {
    setHidden(event.target.checked)
  }

  const setVisualAidsBg = (url: string) => {
    dispatch(upDateVisualAidsBg(url));
  }

  const toggleModal = (bool: boolean) => {
    setVisible(bool)
    setTips(false)
  };

  const toggleTips = (bool: boolean) => {
    buryevent(bool ? 'btn_assist_open_image' : 'btn_assist_cancel', { 'event_category': 'laser' })
    if (hidden) {
      uploadFile();
    } else {
      setTips(bool)
    }
  };

  const uploadFile = () => {
    if (inputFile && inputFile.current)
      inputFile.current.click();
  }

  const clearPicture = () => {
    dispatch(upDateVisualAidsBg(''));
    buryevent('btn_assist_clear_image', { 'event_category': 'laser' });
  }

  const changeFile = (event: any) => {
    const files = event.target.files;
    const file = files[0];
    if ((file.size / 1024) > 200) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      imageCompression(file, options)
        .then((compressedFile) => {
          console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
          console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
          loadingFile(compressedFile);
        })
        .catch((error) => {
          console.log(error.message);
        });
    } else {
      loadingFile(file);
    }
  }

  const loadingFile = (file: any) => {
    const fileName = file.name.toLowerCase().split('.');
    const fileType = fileName[fileName.length - 1];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const { result, error } = event.target as FileReader;
      if (error) {
        log.error(error);
        return;
      }
      const meta = {
        url: result,
        name: file.name,
        size: file.size,
        type: fileType
      };
      setTips(false)
      setVisible(true)
      setBeautyUrl(String(meta.url))
      inputFile.current.value = '';
    };
  }

  const reset = () => {
    view && view.current && view.current.reset();
  }

  const extractFile = () => {
    view.current.extractFile();
    buryevent('btn_assist_done', { 'event_category': 'laser' });
    setHideTips(true)
    setVisible(false)
  }

  useEffect(() => {
    beautyUrl && reset()
  }, [beautyUrl])

  return (

    <div className={styles.visualAids}>
      <input
        type="file" style={{ display: 'none' }} ref={inputFile}
        multiple={false}
        onChange={changeFile}
        accept=".svg, .png, .jpg, .jpeg, .bmp"
      />
      <Button
        type="primary" onClick={() => {
          toggleTips(true);
        }} style={{ width: '130px' }}
      >
        {t('Upload Picture')}
      </Button>
      <Button
        type="primary" onClick={() => {
          clearPicture();
        }} style={{ width: '130px', marginLeft: '20px' }}
      >
        {t('Clear Picture')}
      </Button>
      <Modal
        title={t('Picture Assisted Engraving')}
        visible={visible}
        maskClosable={false}
        footer={null}
        forceRender={true}
        onCancel={() => {
          toggleModal(false);
        }}
      >
        <BeautyView
          ref={view} moozVersion={moozVersion} upDateVisualAidsBg={setVisualAidsBg}
          beautyUrl={beautyUrl}
        />
        <ScreenShotHandle t={t} extractFile={extractFile} reset={reset} />
        <span className={classNames(styles.viewTips, { [styles.hideViewTips]: hideTips })}>
          {t('Move the four circle dots to the four corners of the heat bed accordingly to finish the coordinate matching procedure')}
        </span>
      </Modal>
      <Modal
        title={t('Note')}
        visible={tips}
        maskClosable={false}
        footer={null}
        onCancel={() => {
          toggleTips(false);
        }}
        bodyStyle={{ padding: '0px' }}
      >
        <p style={{ padding: '24px 24px 0 24px', display: 'block' }}>
          {t('For accurate positioning, before using this function, please ensure that the origin of laser engraving has been set to the top left corner of the heatbed')}
        </p>
        <div className={styles.tipsContainer}>
          <object data={require('../../images/bgc.svg')} type="image/svg+xml">
            bgc
              </object>
          <div>
            <Checkbox onChange={(event: any) => {
              changeShow(event);
            }}
            >{t('Don\'t show again')}
            </Checkbox>
            <Button
              type="primary" onClick={() => {
                uploadFile();
              }}
            >
              {t('OK')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>

  );
}

export default VisualAids;
