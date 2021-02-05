const { app } = require('electron');
const path = require('path');

const CURA_ENGINE_MACOS = path.join(app.getAppPath(), '/resources/CuraEngine/mac/CuraEngine');
const CURA_ENGINE_LINUX = path.join(app.getAppPath(), '/resources/CuraEngine/linux/CuraEngine');
const CURA_ENGINE_WIN64 = path.join(app.getAppPath(), '/resources/CuraEngine/win/CuraEngine.exe');

const CURA_ENGINE_MACOS_DEV = path.join(__dirname, '../../build/CuraEngine/3.6/mac/CuraEngine');
const CURA_ENGINE_LINUX_DEV = path.join(__dirname, '../../build/CuraEngine/3.6/linux/CuraEngine');
const CURA_ENGINE_WIN64_DEV = path.join(__dirname, '../../build/CuraEngine/3.6/win/CuraEngine.exe');

const CURA_CONFIG_LOCAL = path.join(app.getAppPath(), '/resources/CuraEngine/Config');
const CURA_CONFIG_LOCAL_DEV = path.join(__dirname, '../../build/CuraEngine/Config');

module.exports = {
  CURA_ENGINE_MACOS,
  CURA_ENGINE_LINUX,
  CURA_ENGINE_WIN64,
  CURA_ENGINE_MACOS_DEV,
  CURA_ENGINE_LINUX_DEV,
  CURA_ENGINE_WIN64_DEV,
  CURA_CONFIG_LOCAL,
  CURA_CONFIG_LOCAL_DEV
};
