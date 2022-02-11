import {
    app,
    BrowserWindow,
    screen
} from 'electron';
import {
    closeSplashWindow
} from './splash';
import {
    getAllSettings,
    getSettingsOption,
    getImageSources,
    getCategories
} from './settings';
import {
    getPhotoPath,
    photoExists
} from './files';
import {
    setTimer,
    changeWallpaper
} from './timer';
import {
    getOsWallpaperPath
} from './wallpaper';
import {
    setUpdateCheckTimer,
    checkForUpdates
} from './update';
import {
    showDadJoke
} from './dailyJoke';
import {
    getMonitors
} from './wallpaper_new';
let path = require('path');
let url = require('url');
let mainWindow = null;
let activeScreen = null;
let monitorsAndWallpapers = [];
let createWindow = (c) => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 630,
        frame: false,
        show: false,
        resizable: false,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, './icons/app-icon.ico'),
        radii: [5, 5, 5, 5]
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../renderer/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.webContents.on('did-finish-load', () => {
        //initialize playback ui (play pause)
        let ms = getSettingsOption('options.interval')
        windowSendTogglePlayback(ms, ms > 0 ? true : false);
        activeScreen = getActiveDisplay();
        //if os wallpaper is equal to this.photoPath and file exists
        //set app's bg image to photoPath and then start the interval
        //else get a new image and then start interval
        getOsWallpaperPath().then(imagePath => {
            console.log(imagePath)
            if (photoExists() && imagePath == getPhotoPath()) {
                //no photoCredits @ first launch
                var photo = {
                    photoPath: imagePath
                }
                windowSendWallpaperChanged(photo);
                setTimer();
            } else {
                changeWallpaper(true);
            }
        });

        //hide splash screen
        closeSplashWindow();

        //append image sources list 
        initImageSources();

        //append Categories
        initCategories();

        //append Displays
        initDisplays();

        //if auto launch is enabled hide the main window
        var startMinimized = (process.argv || []).indexOf('--hidden') !== -1;
        if (startMinimized == true) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }

        //check for updates
        checkForUpdates();
        setUpdateCheckTimer();
        if (getSettingsOption("options.showDadJoke"))
            showDadJoke();
    });

    mainWindow.on('show', function () {
        activeScreen = getActiveDisplay();
    })

    mainWindow.on('move', function () {
        let whichScreen = getActiveDisplay();
        if (activeScreen != null && whichScreen.id != activeScreen.id) {
            setCorrectImageAsBackground();
            activeScreen = whichScreen;
        }

    })

    // when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

let setCorrectImageAsBackground = () => {
    let whichScreen = getActiveDisplay();   
    let monitorInfo = monitorsAndWallpapers.filter(x => x.monitorId == whichScreen.id)[0];
    if (monitorInfo != null) {
        console.log(monitorInfo.photo.photoPath)
        if (require('fs').existsSync(monitorInfo.photo.photoPath)) {
            windowSendWallpaperChanged(monitorInfo.photo);
        }
    }

}

let getActiveDisplay = () => {
    let winBounds = mainWindow.getBounds();
    let whichScreen = screen.getDisplayNearestPoint({
        x: winBounds.x,
        y: winBounds.y
    });
    return whichScreen;
}

let closeWindow = () => {
    if (mainWindow)
        mainWindow.close();
}

let windowCreated = () => {
    return (mainWindow != null);
}


let toggleWindow = () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
}

let toggleTheaterMode = () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
}

let showWindow = () => {
    mainWindow.show();
}

let singleInstance = () => {
    let quit = app.makeSingleInstance(() => {
        if (windowCreated()) {
            toggleWindow()
        }
    })
    if (quit) {
        app.quit()
    }
}

let addPhotoToMonitorsList = (monitorId, photo) => {
    if (monitorsAndWallpapers != null && monitorId != 'all') {
        monitorsAndWallpapers = monitorsAndWallpapers.filter(x => x.monitorId != monitorId);
    }
    if (monitorId == 'all') {
        monitorsAndWallpapers = [];
        var fileName = path.basename(photo.photoPath, path.extname(photo.photoPath))
        var newFile = photo.photoPath.replace(fileName, fileName + `_all`);
        require('fs').copyFileSync(photo.photoPath, newFile);
        photo.photoPath = newFile;
        screen.getAllDisplays().forEach(sc => {
            monitorsAndWallpapers.push({
                monitorId: sc.id,
                photo: photo
            })
        })
    } else {
        var fileName = path.basename(photo.photoPath, path.extname(photo.photoPath))
        var newFile = photo.photoPath.replace(fileName, fileName + `_${monitorId}`);
        require('fs').copyFileSync(photo.photoPath, newFile);
        photo.photoPath = newFile;
        monitorsAndWallpapers.push({
            monitorId: monitorId,
            photo: photo
        });
    }
    console.log(monitorsAndWallpapers);
}

let windowSendTogglePlayback = (ms, res) => {
    mainWindow.webContents.send('togglePlayback', {
        ms: ms,
        res: res
    });
}

let windowSendSettingsSaved = () => {
    mainWindow.webContents.send('settingsSaved');
}

let windowSendSettings = () => {
    mainWindow.webContents.send("loadSettings", getAllSettings());
}

let windowSendToggleLoading = (message) => {
    message = message || " "
    mainWindow.webContents.send('toggleLoading', message);
}

let windowSendWallpaperChanged = (photo) => {
    mainWindow.webContents.send('wallpaper-changed', photo);
}

let windowSendGalleryItems = (items, showAsHistory = false) => {
    mainWindow.webContents.send('loadGallery', items, showAsHistory)
}

let windowSendWallpaperFit = (fit) => {
    mainWindow.webContents.send('getWallpaperFit', fit);
}

let windowSendGalleryFunctionDone = () => {
    mainWindow.webContents.send('galleryFunctionDone');
}

let windowSendUpdateAvailability = (available, showPopUp = true) => {
    mainWindow.webContents.send('updateAvailability', available, showPopUp)
}

let windowSendDisplays = (monitors) => {
    mainWindow.webContents.send('getDisplays', monitors);
};

let windowSendDisplaysForGallery = (monitors) => {
    mainWindow.webContents.send('getDisplaysForGallery', monitors);
};

let windowSendStartUpdate = () => {
    mainWindow.webContents.send('startUpdate')
}
let windowSendShowProgress = (state) => {
    mainWindow.webContents.send('showProgress', state)
}

let windowSendHideProgress = () => {
    mainWindow.webContents.send('hideProgress')
}

let initDisplays = () => {
    getMonitors()
        .then(monitors => {
            mainWindow.send('initDisplays', monitors)
        })
}

let initImageSources = () => {
    mainWindow.webContents.send('initImageSources', getImageSources())
}

let initCategories = () => {
    mainWindow.webContents.send('initCategories', getCategories());
}

export {
    closeWindow,
    createWindow,
    toggleWindow,
    toggleTheaterMode,
    singleInstance,
    windowSendTogglePlayback,
    windowSendSettingsSaved,
    windowSendSettings,
    windowSendToggleLoading,
    windowSendWallpaperChanged,
    windowSendGalleryItems,
    windowSendGalleryFunctionDone,
    windowSendUpdateAvailability,
    windowSendStartUpdate,
    windowSendShowProgress,
    windowSendHideProgress,
    windowSendWallpaperFit,
    windowSendDisplays,
    windowSendDisplaysForGallery,
    showWindow,
    addPhotoToMonitorsList,
    getActiveDisplay,
    setCorrectImageAsBackground
}