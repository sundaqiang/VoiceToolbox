import {app, BrowserWindow} from 'electron'
import './dialog'
import {Logger} from './logger'
import {initialize} from './services'
import {DisableContextMenu, DoNotEnableMultipleApp, FileProtocol, registerStore, setWin} from './custom'
import indexPreload from '/@preload/index'
import mainPreload from '/@preload/main'
import indexHtmlUrl from '/@renderer/index.html'
import logoUrl from '/@static/logo.png'

async function main() {
  const logger = new Logger()
  await logger.initialize(app.getPath('userData'))
  initialize(logger)
  app.whenReady().then(() => {
    setWin(createWindow())
    DoNotEnableMultipleApp()
    DisableContextMenu()
    FileProtocol()
    registerStore()
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 1282,
    minHeight: 722,
    width: 1282,
    height: 722,
    webPreferences: {
      preload: true ? indexPreload : mainPreload,
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: logoUrl,
    show: false,
    useContentSize: true,
    titleBarStyle: 'hidden',
    transparent: true
  })
  mainWindow.setMenu(null)
  mainWindow.loadURL(indexHtmlUrl).then(r => {
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  /*mainWindow.webContents.openDevTools({
    mode: 'detach'
  })*/
  return mainWindow
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
process.nextTick(main)
