import React, { useState } from 'react';
import styles from './index.styl';
import { Button, Icon, Tree, Modal, Input } from 'antd';
import { newFoder, removeFile, readAllFilesOrDirs } from '../../lib/http/api';
import { useTranslation } from 'react-i18next';

const { DirectoryTree } = Tree;

interface Iprops {
  changeShowRemove: (flag: boolean) => void;
  fileInfos: any;
  allDirInfos: any;
  pathArray: { [index: string]: string }[];
  refresh: () => void;
  changeAllDirInfos: (data: any) => void;
  changeDeleteStatus: (status: boolean) => void;
}

const FilesRemove = (props: Iprops) => {
  const [removeTarget, setRemoveTarget] = useState([] as string[]);
  const [newStatus, setNewStatus] = useState(false);
  const { t } = useTranslation();

  let flag = false;
  const sameNameTip = (allDirInfos: any, reName: string) => {
    allDirInfos.forEach((item: any) => {
      if (item.key === removeTarget[0]) {
        flag = item.children.some((item: any) => {
          return item.title === reName;
        })
      } else {
        sameNameTip(item.children, reName);
      }
    })
  }

  const removeConfirm = () => {
    if (removeTarget.length !== 0) {
      let sourcePaths: string[] = [];
      props.pathArray.forEach((item: { [index: string]: string }) => {
        sourcePaths.push(item.pathName);
      })
      sourcePaths.forEach((path: string) => {
        const fileName = path.substring(path.lastIndexOf('/') + 1);
        const targetPath = removeTarget[0] + '/' + fileName;
        sameNameTip(props.allDirInfos, fileName)
        if (flag || path === targetPath) {
          Modal.warning({
            title: `${fileName}${t('AlreadyExists')}`,
            centered: true,
            mask: false
          });
          return
        }
        if (newStatus) {
          return;
        }
        removeFile({ sourcePath: path, targetPath: targetPath }).then((res) => {
          if (res.data === 'success') {
            props.refresh();
            props.changeShowRemove(false);
            props.changeDeleteStatus(true);
          }
        })
      })
    }
  }

  const removeCancel = () => {
    props.changeShowRemove(false);
  }

  const newDir = (e: any) => {
    var reg = /\S/;
    if (!reg.test(e.target.value)) {
      Modal.warning({
        title: t('CannotEmpty'),
        centered: true,
        mask: false
      });
      return
    }
    const newFoderPath = removeTarget[0] + '/' + e.target.value;
    flag = false;
    sameNameTip(props.allDirInfos, e.target.value);
    if (flag) {
      Modal.warning({
        title: `${e.target.value}${t('AlreadyExists')}`,
        centered: true,
        mask: false
      });
      return
    }
    newFoder({ newFoderPath }).then((res) => {
      if (res.data === 'new success') {
        props.refresh();
        readAllFilesOrDirs({ pathArray: props.pathArray, filepath: props.fileInfos.lastfilepath }).then((res) => {
          props.changeAllDirInfos([...res.data]);
          setNewStatus(false);
        })
      } else {
        console.log('新建失败');
      }
    })
  }

  const findCurrentNode = (allDirInfos: any) => {
    const filesInfos = {
      key: "",
      title: <Input
        defaultValue="新建文件夹" onBlur={newDir} onPressEnter={(e: any) => { e.target.blur() }} autoFocus
        onFocus={(e: any) => { e.stopPropagation(); e.currentTarget.select() }}
      />,
      children: [],
      disabled: false,
      selectable: true,
      isLeaf: true,
    };

    allDirInfos && allDirInfos.forEach((item: any) => {
      if (item.key === removeTarget[0]) {
        filesInfos.key = item.key + '/';
        item.children.push(filesInfos);
      } else {
        findCurrentNode(item.children);
      }
    })
    return allDirInfos;
  }

  const newDirShow = () => {
    if (removeTarget.length === 0) {
      return
    }
    const newAllDirInfos = findCurrentNode(props.allDirInfos);
    props.changeAllDirInfos([...newAllDirInfos]);
    setNewStatus(true);
  }

  const select = (keys: any, event: any) => {
    setRemoveTarget([...keys]);
  }
  return (
    <div className={styles.container}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => e.stopPropagation()}
    >
      <div className={styles.hearder}>
        <span>{t('selectRemoveDir')}</span>
        <span onClick={removeCancel}><Icon type="close" /></span>
      </div>
      <div className={styles.content}>
        <div className={styles.menu}>
          {(props.allDirInfos && props.allDirInfos.length !== 0) &&
            <DirectoryTree onSelect={select} showIcon treeData={props.allDirInfos} defaultExpandedKeys={[props.allDirInfos[0].key]}>
            </DirectoryTree>
          }
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.new}>
          <Button onClick={newDirShow} disabled={newStatus || removeTarget.length === 0}>{t('New folder')}</Button>
        </span>
        <span className={styles.option}>
          <Button onClick={removeConfirm} disabled={removeTarget.length === 0}>{t('Ok')}</Button>
          <Button onClick={removeCancel} onMouseDown={(e: any) => { e.preventDefault() }}>{t('Cancel')}</Button>
        </span>
      </div>
    </div >
  )
}
export default FilesRemove;