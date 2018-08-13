import {
    uaSendError
} from './analytics';
let axios = require('axios');
let lastPixaBayResponse = {
    lastIndex: 0,
    category: 'random',
    data: null
}
let apiKey = "9755758-a56f0d119098ed831fdb03f34";
let getPixabayApiKey = () => {
    return apiKey;
}

let handleNextPixabayImage = (category, count, isRandom = false) => {
    return new Promise((resolve, reject) => {
        var imageUrl = '';
        if (lastPixaBayResponse.category != category) {
            getPixaBayImages(category)
                .then((response) => {
                    lastPixaBayResponse = {
                        category: category.trim(),
                        lastIndex: Math.floor(Math.random() * response.data.hits.length),
                        data: response.data.hits
                    }
                    imageUrl = lastPixaBayResponse.data[lastPixaBayResponse.lastIndex].imageURL;
                    console.log(imageUrl)
                    console.log(lastPixaBayResponse.lastIndex + ' and category ' + lastPixaBayResponse.category)
                    resolve(imageUrl);
                })
                .catch((err) => {
                    console.log(err);
                    uaSendError("Cant get pixabay images: " + err);
                    reject();
                })
        } else {
            console.log('category already exists in prev response');
            var randomIndex = lastPixaBayResponse.lastIndex
            while (randomIndex == lastPixaBayResponse.lastIndex) {
                randomIndex = Math.floor(Math.random() * lastPixaBayResponse.data.length);
            }
            console.log('new index: ' + randomIndex)
            lastPixaBayResponse.lastIndex = randomIndex;
            imageUrl = lastPixaBayResponse.data[randomIndex].imageURL;            
            console.log(imageUrl)
            resolve(imageUrl)
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
                uaSendError("Cant get pixabay images: " + err);
                reject();
            });
    })
}

export {
    getPixabayApiKey,
    getPixaBayImages,
    handleNextPixabayImage
}