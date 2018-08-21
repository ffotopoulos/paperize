import {
    app
} from 'electron'
import {
    getInstallerFilePath
} from './update';
import {
    uaAppInstalled,
    uaAppUpdated,
    uaAppUninstalled
} from './analytics';
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
           // uaAppUninstalled();
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