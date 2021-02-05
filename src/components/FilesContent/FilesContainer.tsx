import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './index.styl';
import { Modal, Tooltip } from 'antd';
import FilesContextMenu from '../../components/FilesContextMenu';
import FilesRemove from '../../components/FilesRemove';
import { renameFile, newFoder, readFileData, unzipDir, readAllFilesOrDirs } from '../../lib/http/api';
import { useDispatch } from 'react-redux'
import { updatePrintingFile } from '../../containers/Printing/actions'
import { useHistory } from 'react-router'
import { useSelector } from 'react-redux';
import { IrootState } from '../../rootRedux/index';
import { useTranslation } from 'react-i18next';

interface Iprops {
  fileInfos: any,
  pathname: string,//路由
  sendHttp: (filepath: string | null, iscount: boolean) => void;
  changeBackCount: () => void;
  changeDeleteStatus: (status: boolean) => void;
  saveDeleteFilePath: (pathInfo: any[]) => void;
  successFlag: boolean;
  refresh: () => void;
  clickDeleteFiles: () => void;
  showNewFoder: boolean;
  changeShowNewFoder: (flag: boolean) => void;
  newFoderName: number;
  deletingTip: string;
  showRemove: boolean;
  changeShowRemove: (flag: boolean) => void;
  openNewBrowser: () => void;
  changeNewFoderName: () => void;
}
const FilesContainer = (props: Iprops) => {
  const [activeIndex, setActiveIndex] = useState([] as string[]);
  const [ctrlDown, setCtrlDown] = useState(false);
  const [pathArray, setPathArray] = useState([] as any[]);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({} as { [index: string]: number });
  const [contextMenuItem, setContextMenuItem] = useState([] as { [index: string]: any }[]);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [checkRename, setCheckRename] = useState(false);
  const [allDirInfos, setAllDirInfos] = useState([] as any[]);
  const [unzipLoading, setUnzipLoading] = useState(false);
  const [unzipingFilename, setUnzipingFilename] = useState('');
  const dispatch = useDispatch();
  const history = useHistory()
  const downloadNewFile = useSelector<IrootState, { fileName: string, progress: number, savePath: string } | null>(state => state.websocketReducer.downloadNewFile);

  const { t } = useTranslation();

  const changeSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    setShowContextMenu(false);
    props.changeShowNewFoder(false);
    const key = (e.target as HTMLDivElement)!.getAttribute('data-index');
    const fileType = key && key.substring(0, key.indexOf('_'));
    const path = (e.target as HTMLDivElement)!.getAttribute('data-key');
    const pathInfo = { pathName: path, fileType: fileType };

    //save delected file or dir
    //鼠标单击目录及文件
    if (key && !ctrlDown) {
      pathArray.splice(0, pathArray.length);
      activeIndex.splice(0, activeIndex.length);
      pathArray[0] = pathInfo;
      activeIndex[0] = key;
    } else if (key && ctrlDown && e.button !== 2) {
      //按下ctrl后单击目录及文件
      if (activeIndex.includes(key)) {
        //按住ctrl时点击可反复改变选择状态
        const index = activeIndex.indexOf(key);
        activeIndex.splice(index, 1);
      } else {
        activeIndex.push(key);
      }
      //文件多选的所有文件路径
      const flag = pathArray.findIndex((item) => {
        return item.pathName === path && item.fileType === fileType;
      })
      if (flag === -1) {
        pathArray.push(pathInfo);
      } else {
        pathArray.splice(flag, 1);
      }
    }
    props.saveDeleteFilePath([...pathArray]);
    const deleteStatus = pathArray.length === 0 ? true : false;
    props.changeDeleteStatus(deleteStatus);
  }
  const dirClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (ctrlDown || showRenameInput) {
      return
    }
    e.stopPropagation();
    props.sendHttp(pathArray[0].pathName, true);
    activeIndex.splice(0, activeIndex.length);
    pathArray.splice(0, pathArray.length);
    props.saveDeleteFilePath([...pathArray]);
    props.changeDeleteStatus(true);
    props.changeBackCount();
  }
  const handleClick = () => {
    props.changeShowNewFoder(false);
    activeIndex.splice(0, activeIndex.length);
    if (pathArray.length !== 0) {
      pathArray.splice(0, pathArray.length);
      props.saveDeleteFilePath([...pathArray]);
    }
    props.changeDeleteStatus(true);
    setShowContextMenu(false);
  }

  const setContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setShowContextMenu(true);
    let left = 0;
    let top = 0;
    const offsetLeft = document.body.clientWidth - e.clientX;
    const offsetBootom = document.body.clientHeight - e.clientY;
    offsetLeft < 180 ? left = e.clientX - 220 : left = e.clientX - 100;
    offsetBootom < 150 ? top = e.clientY - 150 : top = e.clientY - 64;
    const position = {
      left,
      top
    }
    setContextMenuPosition(position);
  }

  const noFilesContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    props.changeShowNewFoder(false);
    activeIndex.splice(0, activeIndex.length);
    pathArray.splice(0, pathArray.length);
    props.saveDeleteFilePath([...pathArray]);
    props.changeDeleteStatus(true);
    setContextMenu(e);
    if (activeIndex.length === 0) {
      setContextMenuItem([
        { name: 'refresh', show: true, key: t('refresh') },
        { name: 'new', show: true, key: t('New folder') },
        { name: 'selectAll', show: true, key: t('selectAll') }
      ]);
    }
  }

  const ctrlKeyDown = (e: any) => {
    if (e.ctrlKey) {
      setCtrlDown(true);
    }
  }
  const ctrlKeyUp = () => {
    setCtrlDown(false);
  }

  const handleContextMenu = (e: any) => {
    e.stopPropagation();
    const path = (e.target as HTMLDivElement)!.getAttribute('data-key');
    if (path && !(pathArray.some((item: any) => { return item.pathName === path }))) {
      changeSelect(e);
    }
    setContextMenu(e);
    if (pathArray.length > 1) {
      setContextMenuItem([
        { name: 'refresh', show: true, key: t('refresh') },
        { name: 'delete', show: true, key: t('Delete') },
        { name: 'remove', show: true, key: t('remove') }
      ]);
    } else {
      const fileType = pathArray[0] && pathArray[0].pathName.substring(pathArray[0].pathName.lastIndexOf('.') + 1);
      if (!fileType) {
        setContextMenuItem([
          { name: 'refresh', show: true, key: t('refresh') },
          { name: 'new', show: true, key: t('New folder') },
          { name: 'selectAll', show: true, key: t('selectAll') }
        ]);
      } else {
        const regImg = new RegExp('zip|png|svg|jpg|jpeg', 'i');
        const showopen = regImg.test(fileType) ? false : true;
        const reg = new RegExp('zip|tar|tgz', 'i');
        setContextMenuItem([
          { name: 'open', show: showopen, key: t('open') },
          { name: 'refresh', show: true, key: t('refresh') },
          { name: 'delete', show: true, key: t('Delete') },
          { name: 'rename', show: true, key: t('rename') },
          { name: 'unzip', show: reg.test(fileType), key: t('unzip') },
          { name: 'remove', show: true, key: t('remove') },
        ]);
      }
    }
  }

  const changeShowContextMenu = (show: boolean) => {
    setShowContextMenu(show);
  }

  const scroll = () => {
    setShowContextMenu(false);
  }

  const reNameClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const key = (e.target as HTMLDivElement)!.getAttribute('data-index');
    if (key && activeIndex.includes(key) && activeIndex.length === 1) {
      setShowRenameInput(true);
    }
  }

  const sameNameTip = (reName: string) => {
    const fileIshad = props.fileInfos.listfiles.some((item: any) => {
      return item.thefilename === reName;
    })
    const dirIshad = props.fileInfos.listdir.some((item: any) => {
      return item.thefilename === reName;
    })
    fileIshad && Modal.warning({
      title: t('sameFile'),
      centered: true,
      mask: false
    });
    dirIshad && Modal.warning({
      title: t('sameDir'),
      centered: true,
      mask: false
    });
    return (fileIshad || dirIshad);
  }

  const handleRename = (e: any) => {
    e.stopPropagation();
    setCheckRename(false);
    if (checkRename) {
      return;
    }
    setShowRenameInput(false);
    let reName = e.target.value;
    let reNamePath = '';
    var reg = /\S/;
    if (!reg.test(reName)) {
      return
    }
    if (pathArray[0].fileType === 'file') {
      const fileSuffix = pathArray[0].pathName.substring(pathArray[0].pathName.lastIndexOf('.'));
      reName = e.target.value + fileSuffix;
    }

    const index = pathArray[0].pathName.lastIndexOf('/');
    reNamePath = pathArray[0].pathName.substring(0, index) + `/${reName}`;
    if (pathArray[0].pathName !== reNamePath) {
      const flag = sameNameTip(reName);
      if (flag) {
        return
      }
      pathArray[0].fileType === 'dir' ? activeIndex.push(`dir_${reName}`) : activeIndex.push(`file_${reName}`);
      renameFile({ originalNamePath: pathArray[0].pathName, reNamePath: reNamePath }).then((res) => {
        if (res.data === 'rename success') {
          props.refresh();
          const fileType = pathArray[0].fileType;
          pathArray.splice(0, pathArray.length);
          pathArray.push({ pathName: reNamePath, fileType: fileType });
          props.saveDeleteFilePath([...pathArray]);
        } else {
          console.log('重命名失败');
        }
      })
    }
  }
  const inputKeyDown = (e: any) => {
    e.stopPropagation();
    if (e.keyCode == 13) {
      if (props.showNewFoder) {
        e.target.blur();
      } else {
        e.target.blur();
      }
    }
  }

  const renameCheck = (e: any) => {
    e.stopPropagation();
    const reg = new RegExp('[\\\\:*/|?"<>]');
    (reg.test(e.target.value) || e.target.value.length > 100) ? setCheckRename(true) : setCheckRename(false);
  }

  const changeShowRenameInput = (flag: boolean) => {
    setShowRenameInput(flag)
  }
  const handleNewFoder = (e: any) => {
    e.stopPropagation();
    setCheckRename(false);
    if (checkRename) {
      return;
    }
    var reg = /\S/;
    if (!reg.test(e.target.value)) {
      return
    }
    activeIndex.splice(0, activeIndex.length);
    const newFoderPath = props.fileInfos.lastfilepath + '/' + e.target.value;
    activeIndex.push(`dir_${e.target.value}`);
    const flag = sameNameTip(e.target.value);
    if (flag) {
      return
    }
    newFoder({ newFoderPath }).then((res) => {
      props.changeShowNewFoder(false);
      if (res.data === 'new success') {
        props.refresh();
        pathArray.splice(0, pathArray.length);
        pathArray.push({ pathName: newFoderPath, fileType: 'dir' });
        props.saveDeleteFilePath([...pathArray]);
        props.changeDeleteStatus(false);
      } else {
        console.log('新建失败');
      }
    })
  }

  const rightNewFoder = (flag: boolean) => {
    props.changeNewFoderName();
    props.changeShowNewFoder(flag);
  }

  const openGcode = (pathName: string) => {
    readFileData({ pathName }).then((res) => {
      if (res.status === 200) {
        const index = pathName.lastIndexOf("/");
        const fileName = pathName.substr(index + 1);
        const meta = {
          name: fileName,
          size: res.data.filesize
        };
      } else {
        console.log('读取文件失败');
      }
    })
  }
  const openFiles = (item: { thefilename: string, filepath: string, imgurl?: string }) => {
    const fileType = pathArray[0].pathName.substring(pathArray[0].pathName.lastIndexOf('.') + 1);
    if (fileType.toLowerCase() === 'stl') {
      history.push('/printing')
      dispatch(updatePrintingFile({
        name: item.thefilename.substring(0, item.thefilename.lastIndexOf('.')),
        size: 0,
        type: fileType,
        path: pathArray[0].pathName
      }))
    }

    fileType === 'gcode' && openGcode(pathArray[0].pathName);
    fileType === 'zip' && unzipDirZip();
  }

  const unzipDirZip = () => {
    if (unzipLoading) {
      Modal.warning({
        title: t('unzipTip'),
        centered: true,
        mask: false
      });
      return;
    }
    const fileName = pathArray[0].pathName.substring(0, pathArray[0].pathName.lastIndexOf('.'))
    setUnzipingFilename(pathArray[0].pathName.substring(pathArray[0].pathName.lastIndexOf('/') + 1));
    const dirIshad = props.fileInfos.listdir.some((item: any) => {
      return item.filepath === fileName;
    })
    if (dirIshad) {
      setUnzipLoading(false);
      Modal.warning({
        title: t('sameunzipDir'),
        centered: true,
        mask: false
      });
      return;
    }
    setUnzipLoading(true);
    props.changeDeleteStatus(true);
    const pathName = pathArray[0].pathName;
    unzipDir({ pathName }).then((res) => {
      if (res.data === 'success') {
        setUnzipLoading(false);
        props.changeDeleteStatus(false);
        props.refresh();
        activeIndex.splice(0, activeIndex.length);
        const name = pathName.substring(pathName.lastIndexOf('/') + 1);
        activeIndex.push(`dir_${name.substring(0, name.lastIndexOf('.'))}`);
        pathArray.splice(0, pathArray.length);
        const filename = pathName.substring(0, pathName.lastIndexOf('.'));
        pathArray.push({ pathName: filename, fileType: 'dir' });
        props.saveDeleteFilePath([...pathArray]);
        setShowContextMenu(false);
      } else {
        console.log('error', res.data);
        props.refresh();
        setUnzipLoading(false);
        setShowContextMenu(false);
      }
    })
  }

  const changeAllDirInfos = (data: any) => {
    setAllDirInfos(data);
  }

  const globalClick = () => {
    setShowContextMenu(false);
  }

  const selectAllFiles = () => {
    props.fileInfos.listfiles.forEach((item: { [index: string]: string }) => {
      activeIndex.push(`file_${item.thefilename}`);
      const pathInfo = { pathName: item.filepath, fileType: 'file' };
      pathArray.push(pathInfo);
    })
    props.fileInfos.listdir.forEach((item: { [index: string]: string }) => {
      activeIndex.push(`dir_${item.thefilename}`)
      const pathInfo = { pathName: item.filepath, fileType: 'dir' };
      pathArray.push(pathInfo)
    })
    props.saveDeleteFilePath([...pathArray]);
    pathArray.length !== 0 && props.changeDeleteStatus(false);
  }

  useEffect(() => {
    window.addEventListener('keydown', ctrlKeyDown);
    window.addEventListener('keyup', ctrlKeyUp);
    window.addEventListener('click', globalClick)
    return () => {
      window.removeEventListener('keydown', ctrlKeyDown);
      window.removeEventListener('keyup', ctrlKeyUp);
      window.removeEventListener('click', globalClick)
    }
  }, [])

  useEffect(() => {
    if (props.fileInfos.lastfilepath) {
      setActiveIndex([]);
      setPathArray([]);
      props.saveDeleteFilePath([...pathArray]);
      props.changeDeleteStatus(true);
    }
  }, [props.fileInfos.lastfilepath])

  useEffect(() => {
    if (props.successFlag) {
      activeIndex.splice(0, activeIndex.length);
      pathArray.splice(0, pathArray.length);
      props.saveDeleteFilePath([...pathArray]);
      props.changeDeleteStatus(true);
    }
  }, [props.successFlag])

  useEffect(() => {
    if (props.showNewFoder) {
      props.changeDeleteStatus(true);
      setActiveIndex(['dir_new']);
    }
  }, [props.showNewFoder])

  useEffect(() => {
    if (props.showRemove) {
      readAllFilesOrDirs({ pathArray, filepath: props.fileInfos.lastfilepath }).then((res) => {
        setAllDirInfos(res.data);
      })
    }
  }, [props.showRemove])

  useEffect(() => {
    if (downloadNewFile && downloadNewFile.progress === 100) {
      props.refresh();
      activeIndex.splice(0, activeIndex.length); downloadNewFile.fileName
      activeIndex.push(`file_${downloadNewFile.fileName}`);
      pathArray.splice(0, pathArray.length);
      pathArray.push({ pathName: props.fileInfos.lastfilepath + '/' + downloadNewFile.fileName, fileType: 'file' });
      props.saveDeleteFilePath([...pathArray]);
      props.changeDeleteStatus(false);
    }
  }, [downloadNewFile])

  return (
    <div
      className={styles.FilesContainer}
      onClick={handleClick}
      onContextMenu={noFilesContextMenu}
      onWheel={scroll}
    >
      {props.fileInfos.listdir && props.fileInfos.listdir.map((item: any, index: number) => {
        return (
          <div
            onContextMenu={handleContextMenu}
            key={index}
            data-index={`dir_${item.thefilename}`}
            data-key={item.filepath}
            onDoubleClick={dirClick}
            onClick={changeSelect}
            className={classNames(activeIndex.includes(`dir_${item.thefilename}`) && styles.selected, styles.item)}
          >
            <img src={require('./image/dir.svg')} alt="" data-key={item.filepath} data-index={`dir_${item.thefilename}`} />
            {(!(showRenameInput && activeIndex.includes(`dir_${item.thefilename}`))) &&
              <span data-key={item.filepath} data-index={`dir_${item.thefilename}`} onClick={reNameClick}>
                {item.thefilename}
              </span>
            }
            {(showRenameInput && activeIndex.includes(`dir_${item.thefilename}`)) &&
              <Tooltip
                title={t('FileNametips')}
                placement="topLeft"
                visible={checkRename}
              >
                <input className={styles.input} type="text" defaultValue={item.thefilename}
                  onFocus={(e: any) => { e.currentTarget.select(); renameCheck(e); }}
                  onBlur={handleRename}
                  onClick={(e: any) => { e.stopPropagation(); }}
                  onDoubleClick={(e: any) => { e.stopPropagation(); }}
                  onKeyDown={inputKeyDown}
                  onChange={renameCheck}
                  autoFocus
                />
              </Tooltip>
            }
          </div>
        )
      })}
      {props.showNewFoder &&
        <div
          className={classNames(activeIndex.includes(`dir_new`) && styles.selected, styles.item)}
          data-index='dir_new'
        >
          <img src={require('./image/dir.svg')} alt="" data-index='dir_new' />
          <Tooltip
            title={t('FileNametips')}
            placement="topLeft"
            visible={checkRename}
          >
            <input className={styles.input} type="text" defaultValue={`${t('New folder')}${props.newFoderName === 0 ? '' : ` (${props.newFoderName})`}`}
              data-index='dir_new'
              autoFocus
              onKeyDown={inputKeyDown}
              onClick={(e: any) => { e.stopPropagation(); }}
              onFocus={(e: any) => { e.stopPropagation(); e.currentTarget.select(); renameCheck(e); }}
              onBlur={handleNewFoder}
              onChange={renameCheck}
            />
          </Tooltip>
        </div>
      }
      {props.fileInfos.listfiles && props.fileInfos.listfiles.map((item: any, index: number) => {
        let fileType = item.thefilename.substring(item.thefilename.lastIndexOf('.') + 1).toLowerCase();
        let path = '';
        const reg = /png|svg|jpg|jpeg/;
        const zip = /zip|tar|tgz/;
        if (reg.test(fileType)) {
          path = `data:image/jpeg;base64,${item.imgurl}`;
        } else if (zip.test(fileType)) {
          path = require(`./image/zip.svg`);
        } else {
          path = require(`./image/${fileType}.svg`);
        }
        return (
          <div
            onContextMenu={handleContextMenu}
            key={index}
            data-key={item.filepath}
            className={classNames(activeIndex.includes(`file_${item.thefilename}`) && styles.selected, styles.item)}
            data-index={`file_${item.thefilename}`}
            onDoubleClick={() => openFiles(item)}
            onClick={changeSelect}
          >
            <img src={path} data-index={`file_${item.thefilename}`} alt="" data-key={item.filepath} />
            {(!(showRenameInput && activeIndex.includes(`file_${item.thefilename}`))) &&
              <span data-index={`file_${item.thefilename}`} data-key={item.filepath} onClick={reNameClick} >
                {item.thefilename}
              </span>
            }
            {(showRenameInput && activeIndex.includes(`file_${item.thefilename}`)) &&
              <Tooltip
                title={t('FileNametips')}
                placement="topLeft"
                visible={checkRename}
              >
                <input className={styles.input} type="text"
                  defaultValue={item.thefilename.substring(0, item.thefilename.lastIndexOf('.'))}
                  onFocus={(e: any) => { e.currentTarget.select(); renameCheck(e); }}
                  onKeyDown={inputKeyDown}
                  onClick={(e: any) => { e.stopPropagation(); }}
                  onDoubleClick={(e: any) => { e.stopPropagation(); }}
                  onBlur={handleRename}
                  onChange={renameCheck}
                  autoFocus
                />
              </Tooltip>
            }
          </div>
        )
      })}
      {
        (downloadNewFile && downloadNewFile.savePath === props.fileInfos.lastfilepath) && (
          <div
            className={classNames(styles.item, styles.downloadfile)}
          >
            <img src={require('./image/downloading.svg')} alt="" />
            <div><img src={require('./image/downloading.gif')} alt="" /></div>
            <span>
              {downloadNewFile.fileName}
            </span>
          </div>
        )
      }
      {((!props.successFlag) || unzipLoading) &&
        <div className={styles.loaderIcon}>
          <i className="fa fa-spinner fa-spin" />
          {!props.successFlag && <span>{props.successFlag ? `${props.deletingTip} ${t('Deleted')}` : `${props.deletingTip} ${t('Deleting')}`}</span>}
          {unzipLoading && <span>{unzipLoading ? `${unzipingFilename} ${t('Unpacking')}` : t('Unziped')}</span>}
        </div>
      }

      {(props.fileInfos && (props.fileInfos.filesLegth === 0)) && (
        <div className={styles.nofile}>
          <span className={styles.iconempty}></span>
          <span className={styles.emptytext}>
            {t('File-empty-tip')}
            <span className={styles.downloadstl} onClick={props.openNewBrowser}>{t('Download model')}</span>
          </span>
        </div>
      )}
      {showContextMenu &&
        <FilesContextMenu
          refresh={props.refresh}
          contextMenuPosition={contextMenuPosition}
          clickDeleteFiles={props.clickDeleteFiles}
          changeShowContextMenu={changeShowContextMenu}
          contextMenuItem={contextMenuItem}
          changeShowRenameInput={changeShowRenameInput}
          openDir={dirClick}
          pathArray={pathArray}
          rightNewFoder={rightNewFoder}
          unzipDirZip={unzipDirZip}
          openFiles={openFiles}
          changeShowRemove={props.changeShowRemove}
          selectAllFiles={selectAllFiles}
        />}
      {props.showRemove &&
        <FilesRemove
          changeShowRemove={props.changeShowRemove}
          fileInfos={props.fileInfos}
          allDirInfos={allDirInfos}
          pathArray={pathArray}
          refresh={props.refresh}
          changeAllDirInfos={changeAllDirInfos}
          changeDeleteStatus={props.changeDeleteStatus}
        />
      }
    </div>
  )
}
export default FilesContainer;