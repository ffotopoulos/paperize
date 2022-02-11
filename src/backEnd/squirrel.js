import {
    app
} from 'electron'
import {
    getInstallerFilePath
} from './update';
let fs = require('fs');
let squirrelStartup = () => {
    if (require('electron-squirrel-startup')) {        
        app.quit();
    }
}

let handleSquirrelEvents = () => {
    if (process.platform !== 'win32') {
        return false;
    }
    var squirrelCommand = process.argv[1];
    switch (squirrelCommand) {
        case '--squirrel-install':            
        case '--squirrel-updated':            
            app.quit();
            return true;
        case '--squirrel-uninstall':           
            app.quit();
            return true;
        case '--squirrel-obsolete':
            app.quit();
            return true;
    }
}

export {
    squirrelStartup,
    handleSquirrelEvents
}