

var notify = null;

let initNotifyConfig = ()=>{
    notify = require('electron-notify');
    notify.setConfig({
        appIcon: require('path').join(__dirname, 'icons/app-icon.ico'),
        displayTime: 6000
    });
}
let notifyUser = (title, text, callback) => {
    notify.notify({
        title: title,
        text: text,
        onClickFunc: callback
    });
}

export {
    notifyUser,
    initNotifyConfig
}