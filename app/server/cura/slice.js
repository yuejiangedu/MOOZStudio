const childProcess = require('child_process');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const { CURA_ENGINE_MACOS, CURA_ENGINE_WIN64, CURA_ENGINE_LINUX, CURA_ENGINE_MACOS_DEV, CURA_ENGINE_LINUX_DEV, CURA_ENGINE_WIN64_DEV } = require('../constants');
const LocalStorageData = require('../LocalStorageData');
const { modifyConfigFile, getModelPosConfigPath } = require('./modifyConfig');


let curaEnginePath, sliceProgress, filamentLength, filamentWeight, printTime;
const checkDevelopment = process.argv.includes('development');
(() => {
  const curaDir = checkDevelopment
    ? {
      mac: CURA_ENGINE_MACOS_DEV,
      linux: CURA_ENGINE_LINUX_DEV,
      win: CURA_ENGINE_WIN64_DEV
    } : {
      mac: CURA_ENGINE_MACOS,
      win: CURA_ENGINE_WIN64,
      linux: CURA_ENGINE_LINUX
    };

  if (process.platform === 'darwin') {
    curaEnginePath = `${curaDir.mac}`;
  } else if (process.platform === 'win32') {
    if (process.arch === 'x64') {
      curaEnginePath = `${curaDir.win}`;
    }
  } else if (process.platform === 'linux') {
    if (process.arch === 'x64') {
      curaEnginePath = curaDir.linux;
    }
  }
  if (!curaEnginePath || !fs.existsSync(curaEnginePath)) {
    log.error(`Cura Engine not found: ${curaEnginePath}`);
  }
})();

const callCuraEngine = (modelPath, configPath, outputPath) => {
  return childProcess.spawn(
    curaEnginePath,
    ['slice', '-v', '-p', '-j', configPath, '-o', outputPath, '-l', modelPath]
  );
};

const slice = async (params, onProgress, onSucceed, onError) => {
  const { uploadName, originName, model3Ddata } = params;
  const uploadPath = params.path
  if (!fs.existsSync(uploadPath)) {
    onError(`3d model file not found: ${uploadPath}`);
    return;
  }

  await modifyConfigFile('fdmprinter.def.json', getModelPosConfigPath(), [model3Ddata.moveX, model3Ddata.moveY, `'${model3Ddata.rotateMatrix}'`]);

  const outputPath = path.join(`${LocalStorageData.gcodeDir}/${originName}.gcode`);
  const configPath = path.join(`${LocalStorageData.configDir}/${LocalStorageData.moozVersion}/${LocalStorageData.configFileName}`);
  if (!fs.existsSync(configPath)) {
    onError(`config file not found: ${configPath}`);
    return;
  }

  const process = callCuraEngine(uploadPath, configPath, outputPath);

  process.stderr.on('data', (data) => {
    const dataArray = data.toString().split('\n');

    dataArray.map((item) => {
      if (item.length < 10) {
        return null;
      }
      if (item.indexOf('Progress:inset+skin:') === 0 || item.indexOf('Progress:export:') === 0) {
        const start = item.indexOf('0.');
        const end = item.indexOf('%');
        sliceProgress = Number(item.slice(start, end));
        onProgress(sliceProgress);
      } else if (item.indexOf(';Filament used:') === 0) {
        filamentLength = Number(item.replace(';Filament used:', '').replace('m', ''));
        filamentWeight = Math.PI * (1.75 / 2) * (1.75 / 2) * filamentLength * 1.24;
      } else if (item.indexOf('Print time (s):') === 0) {
        printTime = Number(item.replace('Print time (s):', '')) * 1.07;
      }
      return null;
    });
  });

  process.on('close', (code) => {
    if (filamentLength && filamentWeight && printTime) {
      sliceProgress = 1;
      onProgress(sliceProgress);
      onSucceed({
        gcodeFilename: uploadName,
        printTime: printTime,
        filamentLength: filamentLength.toFixed(2),
        filamentWeight: Math.round(filamentWeight),
        gcodeFilePath: outputPath
      });
    } else {
      onError('Slice Error');
    }
    log.info(`slice progress closed with code ${code}`);
  });
};


module.exports = {
  slice
};
