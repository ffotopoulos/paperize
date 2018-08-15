import {
    getSettingsOption,
    getImageSources
} from "./settings";
import {
    getNextPixabayPhoto
} from "./pixabay";
import {
    uaSendError
} from "./analytics";
import {
    downloadAndSave,
    getPhotoPath
} from "./files";
import {
    setWallpaper
} from "./wallpaper";
import { getNextUnsplashPhoto } from "./unsplash";

let selectSource = () => {
    var selectedSources = getSettingsOption('options.sources');
    var randomSource = selectedSources[Math.floor(Math.random() * selectedSources.length)];
    console.log('random source: ' + randomSource)
    return randomSource;
}

let getNextPhoto = (category) => {
    return new Promise((resolve, reject) => {
        var source = selectSource();
        switch (source) {
            case 'pixabay':
                getNextPixabayPhoto(category)
                    .then((photo) => {
                        photo.apiLabel = getImageSources().find(x => x.name == source).label;
                        photo.apiLogoPath = getImageSources().find(x => x.name == source).logoPath;
                        photo.apiRefUrl = getImageSources().find(x => x.name == source).refUrl;
                        resolve(photo);
                    })
                    .catch((err) => {
                        console.log(err);
                        uaSendError(err);
                    })
                break;
            case 'unsplash':
                    getNextUnsplashPhoto(category)
                    .then((photo)=>{
                        photo.apiLabel = getImageSources().find(x => x.name == source).label;
                        photo.apiLogoPath = getImageSources().find(x => x.name == source).logoPath;
                        photo.apiRefUrl = getImageSources().find(x => x.name == source).refUrl;
                        resolve(photo);
                    })
                    .catch((err) => {
                        console.log(err);
                        uaSendError(err);
                    })
                break;
        }
    })
}

let downloadAndSetWallpaper = (isRandom = false) => {
    return new Promise((resolve, reject) => {
        var category = !isRandom ? getSettingsOption('options.category').replace('@@CUSTOM', '') : 'random';
        getNextPhoto(category)
            .then((nextPhoto) => {
                downloadAndSave(nextPhoto.photoUrl, getPhotoPath(), () => {
                    setWallpaper(getPhotoPath())
                        .then((photoPath) => {
                            console.log(nextPhoto);
                            var photo = {
                                photoPath: photoPath,
                                userUrl: nextPhoto.userUrl,
                                userName: nextPhoto.userName,
                                apiLabel: nextPhoto.apiLabel,
                                apiLogoName:require('path').basename(nextPhoto.apiLogoPath),
                                apiRefUrl: nextPhoto.apiRefUrl
                            }
                            resolve(photo);
                        })
                        .catch((err) => {
                            console.log(err);
                            uaSendError(err);
                            reject();
                        })
                })
            })
            .catch((err) => {
                console.log(err);
                uaSendError(err);
                reject();
            })
    })

}

export {
    downloadAndSetWallpaper,    
    getNextPhoto
}