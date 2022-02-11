import {
    app
} from 'electron';
import {
    notifyUser
} from './notify';
import {
    windowSendUpdateAvailability,
    windowSendToggleLoading,
    windowSendStartUpdate,
    windowSendShowProgress,
    windowSendHideProgress,
    showWindow
} from './win';
import {
    clearTimer
} from './timer';
import { getSettingsOption } from './settings';
let axios = require('axios');
let updateCheckTimer = null;
let installerFilePath = app.getPath('userData') + `\\paperize_setup.exe`;
let firstTime = true;
let getInstallerFilePath = () => {
    return installerFilePath;
}

let setUpdateCheckTimer = () => {
    clearUpdateTimer().then(() => {
        updateCheckTimer = setInterval(() => {
            checkForUpdates();
        }, 720000);
    }).catch(err => {        
        console.log(err);
    });
}

let getLatestVersion = () => {
    return new Promise((resolve, reject) => {
        axios.get("https://paperize.co/version.php")
            .then(response => {
                resolve(response.data);
            })
            .catch(err => {
                console.log(err);                
                reject();
            });
    })

}

let checkForUpdates = (notifyManually) => {
    notifyManually = notifyManually || false
    getLatestVersion().then((data) => {
        console.log(`Latest version: ${data.version}`)
        if (data.version != app.getVersion()) {   
            var autoUpdate = getSettingsOption("options.autoUpdate") ;
            windowSendUpdateAvailability(true,!autoUpdate)
            if(autoUpdate){
                notifyUser(`New update v${data.version}! `, "Latest update is being installed in the background. </br> Changes: " + data.msg);
                updateApp();
            }           
            else{
                if (firstTime || notifyManually) {
                    firstTime = false;
                    notifyUser("Update available!", data.msg, () => {
                        windowSendStartUpdate();
                    })
                }
            }           
        } else {
            if (notifyManually) {
                notifyUser("You're cool.", "paperize is up to date");
            }
            windowSendUpdateAvailability(false);
        }
    }).catch((error) => {        
        console.log("error @ update " + error);
        console.log('cant update');
    })
}

let downloadLatestVersion = () => {
    return new Promise((resolve, reject) => {
        let request = require('request');
        if (process.platform == "win32") {
            getLatestVersion()
                .then((version) => {                    
                    request(`http://paperize.co/download/paperize_setup_${version.version}.exe`)
                    .pipe(require('fs').createWriteStream(installerFilePath))
                    .on('close', () => {
                        console.log('done');
                        resolve(installerFilePath);                        
                    })
                    .on('error', function (err) {                        
                        console.log('error @ update download: ' + err)                        
                        reject();
                    });
                    
                })
                .catch(err => {                    
                    console.log('error @ update download: ' + err)                    
                    reject();
                })
        } else if (process.platform = "darwin") {
            reject(); //todo
        }
    })

}

let updateApp = () => {
    clearTimer();
    windowSendToggleLoading("DOWNLOADING UPDATE");
    downloadLatestVersion().then((exeFilePath) => {
        windowSendToggleLoading();
        let child = require('child_process').execFile;
        child(exeFilePath, function (err, data) {
            if (err) {
                console.error(err);                             
                return;
            }
        });
    }).catch((err) => {
        console.log('cannot update:' + err);        
        windowSendToggleLoading();
        notifyUser("Ooops...", "Can't update app at the moment. Maybe due to me not being able to afford a decent server :'(. Try again later or click on this bubble to download manually from paperize.co!",
            () => {
                require('electron').shell.openExternal('http://paperize.co/#download')
            })
    })
}

let clearUpdateTimer = () => {
    return new Promise((resolve) => {
        if (updateCheckTimer) {
            clearInterval(updateCheckTimer);
        }
        resolve();
    })

}

export {
    getInstallerFilePath,
    checkForUpdates,
    setUpdateCheckTimer,
    updateApp
}