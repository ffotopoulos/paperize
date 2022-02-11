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
import {
    checkForUpdates
} from './update';
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
            role: 'help',
            icon: path.join(__dirname, './icons/about.png'),
            label: 'about',
            submenu: [{
                    label: 'v' + app.getVersion() + ' check for updates',
                    click() {
                        checkForUpdates(true);
                    }
                },
                {
                    label: 'developer',
                    click() {
                        require('electron').shell.openExternal('https://www.linkedin.com/in/fotis-fotopoulos-7b225a134')
                    }
                },

                {
                    label: 'my unsplash profile',
                    click() {
                        require('electron').shell.openExternal('https://unsplash.com/@ffstop')
                    }
                }
            ]
        },
        {
            label: 'buy me a coffee here ^_^',
            icon: path.join(__dirname, './icons/love.png'),
            click() {
                require('electron').shell.openExternal('https://paypal.me/ffsp')
            }
        },
        {
            label: 'separator',
            type: 'separator',
        },
        {
            label: 'quit',
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