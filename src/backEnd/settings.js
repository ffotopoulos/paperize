import { app } from 'electron'
let settings = require('electron-settings');
let initSettings = () => {
    return new Promise((resolve) => {
        if (!settings.has('options') || !settings.has('options.interval') ||
            !settings.has('options.startOnLogin') || !settings.has('options.category') ||
            !settings.has('options.scale') || !settings.has('options.saveOnDownload') ||
            !settings.has('options.saveLocation') || !settings.has('options.deletePrevImage') ||
            !settings.has('options.clearTimer')) {
            settings.deleteAll();
            settings.set('options', {
                interval: 180000,
                startOnLogin: true,
                category: 'nature',
                scale: ['taki'],
                saveOnDownload: false,
                saveLocation: app.getPath('pictures'),
                deletePrevImage: false,
                clearTimer:true,
            });
        }
        resolve();
    })
}

let saveSettings = (opt, val) => {
    return new Promise((resolve) => {
        if (opt == "interval") {
            val = parseInt(val);
            if (val == 0) {
                require('./timer').clearTimer();
            } else {
                require('./timer').setTimer();
            }
            require('./win').windowSendTogglePlayback(val, val > 0 ? true : false);
        }
        settings.set(`options.${opt}`, val);
        resolve();
    })
}

let getSettingsOption = (opt) => {
    return settings.get(opt);
}

let getAllSettings = () => {
    return settings.getAll();
}

export {
    initSettings,
    saveSettings,
    getSettingsOption,
    getAllSettings
}