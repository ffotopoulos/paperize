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
let getInstallerFilePath = ()=>{
    return installerFilePath;
}

let setUpdateCheckTimer = () => {
    updateCheckTimer = setInterval(() => {
        checkForUpdates();
    }, 720000);
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

let checkForUpdates = () => {
    getLatestVersion().then((version) => {
        console.log(`Latest version: ${version}`)
        if (version != app.getVersion()) {
            windowSendUpdateAvailability(true);
            if (firstTime) {
                firstTime = false;
                notifyUser("Update available!", `A new super awesome paperize update (v${version}) is available! Click here to download and install`, () => {
                    windowSendStartUpdate();
                })
            }
        } else {
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
                    resolve(installerFilePath);
                })
                .on('error', () => {
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
        let child = require('child_process').execFile;
        child(exeFilePath, function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
        });
    }).catch(() => {
        console.log('cannot update');
    })
}
export {
    getInstallerFilePath,
    checkForUpdates,
    setUpdateCheckTimer,
    updateApp
}