/**
 * Preload script — safely exposes Electron APIs to the renderer
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  backupNow:    ()  => ipcRenderer.invoke('app:backup-now'),
  openDataDir:  ()  => ipcRenderer.invoke('app:open-data'),
  getVersion:   ()  => ipcRenderer.invoke('app:version'),
  getDataDir:   ()  => ipcRenderer.invoke('app:data-dir'),
  isElectron:   true,
});
