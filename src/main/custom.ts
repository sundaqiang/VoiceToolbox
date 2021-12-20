import {app, BrowserWindow, ipcMain, protocol} from "electron"
import slash from "slash"
import {resolve} from "path"

const Store = require('electron-store')
let Win: BrowserWindow
export {Win}

export const store = new Store()

export function setWin(value: BrowserWindow) {
  Win = value
}

export function DoNotEnableMultipleApp() {
  //Do not enable multiple applications
  if (!app.requestSingleInstanceLock()) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
      if (Win) {
        if (!Win.isVisible()) Win.show(), Win.setSkipTaskbar(false)
        if (Win.isMinimized()) Win.restore()
        Win.focus()
      }
    })
  }
}

export function DisableContextMenu() {
  //Disable the right-click context menu
  Win.hookWindowMessage(278, () => {
    Win.setEnabled(false)
    setTimeout(() => {
      Win.setEnabled(true)
    }, 100)
  })
}

export function FileProtocol() {
  //注册FileProtocol
  protocol.registerFileProtocol('atom', (request, callback) => {
    const url = decodeURI(request.url.substring(7))
    slash(decodeURI(url))
    let path
    if (url.indexOf(':') === -1) {
      path = resolve(__dirname, '.', '../' + url)
    } else {
      path = url
    }
    const i = path.indexOf('?')
    if (i > -1) {
      path = path.substring(0, i)
    }
    callback({path: path})
  })
}

export function registerStore() {
  //注册ipcMain to store
  ipcMain.on('store', (event, arg) => {
    let data
    if (arg['mode'] === 0) {
      data = store.get(arg['key']) || null
      event.returnValue = {
        return_code: 0,
        return_msg: data
      }
    } else {
      store.set(arg['key'], arg['value'])
      event.reply('callback', arg)
      event.returnValue = {
        return_code: 0,
      }
    }
  })
  ipcMain.on('windows', (event, arg) => {
    switch (arg.mode) {
      case 'min':
        Win.minimize()
        break
      case 'max':
        Win.isMaximized() ? Win.unmaximize() : Win.maximize()
        break
      case 'close':
        Win.close()
        break
    }
  })
}
