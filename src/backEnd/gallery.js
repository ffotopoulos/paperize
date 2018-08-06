import { getUnsplashImages, downloadAndSave, getApiKey } from './unsplash';
import { uaSendError, uaUserOppenedGallery } from './analytics';

let axios = require('axios');
let loadGallery = (count, category) => {
    return new Promise((resolve) => {
        getUnsplashImages(count, category).then((items) => {            
            uaUserOppenedGallery(category);
            resolve(items);
        })
    })

}

let downloadGalleryItem = (url, saveDir) => {
    return new Promise((resolve) => {
        url = url + `?client_id=${getApiKey()}`
        axios.get(url).then(response => {
            var imageDownloadUrl = response.data.url;
            downloadAndSave(imageDownloadUrl, saveDir, false, () => {
                resolve();
            });
        }).catch((err) => {
            uaSendError("unable to download gallery item:" + err);
            resolve();
        });
    });
}

export {
    loadGallery,
    downloadGalleryItem
}