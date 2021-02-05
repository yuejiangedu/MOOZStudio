
import React, { useRef } from 'react';
import styles from './workflow-control.styl';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { buryevent } from '../../lib/ganalysis/ganalysis';
import { useDispatch } from 'react-redux'
import log from '../../lib/log';
import pick from 'lodash/pick';
import { setGcode } from '../../rootRedux/actions'

interface Iprops {
  uploadFile: (gcode: string, meta: { name: string, size: number }) => void;
}

const WorkflowControl = (props: Iprops) => {
  const fileInputEl: any = useRef<React.RefObject<HTMLInputElement>>()
  const { t } = useTranslation();
  const dispatch = useDispatch()

  const handleChangeFile = (event: any) => {
    const { uploadFile } = props;
    const files = event.target.files;
    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = (event: any) => {
      const { result, error } = event.target;

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
        name: file.name,
        size: file.size
      };
      dispatch(setGcode(result))
      uploadFile(result, meta);
      buryevent('btn_open_gcode_file', { 'event_category': 'workspace', 'event_label': 'saved' });
    };

    try {
      reader.readAsText(file);
    } catch (err) {
      // Ignore error
    }
  }

  const handleClickUpload = () => {
    if (fileInputEl) {
      fileInputEl.current.value = null;
      fileInputEl.current.click();
      buryevent('btn_open_gcode_file', { 'event_category': 'workspace', 'event_label': 'clicked' });
    }
  }

  return (
    <div className={styles.workflowControl}>
      <input
        ref={fileInputEl}
        type="file"
        accept=".gcode"
        style={{ display: 'none' }}
        multiple={false}
        onChange={handleChangeFile}
      />

      <div>
        <div className={styles.btnGroup}>
          <Button
            type="primary"
            className={styles.uploadBtn}
            title={t('Upload G-code')}
            onClick={handleClickUpload}
          >
            <span className={styles.spantext}>{t('Upload G-code')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowControl