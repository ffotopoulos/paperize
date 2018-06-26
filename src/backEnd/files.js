import { app } from 'electron';
import {addBypassChecker} from 'electron-compile';
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
    photoExists
}