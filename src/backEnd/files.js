import { app } from 'electron';
import {addBypassChecker} from 'electron-compile';
import { getSettingsOption } from './settings';
let appUsersPath = app.getPath('userData');
let photoPath = appUsersPath + '\\photo.jpg';
let fs = require('fs');

let bypassLocalChecker = () => {
    addBypassChecker((filePath) => {
        return filePath.indexOf(app.getAppPath()) === -1 && (/.jpg/.test(filePath) || /.ms/.test(filePath) || /.png/.test(filePath));
    });
}

let getPhotoPath = () => {
    return photoPath;
}

let downloadAndSave = (url, destToSave, callback, ) => {
    let https = require('https');
    let file = fs.createWriteStream(destToSave);
    let request = https.get(url, (response) => {
        //save file
        response.pipe(file);
        console.log(destToSave)
        var savePhoto = getSettingsOption('options.saveOnDownload');
        if (savePhoto) {            
            let destination = getSettingsOption('options.saveLocation');
            if (destination.trim() != '' && fs.existsSync(destination.trim())) {
                //delete prev photos if enabled
                if (getSettingsOption('options.deletePrevImage')) {
                    deletePaperizePhotos(destination);
                }                
                var downloadedFile = fs.createWriteStream(destination + `\\paperize_${Date.now()}.jpg`)
                response.pipe(downloadedFile)
            }
        }
    });
    request.on('close', () => {
        callback();
    })
}

let deletePaperizePhotos = (destination) => {
    fs.readdir(destination, (err, dir) => {
        for (var i = 0, path; path = dir[i]; i++) {
            if (path.startsWith('paperize_') &&
                (require('path').extname(path) == ".jpg" || require('path').extname(path) == ".jpeg")) {
                fs.unlinkSync(destination + '\\' + path);
            }
        }
    });
}

let photoExists = () => {
    return fs.existsSync(photoPath);
}

export {
    bypassLocalChecker,
    getPhotoPath,
    deletePaperizePhotos,
    photoExists,
    downloadAndSave
}