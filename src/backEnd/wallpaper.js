import { uaSendError, uaUserChangedWallpaper } from './analytics';
import { getSettingsOption } from './settings';

let wallpaper = require('wallpaper');

let setWallpaper = (photoPath) => {
    return new Promise((resolve) => {
        wallpaper.set(photoPath, {
                scale: getSettingsOption('options.scale')
            })
            .then(() => {                
                resolve(photoPath);
            })
            .catch(error => {
                console.log(error);
                uaSendError("unable to set wallpaper:" + error);
                resolve(photoPath);
            });
    })
}

let getOsWallpaperPath = () => {
    return wallpaper.get()
}

export{
    setWallpaper,
    getOsWallpaperPath
}