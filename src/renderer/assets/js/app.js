var customTypingTimer = null;
var lastIntervalMs = 180000;
var bar = new ProgressBar.Line(container, {
    strokeWidth: 1,
    easing: 'easeInOut',
    duration: 1400,
    color: '#1cb495',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: {
        width: '100%',
        height: '100%'
    },
    text: {
        style: {
            color: "white",
            position: 'absolute',
            top: '30px',
            padding: 0,
            transform: null,
        },
        autoStyleContainer: false
    },
    from: {
        color: '#ED6A5A'
    },
    to: {
        color: '#1cb495'
    },
    step: (state, bar) => {
        bar.setText(`
            DOWNLOADING UPDATE ... ${Math.round(bar.value() * 100)} %          
        `)
        bar.path.setAttribute('stroke', state.color);
    }
});

ipcRenderer.on('showProgress', (event, state) => {
    console.log(state);
    showProgress(state);
})

ipcRenderer.on('hideProgress', () => {
    hideProgress();
})

ipcRenderer.on('initCategories', (event, categories) => {
    var html = '';
    categories.forEach(element => {
        html += `<option value='${element.name}'>${element.label}</option>`
        // html += `<li><input type='checkbox' class='imageSourceCheckbox' value='${element.name}'/><span>${element.label}</span></li>`
    });
    $("#category").append(html);
    $("#category").multipleSelect({
        selectAll: false,
        allSelected: false,
        countSelected: false,
        onClick: function (view) {
            var checkedValues = $("#category").multipleSelect('getSelects');
            if (checkedValues.length < 1) {
                console.log(view)
                $("#category").multipleSelect('checkAll');
            }
            saveSettings('category', $("#category").multipleSelect('getSelects'));
        }
    })
})

ipcRenderer.on('initImageSources', (event, sources) => {
    // <input type="checkbox" value="Apple" />Apple</li>
    var html = '';
    sources.forEach(element => {
        html += `<option value='${element.name}'>${element.label}</option>`
        // html += `<li><input type='checkbox' class='imageSourceCheckbox' value='${element.name}'/><span>${element.label}</span></li>`
    });
    $("#sources").append(html);
    $("#sources").multipleSelect({
        selectAll: false,
        allSelected: false,
        countSelected: false,
        onClick: function (view) {
            var checkedValues = $("#sources").multipleSelect('getSelects');
            if (checkedValues.length < 1) {
                console.log(view)
                $("#sources").multipleSelect('checkAll');
            }
            saveSettings('sources', $("#sources").multipleSelect('getSelects'));
        }
    })
    setTimeout(() => {

        $(`input[data-name=selectItem][value='localLibrary'`).change(function () {
            if ($(this).is(":checked")) {
                $(".localLibraryLocationGroup").show();
            } else {
                $(".localLibraryLocationGroup").hide();
            }
        })

        $("#localLibraryLocationInput").click(function () {
            $("#localLibraryLocation").click();
        })

        $("#localLibraryLocation").change(function () {
            var p = document.getElementById('localLibraryLocation').files[0].path
            $("#localLibraryLocationInput").val(p);
            if (p.trim() != '') {
                saveSettings('localLibraryLocation', p);
            }
        })

        sources.forEach(element => {
            $(`input[data-name=selectItem][value='${element.name}']`).after(`<img src='./../renderer/assets/images/${element.logoPath.split(/(\\|\/)/g).pop()}' style='max-width:81px;vertical-align:middle'>`)
            // html += `<li><input type='checkbox' class='imageSourceCheckbox' value='${element.name}'/><span>${element.label}</span></li>`
        });
        $("#sources").next().find(".ms-drop li label span").hide();
    }, 1000)

})


ipcRenderer.on('updateAvailability', (event, available) => {
    if (available) {
        $(".updateNotifIcon").show();
    } else {
        $(".updateNotifIcon").hide();
    }
})

ipcRenderer.on('startUpdate', () => {
    updateApp();
})


ipcRenderer.on('wallpaper-changed', (evt, data) => {
    setAppBackground(data);
});

ipcRenderer.on('toggleLoading', (event, msg) => {
    msg = msg || " ";
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
            hideHeader();
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
            var apiLogoName = $(this).attr('data-apiLogoName');
            var apiRefUrl = $(this).attr('data-apiRefUrl');
            ipcRenderer.send('setGalleryItemAsBackground', {
                url: url,
                userName: userName,
                userUrl: userUrl,
                apiLogoName: apiLogoName,
                apiRefUrl: apiRefUrl
            });
        })
        $("#gallery-wrapper").show();
    })
});

ipcRenderer.on('settingsSaved', () => {
    showCheckMark("#checkmark");
})
//close update popup
$('.c-modal').on('click', function (event) {
    if ($(event.target).is('.c-modal-close') || $(event.target).is('.c-modal')) {
        event.preventDefault();
        $(this).removeClass('is-visible');
    }
});

$(document).keyup(function (event) {
    //close update popup when clicking the esc keyboard button
    if (event.which == '27') {
        $('.c-modal').removeClass('is-visible');
    }
    //arrow right
    else if (event.which == '39') {
        ipcRenderer.send('next');
    }
    //space
    else if (event.which == '32') {
        playbackToggle();
    }
});
$(".updateNotifIcon").click(() => {
    $('.c-modal').addClass('is-visible');
})

$(".installUpdate").click(() => {
    updateApp();
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
        $("#customGalleryCategoryInput").focus();
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
        hideHeader();
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
        showHeader();
})

$(".closeGallery").click(() => {
    // ipcRenderer.send("left-settings");
    $("#gallery-wrapper").hide();
    if (!$("#minimized").is(":visible"))
        showHeader();
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
        $('.inner').animate({
            scrollTop: $('.saveLocationGroup').offset().top
        }, 1000);
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
    playbackToggle();
})


$('#interval').change(function () {
    var val = $(this).val();
    var opt = $(this).attr('id');

    if (opt == "interval" && val != 0)
        lastIntervalMs = val;

    // if (opt == "category") {
    //     if (val == "custom") {
    //         $("#customCategoryInput").show();
    //         $("#customCategoryInput").focus();
    //     } else {
    //         $("#customCategoryInput").hide();
    //         $("#customCategoryInput").val('');
    //     }
    // }
    if (val != "custom") {
        saveSettings(opt, val);
    }

})

$(".addCustomCategory").click(function () {
    var value = $('#customCategoryInput').val();
    if (value.trim() != "" && value.length > 2 && !$("#category").next().find(".ms-drop ul li label").find(`input[value=${"\\@\\@CUSTOM"+value.toLowerCase()}]`).length > 0) {
        var customCategoryInput = `@@CUSTOM${$('#customCategoryInput').val().toLocaleLowerCase()}`
        var html = `<option value='${customCategoryInput}'>${$('#customCategoryInput').val()}</option>`
        $("#category").append(html);
        $('#category').multipleSelect('refresh');

        $(`input[data-name=selectItem][value=${"\\@\\@CUSTOM"+value.toLowerCase()}]`).click();
        refreshCustomCategories();
    }
    $('#customCategoryInput').val('')
})

$(".open-url").click(function () {
    openUrl($(this).attr('data-url'));
})


var toggleWraper = () => {
    $("#minimized").toggle();
    toggleHeader();
    $("#bg").toggleClass("bg");
    $("#settings").hide();
    $("#gallery-wrapper").hide();
}

function playbackToggle() {
    var ms = 0;
    if ($(".playback-toggle").hasClass("fa-play")) {
        ms = lastIntervalMs;
    }
    saveSettings('interval', ms).then(() => {
        if ($("#settings").is(":visible")) {
            getSettings();
        }
    });
}

function updateApp() {
    $('.c-modal').removeClass('is-visible');
    $(".updateNotifIcon").hide();
    ipcRenderer.send('updateApp');
}

function toggleHeader() {
    if ($("#header").is(":visible")) {
        hideHeader();
    } else {
        showHeader();
    }
}

function showHeader() {
    $("#header").show();
    window.setTimeout(function () {
        $("body").removeClass('preload');
    }, 200);
}

function hideHeader() {
    $("body").addClass("preload");
    $("#header").hide();
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
    message = message || ' ';
    $(".loadingHeader").html(message);
    $(".fade").toggle();
    $(".loading").toggle();
}

function showProgress(state) {
    bar.animate(state.percent);
    if (!$(".fade").is(":visible")) {
        $(".fade").show();
    }
    if (!$(".progBar").is(":visible")) {
        $(".progBar").show();
    }
}

function hideProgress(state) {
    $(".fade").hide();
    $(".progBar").hide();
    bar.set(0);
}

function openUrl(url) {
    require('electron').shell.openExternal(url);
}

function setAppBackground(photo) {
    return new Promise((resolve) => {


        //avoid showing the previous cached image        
        $("#bgPicture").attr("src", photo.photoPath + "?" + Date.now());
        console.log("hi " + photo)
        if (photo.userName && photo.userName != '') {
            $(".photoCredit").html(`photo by: <a onclick="openUrl('${photo.userUrl}')" class="openUrl" style="padding-left:3px;vertical-align:0"> ${photo.userName} </a>
            <i title="save image" id="downloadCurrentWallpaperIcon" class="fa roundedIcon shrink fa-download" style="margin-left: 5px;font-size: 11px;
"></i><input id="downloadCurrentWallpaper" class="downloadCurrentWallpaper" type="file" webkitdirectory="" style="display:none">`);
            $(".photoCredit").removeClass("hidden");
        } else {
            $(".photoCredit").html('');
            $(".photoCredit").addClass("hidden");
        }
        console.log(photo);
        $('.api-logo').attr('data-url', photo.apiRefUrl || "");
        $('.api-logo > img').attr('src', `./../renderer/assets/images/${photo.apiLogoName}`);
        if ($("#gallery-wrapper").is(":visible")) {
            showCheckMark("#galleryCheckmark");
        }
        $("#downloadCurrentWallpaperIcon").unbind('click');
        $("#downloadCurrentWallpaperIcon").click(function () {
            $("#downloadCurrentWallpaper").click();
        })

        $("#downloadCurrentWallpaper").unbind('change')
        $("#downloadCurrentWallpaper").change(function(){          
            var p = document.getElementById("downloadCurrentWallpaper").files[0].path + `\\photo_${Date.now()}.jpg`
            console.log(p)
            if (p.trim() != '') {
                ipcRenderer.send("downloadCurrentWallpaper",p);
            }
        })
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
        if (!items || items.length <= 0) {
            showHeader();
        } else {
            $("#galleryCheckmark").html('');
            $(".gallery-container").html('');
            var html = '';
            console.log(items)
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    if (i == 0 || i == 3 || i == 6 || i == 9) {
                        html += `<div class="row">`;
                    }
                    html += `<div class="gallery-column animated fadeIn shrink">  
                                    <div class="gallery-imageContainer">                          
                                        <img class='galleryImage' src="${items[i].smallPhotoUrl}">
                                        <div class="img-hoverControls">
                                            <i class="fa fa-download downloadGalleryItem grow" data-imgId="${items[i].photoId}" title="download"></i>
                                            <i class="fa fa-image setGalleryItemDesktop grow" data-apiRefUrl="${items[i].apiRefUrl}" data-apiLogoName="${items[i].apiLogoName}" data-imgId="${items[i].photoId}" data-url="${items[i].photoUrl}" data-userUrl="${items[i].userUrl}" data-userName="${items[i].userName}" title="set as wallpaper"></i>
                                            <input id="saveDirGallery_${items[i].photoId}" class="saveDirGallery" data-imgId="${items[i].photoId}" data-url="${items[i].photoUrl}" type="file" webkitdirectory style="display:none" />
                                            <p>by <a class="openUrl"  onclick="openUrl('${items[i].userUrl}')">${items[i].userName}</a></p>
                                            <img src='./../renderer/assets/images/${items[i].apiLogoPath.split(/(\\|\/)/g).pop()}' style='max-width:81px;position:relative;display:block;margin:auto;top:-20%'>
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
        }
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

function refreshCustomCategories() {
    $(".removeCustomCategory").unbind('click');
    $(".removeCustomCategory").each(function () {
        $(this).remove();
    })
    $("#category").next().find(".ms-drop ul li label").find('input[value*="\\@\\@CUSTOM"]').each(function () {
        $(this).parent().after(`<span><i title="remove from list" class="fa fa-minus roundedIcon removeCustomCategory shrink" data-which="${$(this).val()}" style="font-size:9px;color:#d05656;background:white;margin-left:10px"></i></span>`)
    })
    $(".removeCustomCategory").click(function () {
        console.log($(this).attr('data-which'));
        var checkedValues = $("#category").multipleSelect('getSelects');
        $(`#category option[value=${$(this).attr('data-which').replace("@@CUSTOM","\\@\\@CUSTOM")}`).remove();
        $('#category').multipleSelect('refresh');
        refreshCustomCategories();
        if (checkedValues.length <= 1) {
            $("input[data-name=selectItem][value='" + "landscapes" + "']").click();
        }
        saveSettings('category', $("#category").multipleSelect('getSelects'));
    })
}

function loadSettings(settings) {
    return new Promise(resolve => {
        $("#interval").val(settings.interval);
        console.log(settings)
        // if (settings.category.includes("@@CUSTOM")) {
        //     $("#category").val('custom');
        //     $("#customCategoryInput").val(settings.category.replace('@@CUSTOM', ''));
        //     $("#customCategoryInput").show();
        // } else {
        //     $("#category").val(settings.category);
        //     $("#customCategoryInput").hide();
        // }

        $("#startOnLogin").prop('checked', settings.startOnLogin);
        $("#saveOnDownload").prop('checked', settings.saveOnDownload);
        $("#saveOnDownload").change();
        $("#deletePrevImage").prop('checked', settings.deletePrevImage);
        $("#clearTimer").prop('checked', settings.clearTimer);
        $("#saveLocationInput").val(settings.saveLocation);
        $("#localLibraryLocationInput").val(settings.localLibraryLocation)
        //image sources
        //uncheck every checkbox @ first
        $("#sources").multipleSelect('uncheckAll');
        $("#category").multipleSelect('uncheckAll');

        var items = 0;
        settings.category.forEach((element, i, array) => {

            if (element.includes('@@CUSTOM')) {
                if (!$("#category").next().find(".ms-drop ul li label").find(`input[value=${element.replace("@@CUSTOM","\\@\\@CUSTOM")}]`).length > 0) {
                    var html = `<option value='${element}'>${element.replace('@@CUSTOM','')}</option>`
                    $("#category").append(html);
                    $('#category').multipleSelect('refresh');
                }
            }
            $("input[data-name=selectItem][value='" + element + "']").click();
            items++;
            if (items == array.length) {
                refreshCustomCategories();
                console.log('yo');
            }

        })

        // $(".removeCustomCategory").click(function () {
        //     console.log($(this).attr('data-which'));
        //     $(`#category option[value=${$(this).attr('data-which').replace("@@CUSTOM","\\@\\@CUSTOM")}`).remove();
        //     $('#category').multipleSelect('refresh');
        //     saveSettings('category', $("#category").multipleSelect('getSelects'));
        // })
        settings.sources.forEach(element => {
            $("input[data-name=selectItem][value='" + element + "']").click();
        });
        resolve();
    });
}
window.addEventListener('load', function () {
    window.setTimeout(function () {
        document.querySelector('body').classList.remove('preload');
    }, 500);

    function sendConnectionStatus(event) {
        toggleOffline(navigator.onLine)
        ipcRenderer.send('online-status', navigator.onLine)
    }
    window.addEventListener('online', sendConnectionStatus);
    window.addEventListener('offline', sendConnectionStatus);
    sendConnectionStatus();

});