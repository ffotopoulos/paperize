import {
    getSettingsOption,
    getImageSources
} from "./settings";
import {
    getNextPixabayPhoto
} from "./pixabay";
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
import {
    getNextPexelsPhoto
} from "./pexels";
import {
    getNextFlickrPhoto
} from "./flickr";
import {
    addHistoryItem
} from "./history";
import { setWallpaperFit, setWallpaperOnMonitor } from "./wallpaper_new";

let selectSource = () => {
    var selectedSources = getSettingsOption('options.sources');
    var randomSource = selectedSources[Math.floor(Math.random() * selectedSources.length)];
    console.log('random source: ' + randomSource)
    return randomSource;
}

let selectCategory = () => {
    var selectedCategories = getSettingsOption('options.category');
    var randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
    console.log('random category: ' + randomCategory)
    return randomCategory;
}

let isPhotoLandscapeOrientation = (width, height) => {
    if (width > height) {
        return true;
    } else {
        return false;
    }
}

let getNextPhoto = (category, isGallery = false) => {
    return new Promise((resolve, reject) => {
        var source = category != 'random' ? selectSource() : 'unsplash';
        if (isGallery) {
            while (source == 'localLibrary' || source == 'flickr') {
                source = selectSource();
            }
        }
        switch (source) {
            case 'flickr':
                getNextFlickrPhoto(category)
                    .then((photo) => {
                        photo.apiName = source;
                        photo.apiLabel = getImageSources().find(x => x.name == source).label;
                        photo.apiLogoPath = getImageSources().find(x => x.name == source).logoPath;
                        photo.apiRefUrl = getImageSources().find(x => x.name == source).refUrl;
                        resolve(photo);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject();
                    })
                break;
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
                        reject();
                    })
                break;
            case 'pexels':
                getNextPexelsPhoto(category)
                    .then((photo) => {
                        photo.apiLabel = getImageSources().find(x => x.name == source).label;
                        photo.apiLogoPath = getImageSources().find(x => x.name == source).logoPath;
                        photo.apiRefUrl = getImageSources().find(x => x.name == source).refUrl;
                        resolve(photo);
                    })
                    .catch((err) => {
                        console.log(err);
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
                        console.log(photo)
                        resolve(photo);
                    })
                    .catch((err) => {
                        console.log(err);
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
                        reject();
                    })
        }
    })
}

let downloadAndSetWallpaper = (isRandom = false) => {
    return new Promise((resolve, reject) => {
        var category = !isRandom ? selectCategory().replace('@@CUSTOM', '') : 'random';
        console.log('category: ' + category);
        getNextPhoto(category)
            .then((nextPhoto) => {
                if (nextPhoto.apiName != 'localLibrary') {
                    var selectedMonitors = getSettingsOption('options.selectedMonitors');
                    downloadAndSave(nextPhoto.photoUrl, getPhotoPath(), () => {
                        var photo = {
                            photoPath: getPhotoPath(),
                            photoUrlHtml: nextPhoto.photoUrlHtml,
                            userUrl: nextPhoto.userUrl,
                            userName: nextPhoto.userName,
                            apiLabel: nextPhoto.apiLabel,
                            apiLogoName: require('path').basename(nextPhoto.apiLogoPath),
                            apiRefUrl: nextPhoto.apiRefUrl
                        }
                        var selectedMonitors = getSettingsOption('options.selectedMonitors');
                        if (selectedMonitors.length <= 0 || selectedMonitors.length == require('electron').screen.getAllDisplays().length) {
                            console.log("ALL MONITORS MWREE")
                            setWallpaper(photo)
                                .then((photoPath) => {
                                    addHistoryItem(nextPhoto);
                                    resolve(photo);
                                })
                                .catch((err) => {
                                    console.log(err);
                                    reject();
                                })
                        }
                        else{
                            console.log("ENA ENA")
                            var promises = [];
                            selectedMonitors.forEach(monitor=>{
                                promises.push(setWallpaper(photo,monitor));
                            })
                            Promise.all(promises).then((values) => {
                                resolve(photo);
                              });
                        }
                    })
                } else {
                    require('fs').copyFile(nextPhoto.photoUrl, getPhotoPath(), (err) => {
                        if (err) {
                            console.log(nextPhoto);
                            reject();
                        }
                        var photo = {
                            photoPath: getPhotoPath(),
                            userUrl: '',
                            userName: 'LocalLibrary',
                            apiLabel: nextPhoto.apiLabel,
                            apiLogoName: require('path').basename(nextPhoto.apiLogoPath),
                            apiRefUrl: nextPhoto.apiRefUrl
                        }
                        var selectedMonitors = getSettingsOption('options.selectedMonitors');
                        if (selectedMonitors.length <= 0 || selectedMonitors.length == require('electron').screen.getAllDisplays().length) {
                            console.log("ALL MONITORS MWREE")
                            setWallpaper(photo)
                                .then((photoPath) => {
                                    addHistoryItem(nextPhoto);
                                    resolve(photo);
                                })
                                .catch((err) => {
                                    console.log(err);
                                    reject();
                                })
                        }
                        else{
                            console.log("ENA ENA")
                            var promises = [];
                            selectedMonitors.forEach(monitor=>{
                                promises.push(setWallpaper(photo,monitor));
                            })
                            Promise.all(promises).then((values) => {
                                resolve(photo);
                              });
                        }
                    });
                }

            })
            .catch((err) => {
                console.log(err);
                reject();
            })
    })

}

export {
    downloadAndSetWallpaper,
    getNextPhoto,
    isPhotoLandscapeOrientation
}