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
import {
    uaSendError
} from './analytics';
let axios = require('axios');
let lastResponse = {
    lastIndex: 0,
    category: 'random',
    data: null
}
let fs = require('fs');
let apiKey = "25dadce5805202367c5dbf98497f2a8d64ae4e71471d91c7a3ce06ae37fb1659";

let getUnsplashApiKey = () => {
    return apiKey;
}

let getNextUnsplashPhoto = (category) => {
    return new Promise((resolve, reject) => {
        var imageUrl = '';
        //check whether category changed from previous request
        //to save api calls
        if (lastResponse.category != category || lastResponse.data == null) {
            getUnsplashImages(category)
                .then((response) => {
                    //cache the new response as the latest
                    var randomIndex = Math.floor(Math.random() * response.data.results.length);                    
                    var downloadUrl = response.data.results[randomIndex].links.download_location + `?client_id=${apiKey}`
                    axios.get(downloadUrl)
                        .then(downloadResponse => {
                            var imageDownloadUrl = downloadResponse.data.url;
                            lastResponse = {
                                category: category.trim(),
                                lastIndex: randomIndex,
                                data: response.data.results
                            }
                            var userName = lastResponse.data[lastResponse.lastIndex].user.username || '';
                            var userUrl = lastResponse.data[lastResponse.lastIndex].user.links.html || '';
                            var photo = {
                                photoId: lastResponse.data[lastResponse.lastIndex].id,
                                photoUrl: imageDownloadUrl,
                                userUrl: userUrl,
                                userName: userName,
                                smallPhotoUrl:lastResponse.data[lastResponse.lastIndex].urls.thumb
                            }
                            resolve(photo);
                        })
                        .catch((err) => {
                            console.log(err);
                            uaSendError("Cant get pixabay images: " + err);
                            reject();
                        })

                })
                .catch((err) => {
                    console.log(err);
                    uaSendError("Cant get pixabay images: " + err);
                    reject();
                })
        } else {
            console.log('category already exists in prev response');
            var randomIndex = lastResponse.lastIndex
            while (randomIndex == lastResponse.lastIndex) {
                randomIndex = Math.floor(Math.random() * lastResponse.data.length);
            }
            console.log('new index: ' + randomIndex)
            var downloadUrl = lastResponse.data[randomIndex].links.download_location + `?client_id=${apiKey}`
            axios.get(downloadUrl)
                .then(downloadResponse => {
                    var imageDownloadUrl = downloadResponse.data.url;
                    lastResponse.lastIndex = randomIndex;
                    var userName = lastResponse.data[lastResponse.lastIndex].user.username || '';
                    var userUrl = lastResponse.data[lastResponse.lastIndex].user.links.html || '';
                    var photo = {
                        photoId: lastResponse.data[lastResponse.lastIndex].id,
                        photoUrl: imageDownloadUrl,
                        userUrl: userUrl,
                        userName: userName,
                        smallPhotoUrl:lastResponse.data[lastResponse.lastIndex].urls.thumb
                    }
                    resolve(photo);
                })
                .catch((err) => {
                    console.log(err);
                    uaSendError("Cant get pixabay images: " + err);
                    reject();
                })
        }
    })

}


let getUnsplashImages = (category) => {
    return new Promise((resolve, reject) => {
        var url = `https://api.unsplash.com/search/photos?page=1&query=${category}&client_id=${apiKey}&per_page=700&orientation=landscape`
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
    getUnsplashApiKey,
    getNextUnsplashPhoto
}