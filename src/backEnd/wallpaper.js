import { uaSendError, uaUserChangedWallpaper } from './analytics';

let wallpaper = require('wallpaper');

let setWallpaper = (photoPath) => {
    return new Promise((resolve) => {
        wallpaper.set(photoPath, {
                scale: 'stretch'
            })
            .then(() => {
                uaUserChangedWallpaper();
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