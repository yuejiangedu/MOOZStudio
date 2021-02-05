import React, { useRef } from 'react';
import pick from 'lodash/pick';
import { Button } from 'antd';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'react-i18next';
import log from '../../lib/log';
import { buryevent } from '../../lib/ganalysis/ganalysis';
import { useDispatch } from 'react-redux'
import { setLaserFileInfo, setBeautyType } from '../../containers/Laser/actions'
import { setCNCFileInfo } from '../../containers/CNC/actions'
import { setGenerateGcodeType } from '../../rootRedux/actions'

interface Iprops {
  page: string;
}
const OpenFile = (props: Iprops) => {
  const fileInputEl: any = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const openFileChange = (event: any) => {
    const files = event.target.files;
    const file = files[0];
    if ((file.size / 1024) > 200) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      imageCompression(file, options)
        .then((compressedFile: any) => {
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
    const { page } = props;
    const fileName = file.name.toLowerCase().split('.');
    const fileType = fileName[fileName.length - 1];
    const reader = new FileReader();
    fileType === 'svg' ? reader.readAsText(file) : reader.readAsDataURL(file);
    reader.onload = (event) => {
      const { result, error } = event.target as FileReader;
      if (error) {
        log.error(error);
        return;
      }

      log.debug('FileReader:', pick(file, [
        'lastModified',
        'lastModifiedDate',
        'meta',
        'name',
        'size',
        'type'
      ]));
      const meta = {
        url: result as string | undefined,
        name: file.name,
        size: file.size,
        type: fileType,
        originUrl: result as string | undefined
      };
      if (page === 'cnc') {
        dispatch(setCNCFileInfo(meta));
        dispatch(setGenerateGcodeType(meta.type === 'svg' ? 'cnc-svg' : 'cnc'));
        buryevent('btn_open_file', { 'event_category': 'cnc', 'event_label': 'saved' });
      } else {
        const gcodeType = meta.type === 'svg' ? 'laser-svg' : 'gray';
        dispatch(setBeautyType(gcodeType));
        dispatch(setLaserFileInfo(meta));
        buryevent('btn_open_file', { 'event_category': 'laser', 'event_label': 'saved' });
      }
      fileInputEl.current.value = '';
    };
  }
  const clickInput = () => {
    fileInputEl.current.click();
    buryevent('btn_open_file', { 'event_category': props.page, 'event_label': 'clicked' });
  };
  return (
    <React.Fragment>
      <input
        ref={fileInputEl}
        type="file"
        accept=".svg, .png, .jpg, .jpeg, .bmp"
        style={{ display: 'none' }}
        multiple={false}
        onChange={openFileChange}
      />
      <Button
        type="primary" title={t('Open File')}
        onClick={clickInput}
      >{t('Open File')}
      </Button>
    </React.Fragment>
  );
}
export default OpenFile;
