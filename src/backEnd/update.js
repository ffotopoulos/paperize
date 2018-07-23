import {
    app
} from 'electron';
import {
    notifyUser
} from './notify';
import {
    windowSendUpdateAvailability,
    windowSendToggleLoading,
    windowSendStartUpdate
} from './win';
import {
    clearTimer
} from './timer';
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
    }).catch(error => {
        console.log(error);        
    });
}

let getLatestVersion = () => {
    return new Promise((resolve, reject) => {
        axios.get("http://paperize.co/version.php")
            .then(response => {
                resolve(response.data.version);
            })
            .catch(error => {
                console.log(error);
                reject();
            });
    })

}

let checkForUpdates = (notifyManually) => {
    notifyManually = notifyManually || false
    getLatestVersion().then((version) => {
        console.log(`Latest version: ${version}`)
        if (version != app.getVersion()) {
            windowSendUpdateAvailability(true);
            if (firstTime || notifyManually) {
                firstTime = false;
                notifyUser("Update available!", `A new super awesome paperize update (v${version}) is available! Click here to download and install`, () => {
                    windowSendStartUpdate();
                })
            }
        } else {
            if(notifyManually){
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
            request('http://paperize.co/download/paperize_setup.exe')
                .pipe(require('fs').createWriteStream(installerFilePath))
                .on('close', () => {
                    console.log('done');
                    resolve(installerFilePath);
                })
                .on('error', (error) => {                   
                    reject();
                });
        } else if (process.platform = "darwin") {
            reject(); //todo
        }
    })

}

let updateApp = () => {
    clearTimer();
    windowSendToggleLoading("UPDATING");
    downloadLatestVersion().then((exeFilePath) => {
        console.log('hi');
        let child = require('child_process').execFile;
        child(exeFilePath, function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
        });
    }).catch(() => {
        console.log('cannot update');
        windowSendToggleLoading();
        notifyUser("Ooops...","Can't update app at the moment. Maybe due to traffic limitations. Try again later!")
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