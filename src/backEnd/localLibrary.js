let fs = require('fs');
let fsExtra = require('fs-extra');
import {
    getSettingsOption,
} from "./settings";
import {
    notifyUser
} from './notify';
let previousLocalPhoto = ""

let getNextLocalLibraryPhoto = () => {
    return new Promise((resolve, reject) => {
        var localLibaryLocation = getSettingsOption('options.localLibraryLocation');
        var localPhotos = []
        console.log('local library : ' + localLibaryLocation)
        if(!localLibaryLocation || localLibaryLocation.trim()==""){
            notifyUser("Hey you!", "Your local library path does not exist. Are you trying to make me crash? :'( Open the settings menu and change it please!")
            reject();
        }
        else{
            fsExtra.ensureDir(localLibaryLocation)
            .then(() => {
                fs.readdir(localLibaryLocation, (err, dir) => {
                    for (var i = 0, path; path = dir[i]; i++) {
                        if (require('path').extname(path) == ".jpg" || require('path').extname(path) == ".jpeg" ||
                            require('path').extname(path) == ".png") {
                            localPhotos.push(localLibaryLocation + '\\' + path)
                        }
                    }
                    if (localPhotos.length > 1) {
                        var randomPhotoPath = previousLocalPhoto;
                        while (randomPhotoPath == previousLocalPhoto) {
                            randomPhotoPath = localPhotos[Math.floor(Math.random() * localPhotos.length)];
                        }
                        previousLocalPhoto = randomPhotoPath
                        var photo = {
                            photoId: require('path').basename(randomPhotoPath),
                            photoUrl: randomPhotoPath,
                            userUrl: '',
                            userName: '',
                            smallPhotoUrl: randomPhotoPath
                        }
                        resolve(photo);
                    } else {
                        notifyUser("Hey you!", "Your local library path is incorrect or does not contain more than 1 photo. Are you trying to make me crash? :'(")
                        reject();
                    }
                });
            })
            .catch(err => {
                notifyUser("Hey you!", "Your local library path is incorrect. Are you trying to make me crash? :'(")
                reject();
            })
        }
        
    })
}

export {
    getNextLocalLibraryPhoto
}