const { app, Menu, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const mkdirp = require('mkdirp');
const pkg = require('./package.json');
const { macTemplate } = require('./macTemplate');
const LocalStorageData = require('./server/LocalStorageData');
const checkDevelopment = process.argv.includes('development');
const needServer = process.argv.includes('server');
const WindowsMonitors = require('./windowsMonitor')
const path = require('path');
if (!checkDevelopment || needServer) {
  require('./server/index');
}
let mainWindow;
let logoWindow;
app.allowRendererProcessReuse = true;

const main = () => {
  // https://github.com/electron/electron/blob/master/docs/api/app.md#apprequestsingleinstancelock
  const gotSingleInstanceLock = app.requestSingleInstanceLock();
  const shouldQuitImmediately = !gotSingleInstanceLock;

  if (shouldQuitImmediately) {
    app.quit();
    return;
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (!mainWindow) {
      return;
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  const store = new Store();

  // Create the user data directory if it does not exist
  const userData = app.getPath('userData');
  mkdirp.sync(userData);


  // Allow max 4G memory usage
  if (process.arch === 'x64') {
    app.commandLine.appendSwitch('--js-flags', '--max-old-space-size=4096');
  }

  app.commandLine.appendSwitch('ignore-gpu-blacklist');

  app.on('ready', () => {
    //初始化用户文件夹及配置文件
    LocalStorageData.init();

    const options = {
      width: 1920,
      height: 1080,
      title: `${pkg.name} ${pkg.version}`,
      ...store.get('bounds'),
    };

    const closeLogoWindow = () => {
      logoWindow.close();
      if (checkDevelopment) {
        mainWindow.webContents.openDevTools();
      }
    };

    logoWindow = WindowsMonitors.createWindow({
      url: path.join(__dirname, './accset/loading.html'),
      options: {
        width: 600,
        height: 375,
      },
      frame: false
    })
    mainWindow = WindowsMonitors.createWindow({
      url: checkDevelopment ? 'http://localhost:8080' : 'http://localhost:9093',
      options,
      frame: true
    }, closeLogoWindow)

    mainWindow.on('close', () => {
      app.exit();
    })

    ipcMain.on('forceClose', () => {
      const [width, height] = mainWindow.getSize();
      store.set('bounds', { width, height });
      app.exit();
    });
  });
};

main();
