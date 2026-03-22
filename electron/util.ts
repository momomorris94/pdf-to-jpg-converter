import { app } from 'electron';
import path from 'path';

export const isDev = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const getPreloadPath = (): string => {
  return path.join(app.getAppPath(), 'dist-electron', 'preload.js');
};

export const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = isDev()
    ? path.join(__dirname, '../assets')
    : path.join(process.resourcesPath, 'assets');

  return path.join(RESOURCES_PATH, ...paths);
};
