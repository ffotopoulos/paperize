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
let axios = require('axios');

let loadGallery = async (count, category) => {
    var photos = []
    for (var i = 0; i < count; i++) {
        await getNextPhoto(category)
            .then((photo) => {
                var d = photos.find(x=> x.photoId == photo.photoId);
                if(d){
                    i--;
                }
                else{
                    photos.push(photo);
                }
                
            })
            .catch((err) => {
                uaSendError('cant loadgalerry ' + err);
                console.log(err);
                reject();
            })

    }
    return photos;
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