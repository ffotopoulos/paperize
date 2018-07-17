

let notify = null;

let initNotifyConfig = ()=>{
    notify = require('electron-notify');
    notify.setConfig({
        appIcon: require('path').join(__dirname, 'icons/app-icon.ico'),
        displayTime: 6500,
        height:80,
        width:340
    });
}
let notifyUser = (title, text, callback) => {
    notify.notify({
        title: title,
        text: text,
        onClickFunc: callback,
    });
}

export {
    notifyUser,
    initNotifyConfig
}