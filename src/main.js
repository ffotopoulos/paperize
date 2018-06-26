import { app } from 'electron'
import { bypassLocalChecker } from './backEnd/files';
import { createSplashScreenWindow } from './backEnd/splash';
import { createWindow, singleInstance } from './backEnd/win';
import { initSettings, getSettingsOption } from './backEnd/settings';
import { initTray } from './backEnd/tray';
import { initAutoLaunch, toggleAutoLaunch } from './backEnd/autolaunch';
import { events } from './backEnd/events';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}
singleInstance();
bypassLocalChecker();

let startApplication = () => {
    initSettings();
    initAutoLaunch();
    toggleAutoLaunch(getSettingsOption('options.startOnLogin'));
    createSplashScreenWindow();
    createWindow();
    initTray();
    events();
}

let quitApplication = () => {
    app.quit();
}
app.on('ready', () => {
    startApplication();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        quitApplication();
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})