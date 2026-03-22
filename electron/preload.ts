import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  appVersion: () => ipcRenderer.invoke('app-version'),
});
