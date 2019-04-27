// eslint-disable-next-line
window.eval = global.eval = function () {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

const React = require('react')
const ReactDOM = require('react-dom')

const { remote, ipcRenderer } = require('electron')
const localize = require('../localize')
const moment = require('moment')
const App = require('./App')
const logger = require('../logger')
const State = require('./state')

const STATE_WRAPPER = {}

var state = State.load()
setupLocaleData(state.saved.locale)

const app = ReactDOM.render(
  <App STATE_WRAPPER={STATE_WRAPPER} />,
  document.querySelector('#root')
)

ipcRenderer.on('error', (e, ...args) => console.error(...args))

ipcRenderer.on('chooseLanguage', onChooseLanguage)

ipcRenderer.on('render', (e, state) => {
  STATE_WRAPPER.state = state
  app.setState(state)
})

logger.setLogHandler((...args) => ipcRenderer.send('handleLogMessage', ...args))

ipcRenderer.send('ipcReady')

function onChooseLanguage (e, locale) {
  setupLocaleData(locale)
  app.forceUpdate()
  ipcRenderer.send('chooseLanguage', locale)
}

function setupLocaleData (locale) {
  moment.locale(locale)
  window.localeData = ipcRenderer.sendSync('locale-data', locale)
  window.translate = localize.translate(window.localeData.messages)
}
