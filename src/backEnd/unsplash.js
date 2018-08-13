import {
    setWallpaper
} from './wallpaper';
import {
    getSettingsOption
} from './settings';
import {
    downloadAndSave,
    getPhotoPath
} from './files';
import { uaSendError } from './analytics';
let axios = require('axios');
let fs = require('fs');
let apiKey = "25dadce5805202367c5dbf98497f2a8d64ae4e71471d91c7a3ce06ae37fb1659";

let getApiKey = () => {
    return apiKey;
}

let handleNextImage = (isRandom) => {
    isRandom = isRandom || false;
    return new Promise((resolve) => {
        var category = !isRandom ? getSettingsOption('options.category') : 'random';
        getUnsplashImages(30, category).then((response) => {
            if (response) {
                var randomIndex = Math.floor(Math.random() * response.data.length); 
                var downloadUrl = response.data[randomIndex].links.download_location + `?client_id=${apiKey}`
                axios.get(downloadUrl)
                    .then(downloadResponse => {
                        var imageDownloadUrl = downloadResponse.data.url;                        
                        downloadAndSave(imageDownloadUrl, getPhotoPath(), savePhoto, () => {
                            setWallpaper(getPhotoPath()).then((photoPath) => {
                                var photo = {
                                    photoPath: photoPath,
                                    userUrl: response.data[randomIndex].user.links.html,
                                    userName: response.data[randomIndex].user.name
                                }
                                resolve(photo);
                            })
                        });
                    })

            } else {
                resolve();
            }
        }).catch((err) => {
            console.log(err);
            uaSendError("Cant handle next image:" + err);
            resolve();
        });
    });
}

let getImageAndSetWallpaper = (isRandom) => {
    isRandom = isRandom || false;
    return new Promise((resolve) => {
        handleNextImage(isRandom).then((photoPath) => {
            resolve(photoPath);
        })
    })
}

let getUnsplashImages = (count, category) => {
    return new Promise((resolve,reject) => {
        var url = `https://api.unsplash.com/photos/random?orientation=landscape&query=${category.replace('@@CUSTOM','')}&count=${count}&client_id=${apiKey}`;       
        console.log(url);
        axios.get(url)
            .then(response => {
                resolve(response);
            })
            .catch(err => {
                console.log(err); 
                uaSendError("Cant get unsplash images: " + err);          
                reject();
            });
    })
}


export {
    getUnsplashImages,
    getImageAndSetWallpaper,    
    getApiKey
}