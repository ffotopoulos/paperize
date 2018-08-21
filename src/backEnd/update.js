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
import {
    uaAppUpdated,
    uaSendError
} from './analytics';
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
        uaSendError(err);
        console.log(err);
    });
}

let getLatestVersion = () => {
    return new Promise((resolve, reject) => {
        axios.get("http://paperize.co/version.php")
            .then(response => {
                resolve(response.data);
            })
            .catch(err => {
                console.log(err);
                uaSendError(err);
                reject();
            });
    })

}

let checkForUpdates = (notifyManually) => {
    notifyManually = notifyManually || false
    getLatestVersion().then((data) => {
        console.log(`Latest version: ${data.version}`)
        if (data.version != app.getVersion()) {
            windowSendUpdateAvailability(true);
            if (firstTime || notifyManually) {
                firstTime = false;
                notifyUser("Update available!", data.msg, () => {
                    windowSendStartUpdate();
                })
            }
        } else {
            if (notifyManually) {
                notifyUser("You're cool.", "paperize is up to date");
            }
            windowSendUpdateAvailability(false);
        }
    }).catch((error) => {
        uaSendError("error @ update " + error);
        console.log("error @ update " + error);
        console.log('cant update');
    })
}

let downloadLatestVersion = () => {
    return new Promise((resolve, reject) => {
        let request = require('request');
        let progress = require('request-progress');

        if (process.platform == "win32") {
            getLatestVersion()
                .then((version) => {
                    progress(request(`http://paperize.co/download/paperize_setup_${version.version}.exe`), {

                        })
                        .on('progress', function (state) {
                            // The state is an object that looks like this:
                            // {
                            //     percent: 0.5,               // Overall percent (between 0 to 1)
                            //     speed: 554732,              // The download speed in bytes/sec
                            //     size: {
                            //         total: 90044871,        // The total payload size in bytes
                            //         transferred: 27610959   // The transferred payload size in bytes
                            //     },
                            //     time: {
                            //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
                            //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
                            //     }
                            // }
                            windowSendShowProgress(state);
                            console.log('progress', state);
                        })
                        .on('error', function (err) {
                            windowSendHideProgress();
                            console.log('error @ update download: ' + err)
                            uaSendError('error @ update download: ' + err)
                            reject();
                        })
                        .on('end', function () {
                            var st = {
                                percent: 1
                            }
                            windowSendShowProgress(st);
                            //to fix
                            //if i run it without delay it causes Error: spawn EBUSY
                            setTimeout(() => {
                                windowSendHideProgress();
                                resolve(installerFilePath);
                            }, 4000)
                        })
                        .pipe(require('fs').createWriteStream(installerFilePath));
                })
                .catch(err => {
                    windowSendHideProgress();
                    console.log('error @ update download: ' + err)
                    uaSendError('error @ update download: ' + err)
                    reject();
                })
        } else if (process.platform = "darwin") {
            reject(); //todo
        }
    })

}

let updateApp = () => {
    clearTimer();
    //windowSendToggleLoading("Downloading update");
    downloadLatestVersion().then((exeFilePath) => {
        uaAppUpdated();
        let child = require('child_process').execFile;
        child(exeFilePath, function (err, data) {
            if (err) {
                console.error(err);
                uaSendError("cant run update exe " + err);
                return;
            }
        });
    }).catch((err) => {
        console.log('cannot update:' + err);
        uaSendError('cannot update:' + err);
        // windowSendToggleLoading();
        notifyUser("Ooops...", "Can't update app at the moment. Maybe due to me not being able to afford a decent server :'(. Try again later or click on this bubble to download manually from http://paperize.co!",
            () => {
                require('electron').shell.openExternal('http://paperize.co')
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