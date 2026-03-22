"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetPath = exports.getPreloadPath = exports.isDev = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const isDev = () => {
    return process.env.NODE_ENV === 'development';
};
exports.isDev = isDev;
const getPreloadPath = () => {
    return path_1.default.join(electron_1.app.getAppPath(), 'dist-electron', 'preload.js');
};
exports.getPreloadPath = getPreloadPath;
const getAssetPath = (...paths) => {
    const RESOURCES_PATH = (0, exports.isDev)()
        ? path_1.default.join(__dirname, '../assets')
        : path_1.default.join(process.resourcesPath, 'assets');
    return path_1.default.join(RESOURCES_PATH, ...paths);
};
exports.getAssetPath = getAssetPath;
