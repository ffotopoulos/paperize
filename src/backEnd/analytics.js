let ua = require('universal-analytics');
let gaAccountId = 'UA-122487469-1';
let user;
let hostname = require('os').hostname();
let timer = null;
let initAnalytics = () => {
    user = ua(gaAccountId);
}

let uaUserStillActive = () => {
    timer = setTimeout(() => {
        user.event('User still active', `${hostname} is still active`).send();
    }, 120000)
}

let uaAppOpenned = () => {
    user.event('paperize', 'App openned. ' + hostname).send();
}

let uaAppInstalled = () => {
    user.event('paperize', 'App installed. ' + hostname).send();
}

let uaAppUpdated = () => {
    user.event('paperize', 'App Updated. ' + hostname).send();
}

let uaAppUninstalled = () => {
    user.event('paperize', 'App Uninstalled. ' + hostname).send();
}

let uaSendError = (err) => {
    user.exception(err + " . " + hostname).send();
}

let uaUserChangedWallpaper = () => {
    user.event('paperize', 'User changed wallpaper. ' + hostname).send();
}

let uaUserOppenedGallery = (category) => {
    user.event('paperize', 'User openned gallery->' + category).send();
}


export {
    uaUserStillActive,
    initAnalytics,
    uaSendError,
    uaAppOpenned,
    uaAppUpdated,
    uaAppUninstalled,
    uaAppInstalled,
    uaUserChangedWallpaper,
    uaUserOppenedGallery
}