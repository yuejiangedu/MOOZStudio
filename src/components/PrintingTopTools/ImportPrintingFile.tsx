import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import * as rootActions from '../../rootRedux/actions';
import * as http from '../../lib/http/api';
import { buryevent } from '../../lib/ganalysis/ganalysis';

const pubsub = require('pubsub-js');

interface Iprops {
  loadModel: (fileInfo: { name: string; size: number; type: string; path: string }) => void;
  history: any;
  setGcode: (gcode: string) => void;
}
const ImportPrintingFile = (props: Iprops) => {
  const inputRef: any = useRef(null);
  const { t } = useTranslation();
  const getFileType = (fileName: string) => {
    const fileArr = fileName.split('.');
    return fileArr[fileArr.length - 1];
  };
  const uploadModelFile = async (file: any, uploadName: string, fileType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadName', uploadName);
    http.uploadModel(formData, {
      onUploadProgress: function (e) {
        const percentage = Math.round((e.loaded * 100) / e.total) || 0;
        console.log('percentage', e, percentage);
      }
    }).then((e) => {
      const data = e.data;
      props.loadModel({
        name: data.uploadName.substring(0, data.uploadName.lastIndexOf('_')),
        size: file.size,
        type: fileType,
        path: data.uploadPath
      });
    });
  };

  const uploadGcode = (file: any) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = (event) => {
      const result = event.target && event.target.result;
      props.setGcode(result as string);
      const meta = {
        name: file.name,
        size: file.size
      };
      pubsub.publish('gcode:update', result, meta);
    };
  };

  const onclick = () => {
    inputRef.current.click();
    buryevent('btn_open_stl_file', { 'event_category': '3dp', 'event_label': 'clicked' });
  };
  const onchange = async (event: any) => {
    const file = event.target.files[0];
    const uploadName = file.name;
    const fileType = getFileType(uploadName);


    if (fileType === 'gcode') {
      uploadGcode(file);
    } else {
      uploadModelFile(file, uploadName, fileType);
      buryevent('btn_open_stl_file', { 'event_category': '3dp', 'event_label': 'saved' });
    }
    inputRef.current.value = '';
  };


  return (
    <section className={styles.importFile}>
      <input
        type="file" ref={inputRef} style={{ display: 'none' }}
        accept=".stl,.obj,.gcode"
        onChange={onchange}
      />
      <Button
        type="primary" onClick={() => {
          onclick();
        }}
      >{t('Open File')}
      </Button>
    </section>
  );
};
const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    setGcode: rootActions.setGcode,
  }, dispatch);
};

export default connect(null, mapDispatchToProps)(ImportPrintingFile);
