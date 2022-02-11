

let notify = null;

let initNotifyConfig = ()=>{
    notify = require('electron-notify');
    notify.setConfig({
        appIcon: require('path').join(__dirname, 'icons/app-icon.ico'),
        displayTime: 7800,
        height:150,
        width:420
    });
}
let notifyUser = (title, text, callback,image=null) => {    
    notify.notify({
        title: title,
        text: text,
        onClickFunc: callback,
        image: image
    });
}

export {
    notifyUser,
    initNotifyConfig
}