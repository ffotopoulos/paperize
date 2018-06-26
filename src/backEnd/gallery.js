import { getUnsplashImages, downloadAndSave, getApiKey } from './unsplash';

let axios = require('axios');
let loadGallery = (count, category) => {
    return new Promise((resolve) => {
        getUnsplashImages(count, category).then((items) => {
            console.log(items);
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
        }).catch(() => {
            resolve();
        });
    });
}

export {
    loadGallery,
    downloadGalleryItem
}