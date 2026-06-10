const { app, BrowserWindow } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('enable-fast-unload');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('js-flags', '--cache-opt');
app.commandLine.appendArgument('--no-sandbox');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 400,
    show: false,
    icon: path.join(__dirname, 'logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setTitle('قلم - السبورة البيضاء الذكية');
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'app.html'));

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
