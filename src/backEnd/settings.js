import {
    app
} from 'electron'
let settings = require('electron-settings');

let imageSources = [{
        name: 'pixabay',
        label: 'Pixabay',
        logoPath: '../renderer/assets/images/pixaBaylogo.png',
        refUrl: 'https://pixabay.com'
    },
    {
        name: 'unsplash',
        label: 'Unsplash',
        logoPath: '../renderer/assets/images/unsplash_logo.png',
        refUrl: 'https://unsplash.com'
    }
]

let getImageSources = () => {
    return imageSources;
}

let initSettings = () => {
    return new Promise((resolve) => {
        if (!settings.has('options') || !settings.has('options.interval') ||
            !settings.has('options.startOnLogin') || !settings.has('options.category') ||
            !settings.has('options.scale') || !settings.has('options.saveOnDownload') ||
            !settings.has('options.saveLocation') || !settings.has('options.deletePrevImage') ||
            !settings.has('options.clearTimer') || !settings.has('options.sources')) {
            settings.deleteAll();
            settings.set('options', {
                interval: 180000,
                startOnLogin: true,
                category: 'nature',
                scale: 'fit',
                saveOnDownload: false,
                saveLocation: app.getPath('pictures'),
                deletePrevImage: false,
                clearTimer: true,
                sources: imageSources.map(x => x.name)
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
    getAllSettings,
    getImageSources
}