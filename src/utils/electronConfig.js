import { ipcRenderer } from 'electron'

export function readConfig (name) {
  return ipcRenderer.sendSync('config:get', name)
}
