let axios = require('axios');
let lastResponse = {
    lastIndex: 0,
    category: 'random',
    data: null
}
let apiKey = "9755758-a56f0d119098ed831fdb03f34";
let getPixabayApiKey = () => {
    return apiKey;
}

let getNextPixabayPhoto = (category) => {
    return new Promise((resolve, reject) => {
        var imageUrl = '';
        //check whether category changed from previous request
        //to save api calls        
        if (lastResponse.category != category || lastResponse.data == null) {
            getPixaBayImages(category)
                .then((response) => {
                    //cache the new response as the latest
                    lastResponse = {
                        category: category.trim(),
                        lastIndex: Math.floor(Math.random() * response.data.hits.length),
                        data: response.data.hits
                    }
                    var userName = lastResponse.data[lastResponse.lastIndex].user || '';
                    var userId = lastResponse.data[lastResponse.lastIndex].user_id || '';
                    var photo = {
                        photoId: lastResponse.data[lastResponse.lastIndex].id,
                        photoUrl: lastResponse.data[lastResponse.lastIndex].imageURL,
                        photoUrlHtml:lastResponse.data[lastResponse.lastIndex].pageURL,
                        userUrl: `https://pixabay.com/en/users/${userName}-${userId}`,
                        userName: userName,
                        smallPhotoUrl: lastResponse.data[lastResponse.lastIndex].previewURL
                    }
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
            var userName = lastResponse.data[lastResponse.lastIndex].user || '';
            var userId = lastResponse.data[lastResponse.lastIndex].user_id || '';
            var photo = {
                photoId: lastResponse.data[lastResponse.lastIndex].id,
                photoUrl: lastResponse.data[lastResponse.lastIndex].imageURL,
                photoUrlHtml:lastResponse.data[lastResponse.lastIndex].pageURL,
                userUrl: `https://pixabay.com/en/users/${userName}-${userId}`,
                userName: userName,
                smallPhotoUrl: lastResponse.data[lastResponse.lastIndex].previewURL
            }
            resolve(photo);
        }
    })

}

let getPixaBayImages = (category) => {
    return new Promise((resolve, reject) => {
        var url = `https://pixabay.com/api/?key=${apiKey}&q=${category}&orientation=horizontal&per_page=200`;
        console.log(url);
        axios.get(url)
            .then(response => {
                console.log("pixabay response: " + response.data)
                resolve(response);
            })
            .catch(err => {
                console.log(err);                
                reject();
            });
    })
}

export {
    getPixabayApiKey,
    getPixaBayImages,
    getNextPixabayPhoto
}