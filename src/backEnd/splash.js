import {BrowserWindow} from 'electron';
let path = require('path');
let url = require('url');
let splashWindow = null;

let createSplashScreenWindow = () => {
    console.log('hihihi')
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        show: false,
        frame: false,
        radii: [5, 5, 5, 5]
    });
    splashWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../renderer/splash.html'),
        protocol: 'file:',
        slashes: true
    }))
    splashWindow.on('closed', () => splashWindow = null);
    splashWindow.webContents.on('did-finish-load', () => {        
        splashWindow.show();
    });
}

let closeSplashWindow = () => {
    if (splashWindow)
        splashWindow.close();
}

export  {
    closeSplashWindow,
    createSplashScreenWindow
}