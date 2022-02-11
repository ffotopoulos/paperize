const {
    ipcMain
} = require('electron')
import {
    toggleWindow,
    toggleTheaterMode,
    closeWindow,
    windowSendToggleLoading,
    windowSendSettings,
    windowSendSettingsSaved,
    windowSendGalleryItems,
    windowSendWallpaperChanged,
    windowSendGalleryFunctionDone,
    windowSendWallpaperFit,
    windowSendDisplays,
    windowSendDisplaysForGallery,
    addPhotoToMonitorsList,
    getActiveDisplay
} from './win';
import {
    toggleAutoLaunch
} from './autolaunch';
import {
    changeWallpaper,
    setOnlineStatus
} from './timer';
import {
    saveSettings,
    getSettingsOption
} from './settings';
import {
    loadGallery,
    downloadGalleryItem
} from './gallery';
import {
    getPhotoPath,
    downloadAndSave,
    copyFile
} from './files';
import {
    setWallpaper
} from './wallpaper';
import {
    updateApp
} from './update';
import {
    getHistoryItems
} from './history';
import {
    getMonitors,
    getWallpaperFit,
    setWallpaperFit
} from './wallpaper_new';
import {
    get
} from 'wallpaper/lib/macos';

let events = () => {
    ipcMain.on('minimize-app', () => {
        toggleWindow();
    });

    ipcMain.on('toggleTheater', () => {
        toggleTheaterMode();
    });

    ipcMain.on('exit-app', () => {
        closeWindow();
    });

    ipcMain.on('next', () => {
        changeWallpaper(true);
    })

    ipcMain.on('randomize', () => {
        changeWallpaper(true, true).then(() => {
            if (getSettingsOption("options.clearTimer")) {
                saveSettings('interval', 0);
            }
        }).catch((err) => {
            console.log(err);
        });
    })


    ipcMain.on('history', () => {
        windowSendToggleLoading();
        var items = getHistoryItems();
        try {
            windowSendGalleryItems(items, true)
            windowSendToggleLoading();
        } catch (err) {
            windowSendToggleLoading();
        }
    })
    ipcMain.on('getGalleryItems', async (event, arg) => {
        windowSendToggleLoading();
        var items = []
        try {
            items = await loadGallery(arg.count, arg.category)
            windowSendToggleLoading();
            windowSendGalleryItems(items)
        } catch (err) {
            windowSendToggleLoading();
        }

    })

    ipcMain.on('setGalleryItemAsBackground', (event, arg) => {
        var photoPath = getPhotoPath();
        var monitorId = 'all';
        if (arg.monitor != 'all') {
            var getDisplayInfo = require('electron').screen.getAllDisplays()[parseInt(arg.monitor)];
            monitorId = getDisplayInfo.id;            
        }
        windowSendToggleLoading();
        downloadAndSave(arg.url, photoPath, () => {
            var photo = {
                photoPath: photoPath,
                userName: arg.userName,
                userUrl: arg.userUrl,
                apiLogoName: arg.apiLogoName,
                apiRefUrl: arg.apiRefUrl
            }
            setWallpaper(photo, arg.monitor)
                .then(() => {                   
                    windowSendToggleLoading();                    
                    if(monitorId == 'all' || monitorId == getActiveDisplay().id){
                        windowSendWallpaperChanged(photo);
                    }                    
                    if (getSettingsOption("options.clearTimer")) {
                        saveSettings('interval', 0);
                    }
                })
                .catch((err) => {
                    windowSendToggleLoading();
                })
        });
    })
    ipcMain.on('downloadGalleryItem', (event, arg) => {
        windowSendToggleLoading();
        downloadGalleryItem(arg.url, arg.saveDir).then(() => {
            windowSendGalleryFunctionDone();
            windowSendToggleLoading();
        });
    })

    ipcMain.on('downloadCurrentWallpaper', (event, arg) => {
        windowSendToggleLoading();
        copyFile(getPhotoPath(), arg, function () {
            setTimeout(() => {
                windowSendToggleLoading();
            }, 2000)

        })
    })


    ipcMain.on('loadSettings', (event, arg) => {
        windowSendSettings();
    })

    ipcMain.on('getWallpaperFit', (event, arg) => {
        getWallpaperFit()
            .then(fit => {
                windowSendWallpaperFit(fit);
            });
    })

    ipcMain.on('setWallpaperFit', (event, arg) => {
        setWallpaperFit(arg);
    })

    ipcMain.on('getDisplays', () => {
        getMonitors()
            .then(monitors => {
                var selectedMonitors = getSettingsOption("options.selectedMonitors");
                var value = {
                    allMonitors:monitors,
                    selectedMonitors: selectedMonitors
                }
                windowSendDisplays(value);
            })
    })

    ipcMain.on('getDisplaysForGallery', () => {
        getMonitors()
            .then(monitors => {
                windowSendDisplaysForGallery(monitors);
            })
    })


    ipcMain.on('saveSettings', (event, arg) => {
        saveSettings(arg.option, arg.value).then(() => {
            windowSendSettingsSaved();
            if (arg.option == 'startOnLogin') {
                toggleAutoLaunch(arg.value);
            }
        });
    });

    ipcMain.on('online-status', (event, isOnline) => {
        setOnlineStatus(isOnline);
    })

    ipcMain.on('updateApp', () => {
        updateApp();
    })

}

export {
    events
}