const PexelsAPI = require('pexels-api-wrapper');

let apiKey = "563492ad6f91700001000001ab70cc5b3ddf4bdcaa89b612f41a1ddb"
var pexelsClient = new PexelsAPI(apiKey);
let lastResponse = {
    lastIndex: 0,
    category: 'random',
    data: null
}

let getNextPexelsPhoto = (category) => {
    return new Promise((resolve, reject) => {
        var imageUrl = '';
        //check whether category changed from previous request
        //to save api calls 
        if (lastResponse.category != category || lastResponse.data == null) {
            getPexelsImages(category)
                .then((response) => {

                    lastResponse = {
                        category: category.trim(),
                        lastIndex: Math.floor(Math.random() * response.length),
                        data: response
                    }
                    var userName = lastResponse.data[lastResponse.lastIndex].photographer || '';
                    var photo = {
                        photoId: lastResponse.data[lastResponse.lastIndex].id,
                        photoUrl: lastResponse.data[lastResponse.lastIndex].src.original,
                        photoUrlHtml:lastResponse.data[lastResponse.lastIndex].url,
                        userUrl: lastResponse.data[lastResponse.lastIndex].photographer_url,
                        userName: userName,
                        smallPhotoUrl: lastResponse.data[lastResponse.lastIndex].src.tiny
                    }
                    console.log(photo);
                    resolve(photo);
                })
                .catch((err) => {
                    console.log(err);                    
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
            var userName = lastResponse.data[lastResponse.lastIndex].photographer || '';            
            var photo = {
                photoId: lastResponse.data[lastResponse.lastIndex].id,
                photoUrl: lastResponse.data[lastResponse.lastIndex].src.original,
                photoUrlHtml:lastResponse.data[lastResponse.lastIndex].url,
                userUrl: lastResponse.data[lastResponse.lastIndex].photographer_url,
                userName: userName,
                smallPhotoUrl: lastResponse.data[lastResponse.lastIndex].src.tiny
            }
            resolve(photo);
        }
    })
}

let getPexelsImages = (category) => {
    return new Promise((resolve, reject) => {
        pexelsClient.search(category, 40, 1)
            .then(function (result) {
                resolve(result.photos)
            }).
        catch(function (e) {            
            reject();
        });
    })
}



export {
    getNextPexelsPhoto
}