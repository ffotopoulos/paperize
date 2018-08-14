import {
    windowSendToggleLoading,
    windowSendWallpaperChanged
} from './win';
import {
    getSettingsOption
} from './settings';
import {
    notifyUser
} from './notify';
import {
    downloadAndSetWallpaper
} from './imageApisController';
let tmr = null;
let hasInternet = true;
let manualChangesLeft = 10;
let manualChangesResetter;
let initManualChangesLeft = () => {
    manualChangesResetter = setInterval(() => {
        manualChangesLeft = 10;
    }, 180000)
}

let setOnlineStatus = (isOnline) => {
    console.log('setting online status to ' + isOnline)
    hasInternet = isOnline;
}

let setTimer = () => {
    clearTimer().then(() => {
        var interval = getSettingsOption('options.interval');
        console.log('interval is : ' + interval);
        tmr = setTimeout(() => {
            changeWallpaper();
        }, interval > 0 ? interval : 10000);
    })
}

let changeWallpaper = (force, isRandom) => {
    return new Promise((resolve) => {
        force = force || false;
        isRandom = isRandom || false;
        setTimer();
        if (hasInternet) {
            if (force) {
                manualChangesLeft--;
                if (manualChangesLeft <= 0) {
                    notifyUser("Woaaah! Aren't you a tough person to impress.", "You can change your wallpaper manually only 10 times every 3 minutes :( Try again later!")
                    return;
                }
            }
            if (getSettingsOption('options.interval') >= 60000 || force) {
                windowSendToggleLoading();
                downloadAndSetWallpaper(isRandom).then((photo) => {
                    windowSendToggleLoading();
                    windowSendWallpaperChanged(photo);
                })
            } else if (force && manualChangesLeft == 0) {

            }
        } else {
            console.log('no interwebzz')
        }
        resolve();
    })

}

let clearTimer = () => {
    return new Promise((resolve) => {
        if (tmr) {
            clearTimeout(tmr);
            console.log('timer cleared');
        }
        resolve();
    })
}

export {
    changeWallpaper,
    setTimer,
    clearTimer,
    setOnlineStatus,
    initManualChangesLeft
}