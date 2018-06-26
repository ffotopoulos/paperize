let wallpaper = require('wallpaper');

let setWallpaper = (photoPath) => {
    return new Promise((resolve) => {
        wallpaper.set(photoPath, {
                scale: 'stretch'
            })
            .then(() => {
                resolve(photoPath);
            })
            .catch(error => {
                console.log(error);
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