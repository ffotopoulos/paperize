import {
    app
} from 'electron';
import {
    addBypassChecker
} from 'electron-compile';
import {
    getSettingsOption
} from './settings';
let appUsersPath = app.getPath('userData');
let photoPath = appUsersPath + '\\photo.jpg';
let fs = require('fs');
let fsExtra = require('fs-extra');

let bypassLocalChecker = () => {
    addBypassChecker((filePath) => {
        return filePath.indexOf(app.getAppPath()) === -1 && (/.jpg/.test(filePath) || /.ms/.test(filePath) || /.png/.test(filePath));
    });
}

let getPhotoPath = () => {
    return photoPath;
}
let copyFile = (source, target, cb) => {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        done(err);
    });
    wr.on("close", function (ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

let downloadAndSave = (url, destToSave, callback, savePhoto) => {
    try {
        let https = require('https');
        let file = fs.createWriteStream(destToSave);
        let request = https.get(url, (response) => {
            //save file
            var res = response.pipe(file);
            res.on('error', (err) => {
                console.log('error');                
                return;
            })
            res.on('finish', () => {
                callback();
                savePhoto = savePhoto || getSettingsOption('options.saveOnDownload');
                if (savePhoto) {
                    let destination = getSettingsOption('options.saveLocation');
                    if (destination.trim() != '') {
                        fsExtra.ensureDir(destination)
                            .then(() => {
                                //delete prev photos if enabled
                                if (getSettingsOption('options.deletePrevImage')) {
                                    deletePaperizePhotos(destination);
                                }
                                fs.copyFile(destToSave, destination + `\\paperize_${Date.now()}.jpg`, (err) => {
                                    if (err) {
                                        console.log(nextPhoto);                                        
                                        return;
                                    }
                                });
                            })
                            .catch(err => {
                                return;
                            })
                    }
                }
            })
        });
        request.on('error', (err) => {
            console.log('error');            
            return;
        });
    } catch (err) {
        console.log('error');        
        return;
    }
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
    downloadAndSave,
    copyFile
}