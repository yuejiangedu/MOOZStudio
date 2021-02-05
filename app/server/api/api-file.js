const path = require('path');
const formidable = require('formidable');
const fs = require('fs');
const log = require('electron-log');
const LocalStorageData = require('../LocalStorageData');
const { formatFileName } = require('../units');
const { modifyConfigFile, getMaterualConfigParams, getModifyConfigParams } = require('../cura/modifyConfig');
const rimraf = require('rimraf');
const { handleData } = require('../control/communicate');
const { heartbeatEvent, eventNames } = require('../socket/events');
const mv = require('mv');
const compressing = require('compressing');

/**
 * 上传模型文件
 * @param {*} req 
 * @param {*} res 
 */
const uploadUpdateFile = (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, files, file) => {
    const fileData = file.file;
    const originalName = path.basename(fileData.name);
    const nameArr = files.uploadName.split('.');
    const uploadName = formatFileName(nameArr[0]);
    const uploadPath = `${LocalStorageData.modelDir}/${uploadName}.${nameArr[nameArr.length - 1].toLowerCase()}`;
    fs.copyFile(fileData.path, uploadPath, (err) => {
      if (err) {
        log.error(`Failed to upload file ${originalName}`);
      }
      else {
        res.send({
          originalName,
          uploadName,
          uploadPath
        });
        res.end();
      }
    });
  });
};

/**
 * 添加自定义配置文件
 * @param {*} req 
 * @param {*} res 
 */
const addCustomConfigFile = (req, res) => {
  const { customName, isMaterialFile } = req.body;
  const templateFile = isMaterialFile ? 'material.pla.def.json' : 'quality.custom.def.json';
  const fileType = isMaterialFile ? 'material' : 'quality';
  const dir = path.join(LocalStorageData.configDir, LocalStorageData.moozVersion);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach((fileName) => {
      if (fileName === templateFile) {
        const fileDir = path.join(dir, `${fileType}.${customName}.def.json`);
        if (!fs.existsSync(fileDir)) {
          fs.writeFileSync(fileDir, fs.readFileSync(path.join(dir, fileName)));
          res.send({ result: 'success' });
          res.end();
        } else {
          res.send({ result: 'Custom file is exist !' });
          res.end();
        }
      }
    });
  }
};

const deleteCustomConfigFile = async (req, res) => {
  const { fileName } = req.body;
  const dir = path.join(LocalStorageData.configDir, LocalStorageData.moozVersion, fileName);
  if (fs.existsSync(dir)) {
    fs.unlinkSync(dir);
    res.end();
  }
};

/**
 * 获取当前配置文件数据
 * @param {*} req 
 * @param {*} res 
 */

const getConfigFileData = async (req, res) => {
  const { fileName, materialName } = req.query;
  const filePath = path.join(LocalStorageData.configDir, LocalStorageData.moozVersion, `quality.${fileName}.def.json`);
  const materialPath = path.join(LocalStorageData.configDir, LocalStorageData.moozVersion, `material.${materialName}.def.json`);
  if (fs.existsSync(filePath) || fs.existsSync(materialPath)) {
    //保存当前当前选择的配置文件名称
    LocalStorageData.setConfigFileName(`quality.${fileName}.def.json`);
    LocalStorageData.setMaterialFileName(`material.${materialName}.def.json`);

    //修改继承关系
    await modifyConfigFile(LocalStorageData.configFileName, [['inherits']], [`'material.${materialName}'`]);

    //获取配置数据
    const promiseList = [];
    const resData = {};
    [{ name: 'quality', path: filePath }, { name: 'material', path: materialPath }].forEach((item) => {
      promiseList.push(
        new Promise((resolve) => {
          fs.readFile(item.path, 'utf8', (err, data) => {
            if (err) {
              log.error('Failed to read file');
              return;
            }
            resData[item.name] = JSON.parse(data);
            resolve();
          });
        })
      );
    });
    Promise.all(promiseList).then(() => {
      LocalStorageData.saveCurConfigData(resData)
      res.send(resData);
      res.end();
    });
  } else {
    log.error('Failed to get config file');
    res.end();
  }
};

/**
 * 获取配置文件的下拉列表
 * @param {*} req 
 * @param {*} res 
 */
const getConfigFileList = (req, res) => {
  const dir = path.join(LocalStorageData.configDir, LocalStorageData.moozVersion);
  const { type } = req.query;
  const reg = type === 'material' ? /(?<=material.).*?(?=.def.json)/ : /(?<=quality.).*?(?=.def.json)/;
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    const list = [];
    for (const file of files) {
      const matchReg = file.match(reg);
      matchReg && list.push(...matchReg);
    }
    res.send(list);
    res.end();
  }
};

/**
 * 修改配置文件内容
 * @param {*} req 
 * @param {*} res 
 */

const modifyConfig = async (req, res) => {
  const { category, itemKey, value } = req.body;
  const val = typeof value === 'string' ? `'${value}'` : value
  if (category === 'material') {
    await modifyConfigFile(LocalStorageData.materialFileName, ...getMaterualConfigParams(itemKey, val));
  } else {
    await modifyConfigFile(LocalStorageData.configFileName, ...getModifyConfigParams(category, itemKey, val));
  }
  res.end();
};

const readFileInfos = (filepath, res) => {
  fs.readdir(filepath, (err, files) => {
    if (err) {
      console.log('readdir error');
    } else {
      const listfiles = [];
      const listdir = [];
      for (var i = 0; i < files.length; i++) {
        let thefilename = files[i];
        const newfilepath = filepath.replace(/\\/g, '/') + '/' + thefilename;
        const fileinfo = fs.statSync(newfilepath);
        if (fileinfo.isFile()) {
          const file = {
            thefilename: thefilename,
            filepath: newfilepath,
          }
          const fileType = thefilename.substring(thefilename.lastIndexOf('.')).toLowerCase();
          const reg = /.zip|.stl|.gcode|.tar|.tgz/;
          if (reg.test(fileType)) {
            listfiles.push(file);
          }
          const img = /.png|.svg|.jpg|.jpeg/;
          if (img.test(fileType)) {
            const imageBuf = fs.readFileSync(newfilepath);
            const file = {
              thefilename: thefilename,
              filepath: newfilepath,
              imgurl: imageBuf.toString("base64")
            }
            listfiles.push(file);
          }
        } else {
          const dir = {
            thefilename: thefilename,
            filepath: newfilepath
          }
          listdir.push(dir);
        }
      }
      heartbeatEvent.emit(eventNames.READSTLFILES, { listfiles: listfiles, listdir: listdir, lastfilepath: filepath.replace(/\\/g, '/'), filesLegth: listfiles.length + listdir.length });
      res.end();
    }
  })
}
//获取文件列表
const readStl = async (req, res) => {
  const { filepath } = req.body;
  if (filepath) {
    LocalStorageData.updateCurrentFilePath(filepath);
  } else {
    LocalStorageData.updateCurrentFilePath(LocalStorageData.stlDir);
  }
  if (filepath) {
    readFileInfos(filepath, res);
  } else {
    readFileInfos(LocalStorageData.stlDir, res);
  }
};
//删除文件
const deleteFiles = (req, res) => {
  const { deleteInfos } = req.body;
  if (deleteInfos) {
    rimraf(deleteInfos.pathName, (err) => {
      if (err) {
        console.log(err);
        return false;
      } else {
        res.send('success');
      }
    });
  }
}
//文件重命名
const renameFile = (req, res) => {
  const { originalNamePath, reNamePath } = req.body;
  fs.rename(originalNamePath, reNamePath, (err) => {
    if (err) {
      console.log(err);
      return false;
    } else {
      res.send('rename success');
    }
  });
}
//新建文件
const newFoder = (req, res) => {
  const { newFoderPath } = req.body;
  fs.mkdir(newFoderPath, (err) => {
    if (err) {
      console.log(err);
      return false;
    } else {
      res.send('new success');
    }
  });
}
//读取文件内容
const readFileData = (req, res) => {
  const { pathName } = req.body;
  const statInfo = fs.statSync(pathName);
  fs.readFile(pathName, "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send({ data: data, filesize: statInfo.size });
    }
  })
}
//解压zip压缩包
const unzipDir = (req, res) => {
  const { pathName } = req.body;
  const targetPath = pathName.substring(0, pathName.lastIndexOf('.'));
  const fileType = pathName.substring(pathName.lastIndexOf('.') + 1);
  fileType === 'zip' && compressing.zip.uncompress(pathName, targetPath)
    .then(() => {
      res.send('success');
    })
    .catch((err) => {
      res.send(err);
    });

  fileType === 'tgz' && compressing.tgz.uncompress(pathName, targetPath)
    .then(() => {
      res.send('success');
    })
    .catch((err) => {
      res.send(err);
    });

  fileType === 'tar' && compressing.tar.uncompress(pathName, targetPath)
    .then(() => {
      res.send('success');
    })
    .catch((err) => {
      res.send(err);
    });
}
//递归获取当前路径下的所有文件夹
const printAllDir = (MyUrl, filesInfos, currentDir, flag) => {
  const files = fs.readdirSync(MyUrl);
  files.forEach((file) => {
    let fPath = path.join(MyUrl, file);
    const type = fs.statSync(fPath);
    if (type.isDirectory()) {
      const fileInfo = {
        key: fPath,
        title: file,
        children: [],
        disabled: currentDir.includes(fPath) || flag
      };
      filesInfos.push(fileInfo)
      printAllDir(fPath, fileInfo.children, currentDir, fileInfo.disabled);
    }
  })
}

//获取当前路径下的所有文件及文件夹
const printAllFile = (MyUrl, filesInfos) => {
  const files = fs.readdirSync(MyUrl);
  files.forEach((file) => {
    let fPath = path.join(MyUrl, file);
    const type = fs.statSync(fPath);
    if (type.isDirectory()) {
      const fileInfo = {
        arr: {
          thefilename: file,
          filepath: fPath
        },
        fileType: 'dir',
        children: []
      };
      filesInfos.push(fileInfo)
      printAllFile(fPath, fileInfo.children);
    } else {
      const fileType = file.substring(file.lastIndexOf('.')).toLowerCase();
      const reg = /.zip|.stl|.gcode|.tar|.tgz/;
      let fileInfo = {};
      if (reg.test(fileType)) {
        fileInfo = {
          arr: {
            thefilename: file,
            filepath: fPath
          },
          fileType: 'file',
          children: []
        };
      }
      const img = /.png|.svg|.jpg|.jpeg/;
      if (img.test(fileType)) {
        const imageBuf = fs.readFileSync(fPath);
        fileInfo = {
          arr: {
            thefilename: file,
            filepath: fPath,
            imgurl: imageBuf.toString("base64")
          },
          fileType: 'file',
          children: []
        };
      }
      filesInfos.push(fileInfo)
    }
  })
}
//获取当前路径下所有文件及目录或者只获取所有目录
const readAllFilesOrDirs = (req, res) => {
  const { pathArray, filepath } = req.body;
  const rootName = filepath.substring(filepath.lastIndexOf('/') + 1);
  if (pathArray) {
    let currentDir = [];
    pathArray.forEach((item) => {
      if (item.fileType === 'dir') {
        currentDir.push(item.pathName);
      }
    })
    const filesInfos = [{
      key: LocalStorageData.stlDir,
      title: rootName,
      children: [],
      disabled: currentDir.includes(LocalStorageData.stlDir)
    }];
    //递归获取所有目录的树数据结构
    printAllDir(LocalStorageData.stlDir, filesInfos[0].children, currentDir, currentDir.includes(LocalStorageData.stlDir));
    res.send(filesInfos);
  } else {
    const filesInfos = [{
      arr: {
        thefilename: rootName,
        filepath: filepath
      },
      fileType: 'dir',
      children: []
    }];
    //递归获取所有文件及目录的树数据结构
    printAllFile(filepath, filesInfos[0].children);
    res.send(filesInfos);
  }
}

//移动文件夹
const removeFile = (req, res) => {
  const { sourcePath, targetPath } = req.body;
  mv(sourcePath, targetPath, { mkdirp: true }, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.send('success');
    }
  });
}

const getVersionConfig = (req, res) => {
  fs.readFile(LocalStorageData.versionConfigPath, 'utf-8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.send(data);
    }
  })
}

const writeVersionConfig = (req, res) => {
  const { name, value } = req.body
  fs.readFile(LocalStorageData.versionConfigPath, (err, data) => {
    const config = JSON.parse(data)
    if (err || !config[name]) {
      console.log(err);
    } else {
      config[name] = value;
      fs.writeFile(LocalStorageData.versionConfigPath, JSON.stringify(config), (err) => {
        err && log.error(err);
        res.send('success');
      });
    }
  })
}

module.exports = {
  uploadUpdateFile,
  addCustomConfigFile,
  getConfigFileData,
  getConfigFileList,
  modifyConfig,
  deleteCustomConfigFile,
  readStl,
  deleteFiles,
  renameFile,
  newFoder,
  readFileData,
  unzipDir,
  removeFile,
  readAllFilesOrDirs,
  getVersionConfig,
  writeVersionConfig
};
