import React, { useEffect, useState } from 'react';
import styles from './index.styl';
import { Icon, Input } from 'antd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { readAllFilesOrDirs } from '../../lib/http/api';
const { Search } = Input;

interface Iprops {
  fileInfos: any;
  handleBack: () => void;
  handleForward: () => void;
  pathJump: (datakey: string | null) => void;
  changeBackCount: () => void;
  backCount: number;
  forwardCount: number;
  searchFileInfos: (data: any) => void;
  refresh: () => void;
}
const FilesContentHeader = (props: Iprops) => {
  const [slicePath, setSlicePath] = useState([] as string[]);
  const { t } = useTranslation();
  let flag = true;

  const handlepathJump = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const datakey = (e.target as HTMLDivElement)!.getAttribute('data-key');
    let patharr = props.fileInfos.lastfilepath.split('/');
    let newpatharr = patharr.splice(0, patharr.indexOf(datakey) + 1);
    let path = newpatharr.join('/');
    props.pathJump(path);
    props.changeBackCount();
  }

  const handleCompositionStart = () => {
    flag = false;
  }
  const handleCompositionEnd = () => {
    flag = true;
  }

  const searchAll = (allFileInfos: any, arrFiles: any[], arrDir: any[], reg: any) => {
    allFileInfos.forEach((item: any) => {
      if (item.children) {
        if (item.arr && reg.test(item.arr.thefilename)) {
          if (item.fileType === 'dir') {
            arrDir.push(item.arr)
          } else {
            arrFiles.push(item.arr)
          }
        }
        searchAll(item.children, arrFiles, arrDir, reg)
      }
    })
  }

  const handleSearch = (val: string) => {
    if (!flag) {
      return
    }
    if (!val) {
      props.refresh();
      return
    }
    const reg = new RegExp(val.replace(/\+/g, "\\+").replace(/\(/g, "\\(").replace(/\)/g, "\\)"), 'i');
    let arrFiles: any[] = [];
    let arrDir: any[] = [];

    readAllFilesOrDirs({ filepath: props.fileInfos.lastfilepath }).then((res) => {
      searchAll(res.data[0].children, arrFiles, arrDir, reg)
      props.searchFileInfos({ listfiles: arrFiles, listdir: arrDir, lastfilepath: props.fileInfos.lastfilepath, filesLegth: arrFiles.length + arrDir.length });
    })
  }

  useEffect(() => {
    if (props.fileInfos.lastfilepath) {
      const showPath: string[] = props.fileInfos.lastfilepath.split('/');
      setSlicePath(showPath.slice(showPath.indexOf('Stl')));
    }
  }, [props.fileInfos.lastfilepath])

  return (
    <div className={styles.FilesContentHeader}>
      <span className={styles.Filespath}>
        <span className={classNames(styles.left, (props.forwardCount - props.backCount === 0) && styles.disable)} onClick={props.handleBack}>
          <span className={styles.iconback}></span>
        </span>
        <span className={classNames(styles.right, (props.backCount === 0) && styles.disable)} onClick={props.handleForward}>
          <span className={styles.iconforward}></span>
        </span>
        <span className={styles.line}></span>
        <div className={styles.path}>
          {slicePath.map((item, index) => (
            <span key={index} className={styles.pathitem} >
              <span data-key={item} onClick={handlepathJump}>{item}</span>
              <Icon type="right" style={{ display: index === slicePath.length - 1 ? 'none' : 'inline-block' }} />
            </span>
          ))}
        </div>
      </span>
      <span className={styles.FileSearch}>
        <Search
          placeholder={`${t('Search')} ${slicePath[slicePath.length - 1]}`}
          onChange={(e) => { handleSearch(e.target.value) }}
          onSearch={handleSearch}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          style={{ width: 250 }}
        />
      </span>
    </div>
  )
}
export default FilesContentHeader;