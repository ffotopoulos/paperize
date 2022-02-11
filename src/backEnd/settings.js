import {
    app
} from 'electron'
import {
    ENETUNREACH
} from 'constants';
import {
    getFit,
    getMonitors,
    getWallpaperFit,
    setWallpaperFit
} from './wallpaper_new';
let settings = require('electron-settings');


let imageSources = [{
        name: 'unsplash',
        label: 'Unsplash',
        logoPath: '../renderer/assets/images/unsplash_logo.png',
        refUrl: 'https://unsplash.com'
    },
    {
        name: 'pixabay',
        label: 'Pixabay',
        logoPath: '../renderer/assets/images/pixaBaylogo.png',
        refUrl: 'https://pixabay.com'
    },
    {
        name: 'pexels',
        label: 'Pexels',
        logoPath: '../renderer/assets/images/pexels_logo.png',
        refUrl: 'https://www.pexels.com/'
    },
    // {
    //     name: 'flickr',
    //     label: 'Flickr',
    //     logoPath: '../renderer/assets/images/flickr_logo.png',
    //     refUrl: 'https://flickr.com'
    // },
    {
        name: 'localLibrary',
        label: 'Local Library',
        logoPath: '../renderer/assets/images/localLibrary_icon.png',
        refUrl: 'localLibrary'
    },

]

let categories = [{
        name: 'random',
        label: 'Random'
    },
    {
        name: 'landscapes',
        label: 'Landscapes'
    },
    {
        name: 'abstract',
        label: 'Abstract'
    },
    {
        name: 'nature',
        label: 'Nature'
    },
    {
        name: 'people',
        label: 'People'
    },
    {
        name: 'supercars',
        label: 'Super Cars'
    },
    {
        name: 'art',
        label: 'Art'
    },
    {
        name: 'animals',
        label: 'Animals'
    },
    {
        name: 'food',
        label: 'Food'
    },
    {
        name: 'technology',
        label: 'Technology'
    },
]


let defaultSettings;

let getImageSources = () => {
    return imageSources;
}

let getCategories = () => {
    return categories;
}

let wallpaperFit = [{
        value: '0',
        label: 'Center'
    },
    {
        value: '1',
        label: 'Tile'
    },
    {
        value: '2',
        label: 'Stretch'
    },
    {
        value: '3',
        label: 'Fit'
    },
    {
        value: '4',
        label: 'Fill'
    },
    {
        value: '5',
        label: 'Span'
    },
]

let initSettings = () => {
    return new Promise((resolve) => {
        getMonitors()
            .then(monitors =>{
                var monitorIndexes = [];
                monitors.forEach(element => {
                    monitorIndexes.push(element.index)
                });
                defaultSettings = {
                    selectedMonitors: monitorIndexes,
                    wallpaperFit: 2,
                    interval: 180000,
                    startOnLogin: true,
                    category: categories.filter(x => x.name == 'landscapes').map(x => x.name),
                    scale: 'strech',
                    saveOnDownload: false,
                    saveLocation: app.getPath('desktop'),
                    deletePrevImage: false,
                    clearTimer: true,
                    sources: imageSources.filter(x => x.name != 'localLibrary').map(x => x.name),
                    localLibraryLocation: '',
                    showDadJoke: true,
                    autoUpdate: true,
                    manualChanges: 8,                   
                }
                var category = settings.get('options.category');
                for (var option in defaultSettings) {
                    if (!settings.has(`options.${option}`) || (option == 'category' && typeof (category) == "string")) {
                        settings.set(`options.${option}`, defaultSettings[option])
                    }
                }
                resolve();
            })       
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
        } else if (opt == "wallpaperFit") {
            setWallpaperFit(val);
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
    getImageSources,
    getCategories
}