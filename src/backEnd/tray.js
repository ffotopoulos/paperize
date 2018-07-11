import {
    app,
    Menu,
    Tray
} from 'electron';
import {
    toggleWindow
} from './win';
import {
    changeWallpaper
} from './timer';
import {
    saveSettings,
    getSettingsOption
} from './settings';
let path = require('path');
let tray;

let initTray = () => {
    tray = new Tray(path.join(__dirname, './icons/app-icon.ico'))
    const contextMenu = Menu.buildFromTemplate([{
            label: 'show/hide',
            icon: path.join(__dirname, './icons/toggle.png'),
            click: () => {
                toggleWindow();
            }
        },
        {
            label: 'next',
            icon: path.join(__dirname, './icons/next.png'),
            click: () => {
                changeWallpaper(true);
            }
        },
        {
            label: 'randomize',
            icon: path.join(__dirname, './icons/random.png'),
            click: () => {
                changeWallpaper(true, true).then(() => {
                    if (getSettingsOption("options.clearTimer")) {
                        saveSettings('interval', 0);
                    }
                }).catch((err) => {

                });
            }
        },
        {
            label: 'exit',
            icon: path.join(__dirname, './icons/exit.png'),
            click: () => {
                app.quit();
            }
        },
    ])
    tray.setToolTip('paperize')

    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        toggleWindow();
    })
}

let displayTrayBalloon = (title, content) => {
    if (process.platform == "win32") {
        tray.displayBalloon({
            icon: path.join(__dirname, "./icons/app-icon.png"),
            title: title,
            content: content
        });
    }
}

export {
    initTray,
    displayTrayBalloon
}