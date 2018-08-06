let ua = require('universal-analytics');
let gaAccountId = 'UA-122487469-1';
let user;

let initAnalytics = () => {
    user = ua(gaAccountId);
}

let uaAppOpenned = () => {
    user.event('paperize', 'App openned').send();
}

let uaAppInstalled = () => {
    user.event('paperize', 'App installed').send();
}

let uaAppUpdated = () => {
    return new Promise((resolve) => {
        user.event('paperize', 'App Updated').send();
        resolve();
    })
}

let uaAppUninstalled = () => {
    user.event('paperize', 'App Uninstalled').send();
}

let uaSendError = (err) => {
    user.event('Error :(', err).send();
}

let uaUserChangedWallpaper = () => {
    user.event('paperize', 'User changed wallpaper').send();
}

let uaUserOppenedGallery = (category) =>{
    user.event('paperize', 'User openned gallery->' + category).send();
}

export {
    initAnalytics,
    uaSendError,
    uaAppOpenned,
    uaAppUpdated,
    uaAppUninstalled,
    uaAppInstalled,
    uaUserChangedWallpaper,
    uaUserOppenedGallery
}