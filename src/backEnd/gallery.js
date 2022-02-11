
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
    var sources = getSettingsOption('options.sources');
    if (sources.length == 1 && (sources[0] == 'localLibrary' || sources[0] == 'flickr')) {
        notifyUser('Hey you! ', 'Please select an online source other than Flickr and Local Library!');
        return photos;
    } else if (sources.length == 2 && (sources.indexOf('flickr') > -1 && sources.indexOf('localLibrary') > -1)) {
        notifyUser('Hey you! ', 'Please select an online source other than Flickr and Local Library!');
        return photos;
    } else {
        for (var i = 0; i < count; i++) {
            await getNextPhoto(category, true)
                .then((photo) => {
                    photo.apiLogoName = require('path').basename(photo.apiLogoPath);
                    photos.push(photo);
                })
                .catch((err) => {                    
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