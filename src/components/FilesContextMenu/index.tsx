import React from 'react';
import styles from './index.styl';

interface Iprops {
  contextMenuPosition: { [index: string]: number }
  refresh: () => void;
  clickDeleteFiles: () => void;
  changeShowContextMenu: (show: boolean) => void;
  contextMenuItem: { [index: string]: boolean | string }[];
  changeShowRenameInput: (flag: boolean) => void;
  openDir: (e: any) => void;
  pathArray: { [index: string]: string }[];
  rightNewFoder: (flag: boolean) => void;
  unzipDirZip: () => void;
  openFiles: ({ thefilename }: { thefilename: string, filepath: string }) => void;
  changeShowRemove: (flag: boolean) => void;
  selectAllFiles: () => void;
}

const FilesContextMenu = (props: Iprops) => {
  const handleClick = (e: any) => {
    e.stopPropagation();
    const key = (e.target as HTMLDivElement)!.getAttribute('data-key');
    key === 'refresh' && props.refresh();
    key === 'delete' && props.clickDeleteFiles();
    key === 'rename' && props.changeShowRenameInput(true);
    if (key === 'open') {
      const thefilename = props.pathArray[0].pathName.substring(props.pathArray[0].pathName.lastIndexOf("/") + 1);
      props.pathArray[0].fileType === 'dir' ? props.openDir(e) : props.openFiles({ thefilename, filepath: props.pathArray[0].pathName });
    }
    key === 'new' && props.rightNewFoder(true);
    key === 'unzip' && props.unzipDirZip();
    key === 'remove' && props.changeShowRemove(true);
    key === 'selectAll' && props.selectAllFiles();
    props.changeShowContextMenu(false);
  }
  return (
    <div className={styles.container}
      style={{ top: `${props.contextMenuPosition.top}px`, left: `${props.contextMenuPosition.left}px` }}
    >
      <ul onClick={handleClick} onContextMenu={(e: any) => { e.stopPropagation(); }}>
        {props.contextMenuItem.map((item: any, index: number) => {
          return (
            item.show && <li data-key={item.name} key={index}>{item.key}</li>
          )
        })}
      </ul>
    </div>
  )
}
export default FilesContextMenu;