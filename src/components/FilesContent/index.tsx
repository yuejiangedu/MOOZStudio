import React from 'react';
import styles from './index.styl';
import FilesContentHeader from './FilesContentHeader';
import FilesContainer from './FilesContainer';
import { useTranslation } from 'react-i18next';
interface Iprops {
  fileInfos: any,
  pathname: string,
  sendHttp: (filepath: string | null, iscount: boolean) => void;
  handleBack: () => void;
  handleForward: () => void;
  pathJump: (datakey: string | null) => void;
  changeBackCount: () => void;
  backCount: number;
  forwardCount: number;
  changeDeleteStatus: (status: boolean) => void;
  saveDeleteFilePath: (pathInfo: any[]) => void;
  successFlag: boolean;
  refresh: () => void;
  clickDeleteFiles: () => void;
  showNewFoder: boolean;
  changeShowNewFoder: (flag: boolean) => void;
  searchFileInfos: (data: any) => void;
  newFoderName: number;
  deletingTip: string;
  showRemove: boolean;
  changeShowRemove: (flag: boolean) => void;
  openNewBrowser: () => void;
  changeNewFoderName: () => void;
}
const FilesContent = (props: Iprops) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <FilesContentHeader
        fileInfos={props.fileInfos}
        handleBack={props.handleBack}
        handleForward={props.handleForward}
        pathJump={props.pathJump}
        changeBackCount={props.changeBackCount}
        backCount={props.backCount}
        forwardCount={props.forwardCount}
        searchFileInfos={props.searchFileInfos}
        refresh={props.refresh}
      />
      <FilesContainer
        fileInfos={props.fileInfos}
        pathname={props.pathname}
        sendHttp={props.sendHttp}
        changeBackCount={props.changeBackCount}
        changeDeleteStatus={props.changeDeleteStatus}
        saveDeleteFilePath={props.saveDeleteFilePath}
        successFlag={props.successFlag}
        refresh={props.refresh}
        clickDeleteFiles={props.clickDeleteFiles}
        showNewFoder={props.showNewFoder}
        changeShowNewFoder={props.changeShowNewFoder}
        newFoderName={props.newFoderName}
        deletingTip={props.deletingTip}
        showRemove={props.showRemove}
        changeShowRemove={props.changeShowRemove}
        openNewBrowser={props.openNewBrowser}
        changeNewFoderName={props.changeNewFoderName}
      />
      <div className={styles.footer} >
        {t('FileNumbertip', { count: props.fileInfos.filesLegth })}
      </div>
    </div>
  )
}
export default FilesContent;