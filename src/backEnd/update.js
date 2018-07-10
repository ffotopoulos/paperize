import {
    app
} from 'electron';
import {
    notifyUser
} from './notify';
let axios = require('axios');

let getLatestVersion = () => {
    axios.get("http://paperize.co/version.php")
        .then(response => {
            return response.data.version;
        })
        .catch(error => {
            return -1;
        });
}

let checkForUpdates = () => {
    if (getLatestVersion() != app.getVersion()) {
        notifyUser("Update available!","A new update is available! Click to download",()=>{
            require('electron').shell.openExternal('http://paperize.co');
        })
    }
}
export {
    checkForUpdates
}