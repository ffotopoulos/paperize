import {
    uaSendError
} from './analytics';
let axios = require('axios');
let lastResponse = {
    lastIndex: 0,
    category: 'random',
    data: null
}
let apiKey = "3159178fe9730b9cee5bf619acb30223";


let getFlickrApiKey = () => {
    return apiKey;
}

let getNextFlickrPhoto = (category) => {
    return new Promise((resolve, reject) => {
        var imageUrl = '';
        //check whether category changed from previous request
        //to save api calls        
        if (lastResponse.category != category || lastResponse.data == null) {
            getFlickrImages(category)
                .then((response) => {
                    //cache the new response as the latest
                    lastResponse = {
                        category: category.trim(),
                        lastIndex: Math.floor(Math.random() * response.length),
                        data: response
                    }
                    var userName = lastResponse.data[lastResponse.lastIndex].user || '';
                    var photo = {
                        photoId: lastResponse.data[lastResponse.lastIndex].id,
                        photoUrl: lastResponse.data[lastResponse.lastIndex].imageURL,
                        userUrl: lastResponse.data[lastResponse.lastIndex].userUrl,
                        userName: userName,
                        smallPhotoUrl: lastResponse.data[lastResponse.lastIndex].smallPhotoUrl
                    }
                    resolve(photo);
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
            lastResponse.lastIndex = randomIndex;
            var userName = lastResponse.data[lastResponse.lastIndex].user || '';
            var photo = {
                photoId: lastResponse.data[lastResponse.lastIndex].id,
                photoUrl: lastResponse.data[lastResponse.lastIndex].imageURL,
                userUrl: lastResponse.data[lastResponse.lastIndex].userUrl,
                userName: userName,
                smallPhotoUrl: lastResponse.data[lastResponse.lastIndex].smallPhotoUrl
            }
            resolve(photo);
        }
    })

}


let getFlickrImages = (category) => {
    return new Promise((resolve, reject) => {
        var url = `https://api.flickr.com/services/rest?method=flickr.photos.search&text=${category}&format=json&api_key=${apiKey}&extras=url_o&content_type=1&per_page=80&nojsoncallback=1`;
        console.log(url);
        axios.get(url)
            .then(response => {
                //  console.log("flickr response: " + response.data.photos.photo[0].id)
                //.map(x=> x.width_o > x.height_o && x.width_o > 1980);         
                console.log(response.data)     
                fixFlickResponse(response)
                    .then(flickrFixedResponse => {
                        console.log(flickrFixedResponse);
                        if (flickrFixedResponse && flickrFixedResponse.length > 2)
                            resolve(flickrFixedResponse);
                        else
                            reject();
                    })
            })
            .catch(err => {
                console.log(err);
                uaSendError("Cant get flickr images: " + err);
                reject();
            });
    })
}

async function fixFlickResponse(response) {
    var flickrResponse = response.data.photos.photo;
    let flickrFixedResponse = [];
    for (var i = 0, len = flickrResponse.length; i < len; i++) {
        var item = flickrResponse[i];
        if (item.width_o > item.height_o && item.width_o > 1980) {            
            await getFlickrUserInfo(item.owner)
                .then(flickrUser => {
                    //photo thumbnail                    
                    //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)
                    let flickrImage = {
                        id: item.id,
                        user_id: item.owner,
                        user: flickrUser.username._content,
                        userUrl: flickrUser.profileurl._content,
                        imageURL: item.url_o,
                        smallPhotoUrl: `https://farm${item.farm}.staticflickr.com/${item.server}/${item.id}_${item.secret}_t.jpg`
                    }
                    flickrFixedResponse.push(flickrImage);
                })
                .catch(err => {
                    console.log(err);
                    reject();
                })
        }
    }
    return flickrFixedResponse;
}

let getFlickrUserInfo = (userId) => {
    return new Promise((resolve, reject) => {
        var url = `https://www.flickr.com/services/rest/?method=flickr.people.getInfo&api_key=${apiKey}&user_id=${userId}&format=json&nojsoncallback=1`;
        axios.get(url)
            .then(response => {
                resolve(response.data.person);
            })
            .catch(err => {
                console.log(err);
                uaSendError("Cant get flickr user info: " + err);
                reject();
            })
    })
}

export {
    getFlickrApiKey,
    getFlickrImages,
    getNextFlickrPhoto
}