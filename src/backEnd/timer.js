import {ipcMain} from 'electron';
import {windowSendToggleLoading,windowSendWallpaperChanged} from './win';
import {getImageAndSetWallpaper} from './unsplash';
import {getSettingsOption} from './settings';
let tmr = null;
let hasInternet = true;

let setOnlineStatus = (isOnline)=>{
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
    return new Promise((resolve)=>{
        force = force || false;
        isRandom = isRandom || false;
        setTimer();
        if(hasInternet){
            if (getSettingsOption('options.interval') >= 60000 || force) {
                windowSendToggleLoading();
                getImageAndSetWallpaper(isRandom).then((photo) => {
                    windowSendToggleLoading();
                    windowSendWallpaperChanged(photo);
                });
            }
        }
        else{
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
}