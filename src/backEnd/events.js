import { ipcMain } from 'electron';
import {
    toggleWindow,
    closeWindow,
    windowSendToggleLoading,
    windowSendSettings,
    windowSendSettingsSaved,
    windowSendGalleryItems,
    windowSendWallpaperChanged,
    windowSendGalleryFunctionDone
} from './win';
import { toggleAutoLaunch } from './autolaunch';
import { changeWallpaper, setOnlineStatus } from './timer';
import { saveSettings, getSettingsOption } from './settings';
import { loadGallery, downloadGalleryItem } from './gallery';
import { downloadAndSave } from './unsplash';
import { getPhotoPath } from './files';
import { setWallpaper } from './wallpaper';
import { updateApp } from './update';
import { uaSendError } from './analytics';

let events = () => {
    ipcMain.on('minimize-app', () => {
        toggleWindow();
    });

    ipcMain.on('exit-app', () => {
        closeWindow();
    });

    ipcMain.on('next', () => {
        changeWallpaper(true);
    })

    ipcMain.on('randomize', () => {
        changeWallpaper(true, true).then(() => {
            if(getSettingsOption("options.clearTimer")){
                saveSettings('interval', 0);
            } 
        }).catch((err) => {
            uaSendError(err);
            console.log(err);
        });
    })

    ipcMain.on('getGalleryItems', (event, arg) => {
        windowSendToggleLoading();
        loadGallery(arg.count, arg.category).then((items) => {
            windowSendToggleLoading();
            windowSendGalleryItems(items)
        });
    })

    ipcMain.on('setGalleryItemAsBackground', (event, arg) => {
        var photoPath = getPhotoPath();
        windowSendToggleLoading();
        downloadAndSave(arg.url, photoPath, getSettingsOption('options.saveOnDownload'), () => {
            setWallpaper(getPhotoPath()).then(() => {
                var photo = {
                    photoPath: photoPath,
                    userName: arg.userName,
                    userUrl: arg.userUrl,
                }
                windowSendToggleLoading();
                windowSendWallpaperChanged(photo);
                if(getSettingsOption("options.clearTimer")){
                    saveSettings('interval', 0);
                } 
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

    ipcMain.on('loadSettings', (event, arg) => {
        windowSendSettings();
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

    ipcMain.on('updateApp',()=>{
        updateApp();
    })

}

export {
    events
}