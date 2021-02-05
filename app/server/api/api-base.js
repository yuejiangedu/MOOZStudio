const path = require('path');
const axios = require('axios');
const LocalStorageData = require('../LocalStorageData');
const getmac = require('getmac');//获取mac地址
const { BrowserWindow, Menu, shell } = require('electron');
const { macTemplate, inputMenu, selectionMenu } = require('../../macTemplate');
const WindowsMonitor = require('../../windowsMonitor')
const { heartbeatEvent, eventNames } = require('../socket/events');
const { verifyFileUnique } = require('../units');
const getUpdateJson = (req, res) => {
  axios.get('https://cn.dobot.cc/MOOZStudio/update.json').then(response => {
    res.send(response.data);
  });
};

const getIndex = (req, res) => {
  res.sendFile(path.join(__dirname, '../app', 'index.html'));
};

const updateMoozVersion = (req, res) => {
  const { version } = req.body;
  LocalStorageData.updateMoozVersion(version);
  res.end();
};

const getMac = (req, res) => {
  const data = getmac.default().replace(/:/g, '');
  const uuid = data.substring(0, 8) + '-' + data.substring(0, 4) + '-' + data.substring(4, 8) + '-' + data.substring(8, 12) + '-' + data;
  res.send(uuid);
  res.end();
}

/**
 * 打开模型下载页面
 * @param {*} req 
 * @param {*} res 
 */
let downloadPrg = 0

const openNewBrowserWindow = (req, res) => {
  const AllWindows = BrowserWindow.getAllWindows();
  if (AllWindows.length > 1) {
    downloadWin = AllWindows.filter((item) => {
      return item.getURL().split('.').indexOf('thingiverse') !== -1;
    })
    if (downloadWin[0]) {
      downloadWin[0].focus();
      res.send('show success');
      return
    }
  }
  const { url, title } = req.body;
  const mainWin = [...WindowsMonitor.windows][0]
  const newWin = WindowsMonitor.createWindow({
    url,
    options: {
      title,
      width: 1440,
      height: 900,
    },
    hasMenu: true,
    frame: true
  }, () => {
    res.send('show success');
  });
  newWin.webContents.session.on('will-download', (event, item, webContents) => {
    mainWin.focus();
    if (item.getURL().substring(0, 4) === 'http') {
      const fileName = verifyFileUnique(LocalStorageData.currentFilePath, item.getFilename())
      const opt = item.getSaveDialogOptions();
      item.setSavePath(path.join(LocalStorageData.currentFilePath, fileName))
      downloadPrg = 0
      const savePath = LocalStorageData.currentFilePath;
      heartbeatEvent.emit(eventNames.DOWNLOADNEWFILE, { fileName, progress: downloadPrg, savePath });
      item.on('updated', (event, state) => {
        heartbeatEvent.emit(event);
        if (state === 'interrupted') {
          console.log('Download is interrupted but can be resumed')
          item.resume();
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            console.log('Download is paused')
          } else {
            downloadPrg = Math.min(90, downloadPrg + ((100 - downloadPrg) / 10));
            heartbeatEvent.emit(eventNames.DOWNLOADNEWFILE, { fileName, progress: downloadPrg, savePath });
            console.log(`Received bytes: ${item.getReceivedBytes()}`)
          }
        }
      })
      item.once('done', (event, state) => {
        if (state === 'completed') {
          console.log('Download successfully')
          heartbeatEvent.emit(eventNames.DOWNLOADNEWFILE, { fileName, progress: 100, savePath });
          heartbeatEvent.emit(eventNames.DOWNLOADNEWFILE, null);
        } else {
          console.log(`Download failed: ${state}`)
        }
      })
    }
  })
}

module.exports = {
  getUpdateJson,
  getIndex,
  updateMoozVersion,
  getMac,
  openNewBrowserWindow
};
