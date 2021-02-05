const { app } = require('electron');
const isElectron = require('is-electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { CURA_CONFIG_LOCAL, CURA_CONFIG_LOCAL_DEV } = require('./constants');
const pkg = require('../package.json');
const buildVersion = pkg.version;

const checkDevelopment = process.argv.includes('development');

class LocalStorageData {
  static userDataDir;

  static modelDir;

  static configDir;

  static gcodeDir;

  static stlDir;

  static versionCofigDir;

  static versionConfigPath = '';

  static moozVersion = ''

  static configFileName = ''

  static materialFileName = ''

  static currentFilePath = ''

  static curConfigData = {
    'quality': {},
    'material': {}
  }

  static iniUserDataDir = () => {
    return new Promise((resolve) => {
      if (isElectron()) {
        this.userDataDir = path.join(app.getPath('userData'), '/userData');
      } else {
        this.userDataDir = './userData';
      }
      this.versionConfigPath = path.join(this.userDataDir, '/VersionConfig/versionConfig.json');
      if (!fs.existsSync(this.userDataDir)) {
        fs.mkdir(this.userDataDir, (err) => {
          err && log.error(err);
          resolve();
        });
      } else {
        resolve();
      }
    })
  }

  static initModelDir = () => {
    return new Promise((resolve) => {
      this.modelDir = path.join(this.userDataDir, '/Model');
      if (!fs.existsSync(this.modelDir)) {
        fs.mkdir(this.modelDir, (err) => {
          err && log.error(err);
          resolve();
        });
      } else {
        this.clearHistoryFile(this.modelDir);
        resolve()
      }
    })
  }

  static initConfigDir = () => {
    return new Promise((resolve) => {
      this.configDir = path.join(this.userDataDir, '/Config');
      if (!fs.existsSync(this.configDir)) {
        fs.mkdir(this.configDir, (err) => {
          if (err) {
            log.error(err);
          } else {
            this.initSliceConfigFiles();
          }
          resolve();
        });
      } else {
        this.initSliceConfigFiles();
        resolve();
      }
    })
  }

  static initGcodeDir = () => {
    return new Promise((resolve) => {
      this.gcodeDir = path.join(this.userDataDir, '/Gcode');
      if (!fs.existsSync(this.gcodeDir)) {
        fs.mkdir(this.gcodeDir, (err) => {
          err && log.error(err);
          resolve();
        });
      } else {
        this.clearHistoryFile(this.gcodeDir);
        resolve();
      }
    })
  }

  static initStlDir = () => {
    return new Promise((resolve) => {
      this.stlDir = path.join(this.userDataDir, '/Stl');
      if (!fs.existsSync(this.stlDir)) {
        fs.mkdir(this.stlDir, (err) => {
          err && log.error(err);
          resolve();
        });
      } else {
        resolve()
      }
    })
  }

  static initVersionConfig = () => {
    let jsonData = {
      'version': buildVersion,
      'print3DVersion': 'MOOZ-2 PLUS'
    }
    this.versionConfigPath = path.join(this.userDataDir, '/VersionConfig/versionConfig.json');
    return new Promise((resolve) => {
      this.versionCofigDir = path.join(this.userDataDir, '/VersionConfig');
      if (!fs.existsSync(this.versionCofigDir)) {
        fs.mkdir(this.versionCofigDir, (err) => {
          if (err) {
            log.error(err)
          } else {
            fs.writeFile(this.versionConfigPath, JSON.stringify(jsonData), (err) => {
              err && log.error(err);
              resolve();
            });
          }
        });
      } else {
        //如配置文件存在，版本更新需要重写覆盖
        if (fs.existsSync(this.versionConfigPath)) {
          const oldVersion = require(this.versionConfigPath).version;
          if (oldVersion !== buildVersion) {
            fs.writeFile(this.versionConfigPath, JSON.stringify(jsonData), (err) => {
              err && log.error(err);
              resolve();
            });
          } else {
            resolve()
          }
        }
      }
    })
  }

  static init = async () => {
    await this.iniUserDataDir()
    await this.initModelDir()
    await this.initConfigDir()
    await this.initVersionConfig()
    await this.initGcodeDir()
    await this.initStlDir()
  }

  static clearHistoryFile = (dir) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const curPath = dir + '/' + file;
        if (fs.statSync(curPath).isDirectory()) {
          this.clearHistoryFile(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
    }
  }

  static initSliceConfigFiles = () => {
    const configFileDir = checkDevelopment ? CURA_CONFIG_LOCAL_DEV : CURA_CONFIG_LOCAL;
    if (fs.existsSync(configFileDir)) {
      this.copyFileSync(configFileDir, this.configDir);
    }
  }

  static makedir = (fDir, tDir) => {
    fs.mkdir(tDir, (err) => {
      err && log.error(err);
      this.copyFileSync(fDir, tDir);
    });
  }

  static copyFileSync = (fileDir, targetDir) => {
    const files = fs.readdirSync(fileDir);
    for (const file of files) {
      const fDir = path.join(fileDir, file);
      const tDir = path.join(targetDir, file);
      if (fs.existsSync(fDir) && fs.statSync(fDir).isFile()) {
        fs.copyFileSync(fDir, tDir)
      } else {
        //判断文件夹
        if (fs.existsSync(this.versionConfigPath)) {
          const oldVersion = require(this.versionConfigPath).version;
          if (oldVersion !== buildVersion) {
            !fs.existsSync(tDir) ? this.makedir(fDir, tDir) : this.copyFileSync(fDir, tDir);
          } else {
            !fs.existsSync(tDir) && this.makedir(fDir, tDir);
          }
        } else {
          !fs.existsSync(tDir) && this.makedir(fDir, tDir);
        }
      }
    }
  }

  static updateMoozVersion = (version) => {
    this.moozVersion = version;
  }

  static setConfigFileName = (name) => {
    this.configFileName = name;
  }

  static setMaterialFileName = (name) => {
    this.materialFileName = name;
  }

  static saveCurConfigData = (obj) => {
    this.curConfigData = obj
  }

  static updateCurrentFilePath = (filepath) => {
    this.currentFilePath = filepath;
  }

}

module.exports = LocalStorageData;
