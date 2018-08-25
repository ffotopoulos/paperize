import {
    uaSendError,
    uaUserOppenedGallery
} from './analytics';
import {
    downloadAndSave
} from './files';
import {
    getNextPhoto
} from "./imageApisController";
import {
    getSettingsOption
} from './settings';
import {
    notifyUser
} from './notify';

let loadGallery = async (count, category) => {
    var photos = []
    if (getSettingsOption('options.sources').length == 1 && getSettingsOption('options.sources')[0] == 'localLibrary') {
        notifyUser('Hey you! ', 'Please select an online source first instead of just your local library!')
        return photos;
    } else {
        for (var i = 0; i < count; i++) {
            await getNextPhoto(category, true)
                .then((photo) => {
                    photo.apiLogoName = require('path').basename(photo.apiLogoPath);
                    photos.push(photo);
                })
                .catch((err) => {
                    uaSendError('cant loadgalerry ' + err);
                    console.log(err);                    
                })
        }
        return photos;
    }

}

let downloadGalleryItem = (url, saveDir) => {
    return new Promise((resolve) => {
        downloadAndSave(url, saveDir, () => {
            resolve();
        }, false);
    });
}

export {
    loadGallery,
    downloadGalleryItem
}