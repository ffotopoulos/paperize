var customTypingTimer = null;
var lastIntervalMs = 180000;
ipcRenderer.on('wallpaper-changed', (evt, data) => {
    setAppBackground(data);
});

ipcRenderer.on('toggleLoading', (msg) => {
    msg = msg || 'SERVING...'
    toggleLoading(msg);
})

ipcRenderer.on('togglePlayback', (evt, msg) => {
    if (msg.res) {
        lastIntervalMs = msg.ms;
        $(".playback-toggle").removeClass("fa-play").addClass("fa-pause");
    } else {
        $(".playback-toggle").removeClass("fa-pause").addClass("fa-play");
    }
})

ipcRenderer.on('loadSettings', (event, result) => {
    loadSettings(result.options).then(() => {
        if (!$("#settings").is(":visible")) {
            $("#header").hide();
            $("#gallery-wrapper").hide();
            $("#checkmark").html('');
            $("#settings").show();
        }
    })
})

ipcRenderer.on('galleryFunctionDone', () => {
    showCheckMark('#galleryCheckmark');
})

ipcRenderer.on('loadGallery', (evt, items) => {
    loadGallery(items).then(() => {
        $(".downloadGalleryItem").unbind('click');
        $(".saveDir").unbind('change');

        $(".downloadGalleryItem").click(function () {
            var dirId = `#saveDirGallery_${$(this).attr('data-imgId')}`
            console.log(dirId);
            $(dirId).click();
        });
        $(".saveDirGallery").change(function () {
            var id = $(this).attr('id');
            var p = document.getElementById(id).files[0].path + `\\${$(this).attr('data-imgId')}.jpg`
            if (p.trim() != '') {
                downloadGalleryItem($(this).attr('data-url'), p);
            }
        })

        $(".setGalleryItemDesktop").click(function () {
            var url = $(this).attr('data-url');
            var userName = $(this).attr('data-userName');
            var userUrl = $(this).attr('data-userUrl');
            ipcRenderer.send('setGalleryItemAsBackground', {
                url: url,
                userName: userName,
                userUrl: userUrl
            });
        })
        $("#gallery-wrapper").show();
    })
});

ipcRenderer.on('settingsSaved', () => {
    showCheckMark("#checkmark");
})

$(".minimize").click(() => {
    ipcRenderer.send('minimize-app');
})

$(".exit").click(() => {
    ipcRenderer.send('exit-app');
})

$(".toggleWrapper").click(() => {
    toggleWraper();
})

$(".showSettings").click(() => {
    getSettings();
})

$("#galleryCategory").change(function () {
    if ($(this).val() == "custom") {
        $("#customGalleryCategoryInput").show();
    } else {
        $("#customGalleryCategoryInput").hide();
    }
})

$("#customGalleryCategoryInput").keypress(function (ev) {
    if (ev.which == 13) {
        $(".gallery").click();
    }
})

$(".gallery").click(() => {
    if ($("#header").is(":visible")) {
        $("#header").hide();
    }
    if ($("#settings").is(":visible")) {
        $("#settings").hide();
    }
    var category = $("#galleryCategory").val();
    if (category == "custom") {
        category = $("#customGalleryCategoryInput").val().trim();
    }
    ipcRenderer.send("getGalleryItems", {
        count: 9,
        category: category
    });
});

$(".closeSettings").click(() => {
    // ipcRenderer.send("left-settings");
    $("#settings").hide();
    if (!$("#minimized").is(":visible"))
        $("#header").show();
})

$(".closeGallery").click(() => {
    // ipcRenderer.send("left-settings");
    $("#gallery-wrapper").hide();
    if (!$("#minimized").is(":visible"))
        $("#header").show();
})

$(".next").click(() => {
    ipcRenderer.send('next');
});
$(".randomize").click(() => {
    ipcRenderer.send('randomize');
})

$(".settingsCheckbox").click(function () {
    var id = $(this).attr('id');
    var val = $(this).is(":checked");
    saveSettings(id, val);
})
$("#saveOnDownload").change(function () {
    var val = $(this).is(":checked");
    if (val) {
        $(".saveLocationGroup").show();
    } else {
        $(".saveLocationGroup").hide();
    }
})

$("#saveLocationInput").click(function () {
    $("#saveDirectory").click();
})

$("#saveDirectory").change(function () {
    var p = document.getElementById('saveDirectory').files[0].path
    $("#saveLocationInput").val(p);
    if (p.trim() != '') {
        saveSettings('saveLocation', p);
    }
})

$(".playback-toggle").click(function () {
    var ms = 0;
    if ($(this).hasClass("fa-play")) {
        ms = lastIntervalMs;
    }
    saveSettings('interval', ms).then(() => {
        if ($("#settings").is(":visible")) {
            getSettings();
        }
    });
})

$('#interval,#category').change(function () {
    var val = $(this).val();
    var opt = $(this).attr('id');

    if (opt == "interval" && val != 0)
        lastIntervalMs = val;

    if (opt == "category") {
        if (val == "custom") {
            $("#customCategoryInput").show();
            $("#customCategoryInput").focus();
        } else {
            $("#customCategoryInput").hide();
            $("#customCategoryInput").val('');
        }
    }
    if (val != "custom") {
        saveSettings(opt, val);
    }

})

$("#customCategoryInput").keyup(function () {
    clearTimeout(customTypingTimer);
    if ($('#customCategoryInput').val()) {
        customTypingTimer = setTimeout(() => {
            saveSettings('category', `@@CUSTOM${$(this).val()}`)
        }, 1000);
    }
})

$(".open-url").click(function () {
    openUrl($(this).attr('data-url'));
})

var toggleWraper = () => {
    $("#minimized").toggle();
    $("#header").toggle();
    $("#bg").toggleClass("bg");
    $("#settings").hide();
    $("#gallery-wrapper").hide();
}



function toggleOffline(isOnline) {
    console.log(isOnline)
    $(".loading").hide();
    if (isOnline) {
        $(".fade").hide();
        $(".offline").hide();
    } else {
        $(".fade").show();
        $(".offline").show();
    }
}

function toggleLoading(message) {
    message = message || 'SERVING...';
    $(".loadingHeader").html(message);
    $(".fade").toggle();
    $(".loading").toggle();
}

function openUrl(url) {
    require('electron').shell.openExternal(url);
}

function setAppBackground(photo) {
    return new Promise((resolve) => {
        //avoid showing the previous cached image        
        $("#bgPicture").attr("src", photo.photoPath + "?" + Date.now());

        if (photo.userName && photo.userName != '') {
            $(".photoCredit").html(`photo by: <a onclick="openUrl('${photo.userUrl}')" class="openUrl grow" style="padding-left:3px;vertical-align:0"> ${photo.userName} </a>`);
            $(".photoCredit").removeClass("hidden");
        } else {
            $(".photoCredit").html('');
            $(".photoCredit").addClass("hidden");
        }

        if ($("#gallery-wrapper").is(":visible")) {
            showCheckMark("#galleryCheckmark");
        }
        resolve();
    })

}

function saveSettings(opt, val) {
    return new Promise((resolve) => {
        ipcRenderer.send('saveSettings', {
            option: opt,
            value: val
        });
        resolve();
    })

}

function showCheckMark(divId) {
    $(divId).html('');
    $(divId).html(` <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                        <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>`)
}

function loadGallery(items) {
    return new Promise((resolve) => {
        $("#galleryCheckmark").html('');
        $(".gallery-container").html('');
        var html = '';
        if (items) {
            for (var i = 0; i < items.data.length; i++) {
                if (i == 0 || i == 3 || i == 6 || i == 9) {
                    html += `<div class="row">`;
                }
                html += `<div class="gallery-column animated fadeIn shrink">  
                                <div class="gallery-imageContainer">                          
                                    <img  src="${items.data[i].urls.thumb}">
                                    <div class="img-hoverControls">
                                        <i class="fa fa-download downloadGalleryItem grow" data-imgId="${items.data[i].id}" title="download"></i>
                                        <i class="fa fa-image setGalleryItemDesktop grow" data-imgId="${items.data[i].id}" data-url="${items.data[i].urls.full}" data-userUrl="${items.data[i].user.links.html}" data-userName="${items.data[i].user.name}" title="set as wallpaper"></i>
                                        <input id="saveDirGallery_${items.data[i].id}" class="saveDirGallery" data-imgId="${items.data[i].id}" data-url="${items.data[i].links.download_location}" type="file" webkitdirectory style="display:none" />
                                        <p>by <br> <a class="openUrl grow"  onclick="openUrl('${items.data[i].user.links.html}')">${items.data[i].user.name}</a></p>
                                    </div> 
                                </div>                                                 
                        </div>`
                if (i == 2 || i == 5 || i == 8) {
                    html += `</div>`;
                }
            }
        }
        $(".gallery-container").html(html);
        resolve();
    })

}

function downloadGalleryItem(url, saveDir) {
    console.log(saveDir);
    ipcRenderer.send('downloadGalleryItem', {
        url: url,
        saveDir: saveDir
    });
}

function getSettings() {
    ipcRenderer.send('loadSettings')
}

function loadSettings(settings) {
    return new Promise(resolve => {
        $("#interval").val(settings.interval);
        if (settings.category.includes("@@CUSTOM")) {
            $("#category").val('custom');
            $("#customCategoryInput").val(settings.category.replace('@@CUSTOM', ''));
            $("#customCategoryInput").show();
        } else {
            $("#category").val(settings.category);
            $("#customCategoryInput").hide();
        }

        $("#startOnLogin").prop('checked', settings.startOnLogin);
        $("#saveOnDownload").prop('checked', settings.saveOnDownload);
        $("#saveOnDownload").change();
        $("#deletePrevImage").prop('checked', settings.deletePrevImage);
        $("#clearTimer").prop('checked', settings.clearTimer);
        $("#saveLocationInput").val(settings.saveLocation);
        resolve();
    });
}
window.addEventListener('load', function () {
    function sendConnectionStatus(event) {
        toggleOffline(navigator.onLine)
        ipcRenderer.send('online-status', navigator.onLine)
    }
    window.addEventListener('online', sendConnectionStatus);
    window.addEventListener('offline', sendConnectionStatus);
    sendConnectionStatus();
});