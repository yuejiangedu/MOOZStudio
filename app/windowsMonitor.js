const { BrowserWindow, Menu, remote } = require('electron');
const { macTemplate, inputMenu, selectionMenu } = require('./macTemplate');
class WindowsMonitors {
  static windows = new Set();
  static createWindow = ({ url, options, hasMenu, frame }, callback) => {
    const newWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        nodeIntegrationInWorker: true
      },
      width: options.width,
      height: options.height,
      backgroundColor: '#fff',
      frame
    });

    newWindow.on('ready-to-show', () => {
      newWindow.show();
      callback && callback();
    });


    try {
      Menu.setApplicationMenu(null);
      const menu = Menu.buildFromTemplate(macTemplate());
      hasMenu && newWindow.setMenu(menu)
      const winOptions = {
        ...options
      };
      newWindow.loadURL(url, winOptions);

      newWindow.webContents.on('context-menu', (event, props) => {
        const { selectionText, isEditable } = props;
        if (isEditable) {
          inputMenu.popup(newWindow);
        } else if (selectionText && String(selectionText).trim() !== '') {
          selectionMenu.popup(newWindow);
        }
      });

      newWindow.on('closed', () => {
        this.windows.delete(newWindow);
      });

      this.windows.add(newWindow)

      return newWindow
    } catch (err) {
      console.error('Error:', err);
    }
  }
}
module.exports = WindowsMonitors