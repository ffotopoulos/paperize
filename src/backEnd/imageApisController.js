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
import {
    getNextUnsplashPhoto
} from "./unsplash";
import {
    getNextLocalLibraryPhoto
} from "./localLibrary";

let selectSource = () => {
    var selectedSources = getSettingsOption('options.sources');
    var randomSource = selectedSources[Math.floor(Math.random() * selectedSources.length)];
    console.log('random source: ' + randomSource)
    return randomSource;
}

let selectCategory = ()=>{
    var selectedCategories = getSettingsOption('options.category');
    var randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
    console.log('random category: ' + randomCategory)
    return randomCategory;
} 

let getNextPhoto = (category, isGallery = false) => {
    return new Promise((resolve, reject) => {
        var source = selectSource();
        if (isGallery) {
            while (source == 'localLibrary') {
                source = selectSource();
            }
        }
        switch (source) {
            case 'pixabay':
                getNextPixabayPhoto(category)
                    .then((photo) => {
                        photo.apiName = source;
                        photo.apiLabel = getImageSources().find(x => x.name == source).label;
                        photo.apiLogoPath = getImageSources().find(x => x.name == source).logoPath;
                        photo.apiRefUrl = getImageSources().find(x => x.name == source).refUrl;
                        resolve(photo);
                    })
                    .catch((err) => {
                        console.log(err);
                        uaSendError(err);
                        reject();
                    })
                break;
            case 'unsplash':
                getNextUnsplashPhoto(category)
                    .then((photo) => {
                        photo.apiName = source;
                        photo.apiLabel = getImageSources().find(x => x.name == source).label;
                        photo.apiLogoPath = getImageSources().find(x => x.name == source).logoPath;
                        photo.apiRefUrl = getImageSources().find(x => x.name == source).refUrl;
                        resolve(photo);
                    })
                    .catch((err) => {
                        console.log(err);
                        uaSendError(err);
                        reject();
                    })
                break;
            case 'localLibrary':
                getNextLocalLibraryPhoto()
                    .then((photo) => {
                        photo.apiName = source;
                        photo.apiLogoPath = getImageSources().find(x => x.name == source).logoPath;
                        photo.apiRefUrl = getSettingsOption('options.localLibraryLocation');
                        resolve(photo);
                    }).catch((err) => {
                        console.log(err);
                        uaSendError(err);
                        reject();
                    })
        }
    })
}

let downloadAndSetWallpaper = (isRandom = false) => {
    return new Promise((resolve, reject) => {
       // var category = !isRandom ? getSettingsOption('options.category').replace('@@CUSTOM', '') : 'random';
       var category = !isRandom ? selectCategory().replace('@@CUSTOM', '') : 'random';
       console.log('lol ok cat is ' + category);
        getNextPhoto(category)
            .then((nextPhoto) => {
                if (nextPhoto.apiName != 'localLibrary') {
                    downloadAndSave(nextPhoto.photoUrl, getPhotoPath(), () => {
                        setWallpaper(getPhotoPath())
                            .then((photoPath) => {                                
                                var photo = {
                                    photoPath: photoPath,
                                    userUrl: nextPhoto.userUrl,
                                    userName: nextPhoto.userName,
                                    apiLabel: nextPhoto.apiLabel,
                                    apiLogoName: require('path').basename(nextPhoto.apiLogoPath),
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
                } else {
                    require('fs').copyFile(nextPhoto.photoUrl, getPhotoPath(), (err) => {
                        if (err) {
                            console.log(nextPhoto);
                            uaSendError(err)
                            reject();
                        }
                        setWallpaper(getPhotoPath())
                            .then((photoPath) => {                                
                                var photo = {
                                    photoPath: photoPath,
                                    userUrl: '',
                                    userName: 'LocalLibrary',
                                    apiLabel: nextPhoto.apiLabel,
                                    apiLogoName: require('path').basename(nextPhoto.apiLogoPath),
                                    apiRefUrl: nextPhoto.apiRefUrl
                                }
                                resolve(photo);
                            })
                            .catch((err) => {
                                console.log(err);
                                uaSendError(err);
                                reject();
                            })
                    });
                }

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