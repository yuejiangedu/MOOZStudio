import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './index.styl';
import FilesHeader from '../../components/FilesHeader';
import FilesContent from '../../components/FilesContent';
import BrowserWindowLoading from '../../components/BrowserWindowLoading'
import { readStl } from '../../lib/http/api';
import FileDeleteModal from '../../components/FileDeleteModal';
import { openBrowser } from '../../lib/http/api';
import debounce from 'lodash/debounce';
import { IrootState } from '../../rootRedux/index';
import { useSelector, useDispatch } from 'react-redux';
import { IinitState } from '../../lib/jsonrpc/websocketReducer';
import { IFilesState } from './types';
import { setHasFileInfos } from './actions';
import { useTranslation } from 'react-i18next';

interface Iprops {
  location: any;
}
const Files = (props: Iprops) => {
  const [fileInfos, setFileInfos] = useState({} as { listfiles: { [index: string]: string }[], listdir: { [index: string]: string }[], lastfilepath: string, filesLegth: number });
  const [backForwardFileInfos, setBackForwardFileInfos] = useState([] as any[]);
  const [forwardCount, setForwardCount] = useState(0);
  const [backCount, setBackCount] = useState(0);
  const [deleteStatus, setDeleteStatus] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteFilePath, setDeleteFilePath] = useState([] as { [index: string]: string }[]);
  const [showFileComponent, setShowFileComponent] = useState(false);
  const [successFlag, setSuccessFlag] = useState(true);
  const [showNewFoder, setShowNewFoder] = useState(false);
  const [newFoderName, setNewFoderName] = useState(0);
  const [deletingTip, setDeletingTip] = useState('');
  const [showRemove, setShowRemove] = useState(false);
  const [record, setRecord] = useState(true);
  const [loadingShow, setLoadingShow] = useState(false);
  const { hasFileInfos } = useSelector<IrootState, IFilesState>(state => state.filesReducers);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { readStlFiles } = useSelector<IrootState, Partial<IinitState>>(state => {
    return {
      readStlFiles: state.websocketReducer.readStlFiles,
    }
  });

  const changeNewFoderName = () => {
    if (fileInfos.listdir) {
      const currentNewFolder = fileInfos.listdir.filter((item: any) => {
        const str = new RegExp('^' + t('New folder') + '$|^' + t('New folder') + '\\s{1}\\([1-9]{1}[0-9]{0,}\\)');
        return str.test(item.thefilename);
      })
      if (currentNewFolder.length === 0) {
        setNewFoderName(0);
      } else {
        let currentSuffixNum = [] as number[];
        currentNewFolder.forEach((item) => {
          if (item.thefilename.lastIndexOf('(') === -1) {
            currentSuffixNum.push(0)
          } else {
            currentSuffixNum.push(parseInt(item.thefilename.substring(item.thefilename.lastIndexOf('(') + 1, item.thefilename.length - 1)))
          }
        })
        let checkSuffixNum = [] as number[];
        for (var i = 0; i < Math.max(...currentSuffixNum) + 1; i++) {
          checkSuffixNum.push(i);
        }
        let foldersNum = checkSuffixNum.filter((item) => {
          return currentSuffixNum.indexOf(item) === -1;
        })
        foldersNum.length === 0 ? setNewFoderName(Math.max(...currentSuffixNum) + 1) : setNewFoderName(Math.min(...foldersNum));
      }
    }
  }

  const refresh = () => {
    fileInfos && sendHttp(fileInfos.lastfilepath, false);
  }

  const changesuccessFlag = (flag: boolean) => {
    setSuccessFlag(flag);
  }

  const changeDeleteStatus = (status: boolean) => {
    setDeleteStatus(status);
  }

  const clickDeleteFiles = () => {
    setShowModal(true);
  }

  const switchShowModal = (status: boolean) => {
    setShowModal(status);
  }

  const sendHttp = (filepath: string | null, iscount: boolean) => {
    if (!filepath) {
      return
    }
    readStl({ filepath: filepath }).then(() => {
      if (iscount) {
        (forwardCount < 10) && setForwardCount(forwardCount + 1);
      }
    })
  }
  const listenFileInfos = (data: any) => {
    if (backForwardFileInfos[0] === data) {
      return;
    }
    if (backForwardFileInfos.length > 9) {
      backForwardFileInfos.pop();
    }
    backForwardFileInfos.unshift(data);
    setBackForwardFileInfos([...backForwardFileInfos]);
  }
  const changeBackCount = () => {
    setBackCount(0);
  }
  const handleBack = () => {
    if (forwardCount === 0) {
      return
    }
    if (backCount < forwardCount && forwardCount <= 10) {
      setRecord(false);
      sendHttp(backForwardFileInfos[backCount + 1], false);
      setBackCount(backCount + 1);
    }
  }

  const handleForward = () => {
    if (backCount > 0) {
      setRecord(false);
      sendHttp(backForwardFileInfos[backCount - 1], false);
      setBackCount(backCount - 1);
    }
  }

  const pathJump = (path: string | null) => {
    if (path !== readStlFiles.lastfilepath) {
      sendHttp(path, true);
    }
  }

  const saveDeleteFilePath = (pathInfo: any[]) => {
    if (pathInfo) {
      setDeleteFilePath(pathInfo);
      if (pathInfo.length !== 0 && successFlag) {
        if (pathInfo.length === 1) {
          const sliceIndex = pathInfo[0].pathName.lastIndexOf('/');
          const tipInfo = pathInfo[0].pathName.substr(sliceIndex + 1);
          setDeletingTip(tipInfo);
        } else {
          const tipInfo = `${pathInfo.length}个文件或文件夹`;
          setDeletingTip(tipInfo);
        }
      }
    }
  }

  const changeShowNewFoder = (flag: boolean) => {
    setShowNewFoder(flag);
  }

  const changeShowRemove = (flag: boolean) => {
    setShowRemove(flag);
  }

  const searchFileInfos = (data: any) => {
    setFileInfos(data);
  }

  const openNewBrowser = debounce(() => {
    setLoadingShow(true)
    openBrowser({
      url: 'https://www.thingiverse.com/',
      title: 'thingiverse'
    }).then((res: any) => {
      if (res.data === 'show success') {
        setLoadingShow(false)
      }
    })
  }, 2000, {
    'leading': true,
    'trailing': false
  })

  useEffect(() => {
    props.location.pathname !== "/files" ? setShowFileComponent(false) : setShowFileComponent(true);
    if (hasFileInfos) {
      return
    } else {
      if (props.location.pathname === "/files") {
        readStl({ filepath: '' })
        dispatch(setHasFileInfos(true));
      }
    }
  }, [props.location.pathname])

  useEffect(() => {
    setFileInfos(readStlFiles);
  }, [readStlFiles])

  useEffect(() => {
    if (record) {
      listenFileInfos(readStlFiles.lastfilepath);
    } else {
      setRecord(true);
    }
  }, [readStlFiles.lastfilepath])

  return (
    <div style={{ display: (showFileComponent) ? 'flex' : 'none', height: '100%' }}>
      <div className={classNames(styles.container)}>
        <FilesHeader
          deleteStatus={deleteStatus}
          clickDeleteFiles={clickDeleteFiles}
          changeShowNewFoder={changeShowNewFoder}
          changeNewFoderName={changeNewFoderName}
          openNewBrowser={openNewBrowser}
          changeShowRemove={changeShowRemove}
        />
        <FilesContent
          fileInfos={fileInfos}
          pathname={props.location.pathname}
          sendHttp={sendHttp}
          handleBack={handleBack}
          handleForward={handleForward}
          pathJump={pathJump}
          changeBackCount={changeBackCount}
          backCount={backCount}
          forwardCount={forwardCount}
          changeDeleteStatus={changeDeleteStatus}
          saveDeleteFilePath={saveDeleteFilePath}
          successFlag={successFlag}
          refresh={refresh}
          clickDeleteFiles={clickDeleteFiles}
          showNewFoder={showNewFoder}
          changeShowNewFoder={changeShowNewFoder}
          searchFileInfos={searchFileInfos}
          newFoderName={newFoderName}
          deletingTip={deletingTip}
          showRemove={showRemove}
          changeShowRemove={changeShowRemove}
          openNewBrowser={openNewBrowser}
          changeNewFoderName={changeNewFoderName}
        />
        <FileDeleteModal
          showModal={showModal}
          switchShowModal={switchShowModal}
          changesuccessFlag={changesuccessFlag}
          refresh={refresh}
          deleteFilePath={deleteFilePath}
          changeDeleteStatus={changeDeleteStatus}
        />
      </div>
      {(showRemove || showModal) &&
        <div className={classNames(styles.modal)}></div>
      }
      {loadingShow && <BrowserWindowLoading />}
    </div>

  )
}
export default Files;