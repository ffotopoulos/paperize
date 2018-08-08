let ua = require('universal-analytics');
let gaAccountId = 'UA-122487469-1';
let user;
let hostname = require('os').hostname();
let initAnalytics = () => {
    user = ua(gaAccountId);
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
    user.event("Error", err + " . " + hostname).send();
}

let uaUserChangedWallpaper = () => {
    user.event('paperize', 'User changed wallpaper. ' + hostname).send();
}

let uaUserOppenedGallery = (category) => {
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