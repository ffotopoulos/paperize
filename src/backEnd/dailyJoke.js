import {clipboard } from 'electron';
import {
    notifyUser
} from './notify';
let axios = require('axios');
let showDadJoke= () => {
    return new Promise((resolve, reject) => {
        var url = `https://icanhazdadjoke.com/slack`;        
        axios.get(url)
            .then(response => {
                console.log("jokes response: " + response.data.attachments[0].text)
                notifyUser('Your daily dad joke. Sorry...',  response.data.attachments[0].text + '</br></br> Click on the text to copy the joke! Why tho...?'
                ,()=>{
                    clipboard.writeText(response.data.attachments[0].text)
                }
                ,require('path').join(__dirname, 'icons/dadjoke.png')
                )
                resolve();
            })
            .catch(err => {
                console.log(err);
                uaSendError("Cant get random jokes: " + err);
                reject();
            });
    })
}

export {
    showDadJoke
}