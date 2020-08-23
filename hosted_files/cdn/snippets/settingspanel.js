import sketch from 'sketch'

const BrowserWindow2 = require('sketch-module-web-view')
var Settings = require('sketch/settings')
const DEFAULT_SETTINGS_KEY = 'default-settings'
const DEFAULT_SETTINGS = {
  padding_ratio : '0.2'
}
const SETTINGS_IN_JSON = true
const DEFAULT_URL = './settingsui.html'
var win = null

export function openSettingsWindow(width=460, height=320) {
  var url = DEFAULT_URL
  win = new BrowserWindow2({ width: width, height: height })
  win.on('closed', () => {
    win = null
  })
  win.loadURL(require(`./settingsui.html`))
  //
  // METHODS TO ACCEPT RESPONSE FROM WEBVIEW
  //

  win.webContents.on('nativeLog', function(s) {
    console.log(s)
  })

  win.webContents.on('applySettings', function(settings) {
    if(SETTINGS_IN_JSON) {
      settings = JSON.parse(settings)
    }
    Settings.setSettingForKey(DEFAULT_SETTINGS_KEY, settings)
    console.log('Settings Applied!')
    console.log(settings)
    win.close()
  })

  win.webContents.on('cancel', function(settings) {
    console.log('Cancel Changes!')
    win.close()
  })

  //load settings on webview
  var settings = Settings.settingForKey(DEFAULT_SETTINGS_KEY)
  if(!settings) {
    settings = DEFAULT_SETTINGS
    Settings.setSettingForKey(DEFAULT_SETTINGS_KEY, DEFAULT_SETTINGS)
  }
  executeFunctionOnWebview('loadSettings', settings, SETTINGS_IN_JSON)

  return win
}

export function registerFunctionWithWindow(window, functionName, myfunction) {
  /***
    function should accept only one parameter
    if the registered functionName is testFunction, then
    the registered function can be called from the html file like this:
    window.postMessage('testFunction', `some string data`)
  ***/
  window.webContents.on(functionName, myfunction)
}

export function executeFunctionOnWebview(functionName, parameter, parameterIsJson=false) {
  var parameterString = parameter
  if(parameterIsJson) {
    parameterString = JSON.stringify(parameter)
  }
  var jsScript = `dummyFunction('jsfunction_${functionName}', ${parameterString})`
  executeScript(win, jsScript)
}

function executeScript(win, script) {
  win.webContents.executeJavaScript(script).then(res => {
    console.log(res)
  })
}
