import {
    setWallpaperOnMonitor,
    setWallpaperOnAllMonitors
} from './wallpaper_new';
import {
    addPhotoToMonitorsList
} from './win';
const os = require('os');
let wallpaper = require('wallpaper');

let setWallpaper = (photo, monitor = 'all') => {
    let photoPath = photo.photoPath;
    let monitorId = 'all';
    if (monitor != 'all') {
        var getDisplayInfo = require('electron').screen.getAllDisplays()[parseInt(monitor)];
        monitorId = getDisplayInfo.id;
    }

    return new Promise((resolve) => {
        const [majorVersion, minorVersion] = os.release().split('.');
        if (monitor == 'all') {

            if (majorVersion === '6' && minorVersion === '1') {
                //win7
                wallpaper.set(photoPath, {
                        scale: getSettingsOption('options.scale')
                    })
                    .then(() => {
                        resolve(photoPath);
                    })
                    .catch(error => {
                        console.log(error);
                        resolve(photoPath);
                    });
            } else {
                setWallpaperOnAllMonitors(photoPath)
                    .then(() => {
                        addPhotoToMonitorsList(monitorId, photo);
                        resolve(photoPath);
                    })
                    .catch(error => {
                        console.log(error);
                        resolve(photoPath);
                    });
            }
        } else {
            if (majorVersion === '6' && minorVersion === '1') {
                //win7
                wallpaper.set(photoPath, {
                        scale: getSettingsOption('options.scale')
                    })
                    .then(() => {
                        resolve(photoPath);
                    })
                    .catch(error => {
                        console.log(error);
                        resolve(photoPath);
                    });
            } else {
                setWallpaperOnMonitor(monitor, photoPath)
                    .then(() => {
                        addPhotoToMonitorsList(monitorId, photo);
                        resolve(photoPath);
                    })
                    .catch(error => {
                        console.log(error);
                        resolve(photoPath);
                    });
            }
        }
    })
}

let getOsWallpaperPath = () => {
    return wallpaper.get()
}

export {
    setWallpaper,
    getOsWallpaperPath
}