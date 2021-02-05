import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import OpenFile from './OpenFile';
import GenerateGcode from './GenerateGcode';
import ExportGcode from './ExportGcode';
import { useSelector } from 'react-redux'
import { IrootState } from '../../rootRedux'
import { ILaserState } from '../../containers/Laser/types'
import { ICncState } from '../../containers/CNC/types'
interface Iprops {
  beginGenerating: () => void;
  page: string
}
const FileHandleBox = (props: Iprops) => {
  const { page } = props
  const { t } = useTranslation();
  const { laserFileInfo } = useSelector<IrootState, ILaserState>((state) => state.laserReducers)
  const { cncFileInfo } = useSelector<IrootState, ICncState>((state) => state.CNCReducers)
  const meta = useMemo(() => {
    return page === 'cnc' ? cncFileInfo : laserFileInfo
  }, [page])

  return (
    <div>
      <div className={styles.uploadFile} >
        <div className={styles.fileInfo}>
          <div>{t('File')}: {meta.name}</div>
          <div>{t('File Size')}: {meta.size && `${(meta.size / 1024).toFixed(2)} KB`}</div>
        </div>
        <OpenFile page={page} />
        <GenerateGcode beginGenerating={props.beginGenerating} page={page} />
        <ExportGcode />
      </div>
    </div>
  );
}

export default FileHandleBox