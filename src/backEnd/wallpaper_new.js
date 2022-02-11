let settings = require('electron-settings');
const {
    promisify
} = require('util');
const path = require('path');
const childProcess = require('child_process');

const execFile = promisify(childProcess.execFile);
const binary = path.join(__dirname, 'paperize-wallpaper.exe');

const setWallpaperOnAllMonitors = imagePath => {
    
    return new Promise(async (resolve, reject) => {
        await execFile(binary, [path.resolve(imagePath)], function (error, stdout, stderr) {
            if (error) {
                reject();
            }
            resolve(imagePath);
        })
    });
}

const setWallpaperOnMonitor = (monitorId, imagePath) => {
    console.log('MONITOR = ' + monitorId);
    return new Promise(async (resolve, reject) => {

        await execFile(binary, [monitorId, path.resolve(imagePath)], function (error, stdout, stderr) {
            if (error) {
                reject();
            }
            resolve(imagePath);
        })
    });
};

const setWallpaperFit = (fit) => {
    return new Promise(async (resolve, reject) => {

        await execFile(binary, ["--fit", fit], function (error, stdout, stderr) {
            if (error) {
                reject();
            }
            settings.set('options.wallpaperFit', fit)
            resolve();
        })
    });
}

const getWallpaperFit = () => {
    return new Promise(async (resolve, reject) => {
        await execFile(binary, ["--fit"], function (error, stdout, stderr) {
            if (error) {
                reject();
            }
            settings.set('options.wallpaperFit', stdout)
            resolve(stdout);
        })
    });
}

const getMonitors = () => {
    return new Promise(async (resolve, reject) => {
        await execFile(binary, ["--monitors"], function (error, stdout, stderr) {
            if (error) {
                reject();
            }
            let monitors = [];
            let lines = stdout.split(/\r\n|\r|\n/);
            lines.forEach(element => {                
                let monitor = element.split(",");
                monitors.push({
                    index : monitor[0].trim(),
                    displayName : monitor[1].trim(),
                    deviceId : monitor[2].trim()
                })
            });
            resolve(monitors);
        })
    });
}


export {
    setWallpaperOnAllMonitors,
    setWallpaperOnMonitor,
    setWallpaperFit,
    getWallpaperFit,
    getMonitors
}