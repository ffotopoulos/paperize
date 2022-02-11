let AutoLaunch = require('auto-launch');
let appAutoLauncher = null;

let initAutoLaunch = () => {
    appAutoLauncher = new AutoLaunch({
        name: 'paperize',
        isHidden: true
    });
}

let toggleAutoLaunch = (enable) => {
    if (enable) {
        appAutoLauncher.isEnabled().then((isEnabled) => {
            if (!isEnabled)
                appAutoLauncher.enable();
        });
    } else {
        appAutoLauncher.disable();
    }
}

export {
    toggleAutoLaunch,
    initAutoLaunch
}