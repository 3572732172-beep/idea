const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    backgroundColor: '#0b0b0b',
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.removeMenu();
  win.loadFile('index.html');

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
};

const setAutoLaunch = (enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: false
  });
};

app.whenReady().then(() => {
  setAutoLaunch(true);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('autostart:get', () => {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
});

ipcMain.handle('autostart:set', (_event, enabled) => {
  setAutoLaunch(Boolean(enabled));
  return app.getLoginItemSettings().openAtLogin;
});
