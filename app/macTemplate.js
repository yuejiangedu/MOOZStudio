const { Menu } = require('electron');

const macTemplate = (app) => [
  {
    label: 'Back Up',
    click: function (event, focusedWindow, focusedWebContent) {
      if (focusedWindow.webContents.canGoBack()) {
        focusedWindow.webContents.goBack()
      }
    }
  },
  {
    label: 'Go Forward',
    click: function (event, focusedWindow, focusedWebContent) {
      if (focusedWindow.webContents.canGoForward()) {
        focusedWindow.webContents.goForward()
      }
    }
  },
  {
    label: 'Refresh',
    click: function (event, focusedWindow, focusedWebContent) {
      focusedWindow.webContents.reload()
    }
  }
];

// The selection menu
const selectionMenu = Menu.buildFromTemplate([
  { role: 'copy' },
  { type: 'separator' },
  { role: 'selectall' }
]);

// The input menu
const inputMenu = Menu.buildFromTemplate([
  { role: 'undo' },
  { role: 'redo' },
  { type: 'separator' },
  { role: 'cut' },
  { role: 'copy' },
  { role: 'paste' },
  { type: 'separator' },
  { role: 'selectall' }
]);

module.exports = {
  selectionMenu,
  inputMenu,
  macTemplate
};
