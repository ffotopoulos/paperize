import {
    setWallpaper
} from './wallpaper';
import {
    getSettingsOption
} from './settings';
import {
    deletePaperizePhotos,
    getPhotoPath
} from './files';
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
                        var savePhoto = getSettingsOption('options.saveOnDownload');
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
    return new Promise((resolve) => {
        var url = `https://api.unsplash.com/photos/random?orientation=landscape&query=${category.replace('@@CUSTOM','')}&count=${count}&client_id=${apiKey}`;       
        console.log(url);
        axios.get(url)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log(error);
                resolve();
            });
    })
}

let downloadAndSave = (url, destToSave, savePhoto, callback, ) => {
    let https = require('https');
    let file = fs.createWriteStream(destToSave);
    let request = https.get(url, (response) => {
        //save file
        response.pipe(file);
        console.log(destToSave)
        if (savePhoto) {
            let destination = getSettingsOption('options.saveLocation');
            if (destination.trim() != '' && fs.existsSync(destination.trim())) {
                //delete prev photos if enabled
                if (getSettingsOption('options.deletePrevImage')) {
                    deletePaperizePhotos(destination);
                }
                console.log(url);
                var downloadedFile = fs.createWriteStream(destination + `\\paperize_${Date.now()}.jpg`)
                response.pipe(downloadedFile)
            }
        }
    });
    request.on('close', () => {
        callback();
    })
}

export {
    getUnsplashImages,
    getImageAndSetWallpaper,
    downloadAndSave,
    getApiKey
}