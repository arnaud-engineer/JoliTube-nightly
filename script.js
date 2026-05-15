var range = n => [...Array(n).keys()]

/* Randomize array in-place using Durstenfeld shuffle algorithm : https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


        class AppPreferences
        {
            constructor() {
                this.fullscreenStatus = false;


                this.theaterOn = true;

                this.hidingTimerOn = false;
                this.NbHidingTimer = 0;
                this.displayTimerOn = false;
                this.NbDisplayTimer = 0;
                this.noUserInterraction = true;
                this.userNotChoosingSubtitles = true;
                this.userNotChoosingSpeed = true;
                this.cursorOnInterface = false;

                this.totalTimeToHide = 4000;



                //current channel
                this.playName = null;
                this.playlistID = null;
                this.logo = null;
                this.channelNum = 1;
                this.displayChannelNum = "01";
                this.currentChannelCuratorName = null;
                this.currentChannelCuratorURL = null;
                this.prevChannelNum = 1;
                this.channelArrowNavigationTracker = 0;

                this.firstVideoLoaded = false;
                this.firstVideoDebug = false;

                this.playerIndexInitAttempt = 0;
                this.playerInitAttemptPassed = false;
                this.nextVideoInitAttemptPassed = false;



                this.remoteDigitBuffer = null;
                this.remoteDigitSingleton = false;

                this.nbVideoCurrentChannel = null;



                //current Video

                this.currentVideoIndex = null;
                this.videoIndexBeforePlayerDisplay = null;
                this.videoIdBeforePlayerDisplay = null;
                this.videoDisplayTimer = null;

                this.randomPlaylist = [];
                this.alreadyPlayed = [];
                this.alreadyPlayedErrors = [];
                this.navigationHistory = [];
                this.navigationCursor = -1;
                this.navigationTransition = false;
                this.navigationTransitionReason = null;
                this.navigationTransitionStartedAt = null;
                this.navigationTransitionHardResetCount = 0;
                this.navigationTransitionDiagnostics = null;
                this.lastNavigationTransitionDiagnostics = null;
                this.navigationTransitionAnomalies = [];
                this.navigationPlaylistLengths = {};
                this.navigationPlaylistVideos = {};
                this.playlistReady = false;
                this.autoplayStatus = {
                    browserPolicySupported: false,
                    mediaElementPolicy: "unknown",
                    audioContextPolicy: "unknown",
                    youtubeElementPolicy: "unknown",
                    youtubePlayback: "unknown",
                    youtubePlaybackBeforeGesture: "unknown",
                    youtubePlaybackAfterGesture: "unknown",
                    audibleAutoplay: "unknown",
                    userGestureSeen: false,
                    firstUserGestureAt: null,
                    lastUpdatedAt: null,
                    lastReason: null,
                };

                this.currentBackToTheFutureCount = 0;



                this.videoTitle = null;
                this.videoAuthor = null;
                this.videoUrl = null;
                this.videoYtId = null;


                this.currentQuality = null;
                this.availablesQualities = null;

                this.priorityToMaxRes = true;
                this.userSelectedMaxRes = "hd2160";

                this.muteOn = false;
                this.volume = 100;

                this.speed = 1;



                this.playing = false;



                this.inputForbidden = false;



                this.userIsUpdatingTimeCode = false;


                this.eventsTimer = null;


                this.subtitlesOn = null;
                this.currentSubtitlesLanguage = null;
                this.subtitlesPrefList = ["off", "fr", "en-US"];
                this.subtitlesPrefMatrice = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
                this.subtitlesManuallySelected = false;


                this.subtitlesLoadingAttempts = 0;






                this.videoHistory = [];





                this.playerFullyChargedSingleton = false;
                this.searchSingleton = false;
                this.videoDisplayed = false;
                this.historyEditionSingleton = false;
            }
        }

        var app = new AppPreferences();


/* =========================================================================
    GLOBAL VARIABLES
   ========================================================================= */

    //Playback variables

    var videotime = 0;

    //YouTube player required variables
    var player;
    var tag;
    var firstScriptTag;
    var num;

/* =========================================================================
    FUNCTIONS
   ========================================================================= */

    /*  ----------------------------------------
         SHOW / HIDE INTERFACE
        ---------------------------------------- */

function getVideoIdFromPlayerUrl(videoUrl) {
    if(!videoUrl) {
        return null;
    }

    const match = videoUrl.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
}

function escapeVideoTitleMarkup(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;",
        }[character];
    });
}

function getChannelUiController() {
    return window.JoliTubeRuntime?.channelUiController;
}

function getInterfaceVisibilityController() {
    return window.JoliTubeRuntime?.interfaceVisibilityController;
}

function getPlayerControlsController() {
    return window.JoliTubeRuntime?.playerControlsController;
}

function getYouTubeSettingsLoader() {
    return window.JoliTubeRuntime?.youTubeSettingsLoader;
}

function getSafePlayerPlaylist() {
    try {
        return typeof player?.getPlaylist === "function"
            ? player.getPlaylist() || []
            : [];
    } catch(e) {
        return [];
    }
}

function isStableVideoReadyToDisplay(expectedIndex, expectedVideoId) {
    if(
        app.playlistReady !== true
        || app.navigationTransition === true
        || expectedIndex == null
        || !expectedVideoId
    ) {
        return false;
    }

    try {
        const currentIndex = typeof player?.getPlaylistIndex === "function"
            ? player.getPlaylistIndex()
            : null;
        const currentVideoId = typeof player?.getVideoUrl === "function"
            ? getVideoIdFromPlayerUrl(player.getVideoUrl())
            : null;
        const ytPlaylist = getSafePlayerPlaylist();

        return player.getPlayerState() === 1
            && currentIndex === expectedIndex
            && currentVideoId === expectedVideoId
            && ytPlaylist[currentIndex] === expectedVideoId;
    } catch(e) {
        return false;
    }
}

function clearVideoDisplayTimer(reason) {
    if(app.videoDisplayTimer) {
        clearInterval(app.videoDisplayTimer);
        app.videoDisplayTimer = null;

        console.log("[JT] video display timer cleared", { reason });
    }
}

function showVideo() {
    if(app.videoDisplayed !== false) {
        return;
    }

    if(
        app.playlistReady !== true
        || app.navigationTransition === true
        || app.currentVideoIndex == null
        || !app.videoYtId
    ) {
        return;
    }

    clearVideoDisplayTimer("new showVideo request");

    const expectedIndex = app.currentVideoIndex;
    const expectedVideoId = app.videoYtId;
    app.videoIndexBeforePlayerDisplay = expectedIndex;
    app.videoIdBeforePlayerDisplay = expectedVideoId;

    app.videoDisplayTimer = setInterval(function() {
        if(
            app.playlistReady !== true
            || app.navigationTransition === true
            || app.currentVideoIndex !== expectedIndex
            || app.videoYtId !== expectedVideoId
        ) {
            clearVideoDisplayTimer("display request superseded");
            return;
        }

        if(isStableVideoReadyToDisplay(expectedIndex, expectedVideoId)) {
            app.videoDisplayed = true;
            document.getElementById("playerContainer").classList.remove("hidden");
            document.getElementById("playerContainer").classList.add("displayed");
            updateAllData();
            app.playerInitAttemptPassed = true;
            app.nextVideoInitAttemptPassed = true;
            clearVideoDisplayTimer("stable video displayed");
            getVideoYouTubeId();
        }
    }, 100);
}

function hideVideo() {
    clearVideoDisplayTimer("hideVideo");
    app.videoDisplayed = false;
    app.videoIndexBeforePlayerDisplay = null;
    app.videoIdBeforePlayerDisplay = null;
    document.getElementById("playerContainer").classList.remove("displayed");
    document.getElementById("playerContainer").classList.add("hidden");
    app.nextVideoInitAttemptPassed = false;
    hideVideoTitle();
    getYouTubeSettingsLoader()?.hideCaptions();
}

        // LOAD THE N INDEX VIDEO
        function loadVideo(videoIndex)
        {
            console.group("[JT] loadVideo()");
        
            console.log("requested videoIndex", videoIndex);
        
            console.log(
                "currentVideoIndex BEFORE",
                app.currentVideoIndex
            );
        
            console.log(
                "videoYtId BEFORE",
                app.videoYtId
            );
        
            console.log(
                "alreadyPlayed",
                structuredClone(app.alreadyPlayed)
            );
        
            console.log(
                "randomPlaylist",
                structuredClone(app.randomPlaylist)
            );
        
            try {
                console.log(
                    "YT playlist index BEFORE",
                    player.getPlaylistIndex()
                );
        
                console.log(
                    "YT player state BEFORE",
                    player.getPlayerState()
                );
        
                console.log(
                    "YT current time",
                    player.getCurrentTime()
                );
            } catch(e) {
                console.warn("YT state unavailable", e);
            }
        
            app.currentVideoIndex = videoIndex;
        
            const currentVideo =
                app.playlist[videoIndex];
        
            app.videoYtId = currentVideo.id;
        
            console.log(
                "currentVideoIndex AFTER",
                app.currentVideoIndex
            );
        
            console.log(
                "videoYtId AFTER",
                app.videoYtId
            );
        
            console.log(
                "currentVideo object",
                currentVideo
            );
        
            player.loadVideoById(app.videoYtId);
        
            console.log("YT loadVideoById SENT");
        
            console.groupEnd();
        }

        function updateAllData()
        {
            updateVideoTitle();
            updateDuration();
            getPlayerControlsController()?.updatePlayerState();
            getYouTubeSettingsLoader()?.loadQuality();
            getYouTubeSettingsLoader()?.loadCaptions();
            getChannelUiController()?.updateChannelData();
            getPlayerControlsController()?.refreshVolume();
        }

        function updateRealTimeData()
        {
            updateDuration();
            getPlayerControlsController()?.refreshVolume();
            getPlayerControlsController()?.updatePlayerState();
        }

        function updateDuration()
        {
            var whileVideoDurationNotFullyCharged = setInterval(function()
            {
                try
                {
                    let d = player.getDuration();
                    if(app.userIsUpdatingTimeCode === false && d >=0)
                    {
                        let dTimeCode = d;
                        let durationHH = Math.floor(d / 60 / 60);
                        let durationMM = Math.floor((d % 3600) / 60);
                        let durationSS = Math.floor(d % 60);

                        if(durationHH < 10 && durationHH !== 0) {
                            durationHH = "0" + durationHH;
                        }
                        if(durationMM < 10) {
                            durationMM = "0" + durationMM;
                        }
                        if(durationSS < 10) {
                            durationSS = "0" + durationSS;
                        }

                        if(durationHH !== 0) {
                            d = durationHH + ":" + durationMM + ":" + durationSS;
                        }
                        else {
                            d = durationMM + ":" + durationSS;
                        }
                        document.getElementById("currentVideoDuration").innerHTML = d;

                        let t = player.getCurrentTime();
                        let tTimeCode = t;
                        videotime = t;
                        let timecodeHH = Math.floor(t / 60 / 60);
                        let timecodeMM = Math.floor((t % 3600) / 60);
                        let timecodeSS = Math.floor(t % 60);

                        if(timecodeHH < 10 && timecodeHH !== 0) {
                            timecodeHH = "0" + timecodeHH;
                        }
                        if(timecodeMM < 10) {
                            timecodeMM = "0" + timecodeMM;
                        }
                        if(timecodeSS < 10) {
                            timecodeSS = "0" + timecodeSS;
                        }


                        if(durationHH !== 0) {
                            t = timecodeHH + ":" + timecodeMM + ":" + timecodeSS;
                        }
                        else {
                            t = timecodeMM + ":" + timecodeSS;
                        }
                        document.getElementById("currentVideoTime").innerHTML = t;


                        // CURSOR UPDATE
                        document.getElementById("progressionBar").max = Math.round(dTimeCode * 100);
                        document.getElementById("progressionBar").value = Math.round(tTimeCode * 100);
                        document.getElementById("webkitProgressFill").style.width = (tTimeCode / dTimeCode * 100) + "%";

                        let loadedPercent = Math.round(player.getVideoLoadedFraction() * 100);
                        document.getElementById("loadingFill").style.width = loadedPercent + "%";

                        if(player.getCurrentTime() > 0) {
                            showVideo();
                        }

                        clearInterval(whileVideoDurationNotFullyCharged);
                    }
                } catch(e) {}
            }, 20);
            
        }

        // UPDATE THE VIDEO TITLE IN THE CONTROL PANEL
        function updateVideoTitle(reason = "metadata refresh", attempt = 0)
        {
            const maxAttempts = 25;

            try {
                const videoData = typeof player?.getVideoData === "function"
                    ? player.getVideoData() || {}
                    : {};
                const playerInfoVideoData = player?.playerInfo?.videoData || {};
                const videoUrl = typeof player?.getVideoUrl === "function"
                    ? player.getVideoUrl()
                    : "";
                const urlVideoId = getVideoIdFromPlayerUrl(videoUrl);
                const dataVideoId =
                    videoData.video_id
                    || videoData.videoId
                    || playerInfoVideoData.video_id
                    || playerInfoVideoData.videoId
                    || null;
                const title = videoData.title || playerInfoVideoData.title || "";
                const author = videoData.author || playerInfoVideoData.author || "";
                const titleDisplay = document.getElementById("currentVideoNameDisplay");
                const metadataBelongsToCurrentUrl =
                    !urlVideoId
                    || dataVideoId === urlVideoId
                    || (!dataVideoId && attempt >= maxAttempts);

                if(
                    !titleDisplay
                    || title.length === 0
                    || videoUrl.length === 0
                    || !metadataBelongsToCurrentUrl
                ) {
                    if(attempt < maxAttempts) {
                        setTimeout(function() {
                            updateVideoTitle(reason, attempt + 1);
                        }, 40);
                    }
                    else {
                        console.warn("[JT] video title update skipped: metadata not stable", {
                            reason,
                            title,
                            videoUrl,
                            urlVideoId,
                            dataVideoId,
                        });
                    }
                    return false;
                }

                app.videoAuthor = author;
                app.videoTitle = title;
                app.videoUrl = videoUrl;

                const authorText = app.videoAuthor.length > 0
                    ? "<span id='currentVideoSeparator'>➥</span><span id='currentVideoAuthor'>" + escapeVideoTitleMarkup(app.videoAuthor) + "</span>"
                    : "";
                const elHtml = "<a href='" + escapeVideoTitleMarkup(app.videoUrl) + "' target='_blank' rel='noopener noreferrer'><span id='animatedBanner'>" + escapeVideoTitleMarkup(app.videoTitle) + authorText + "</span></a>";

                titleDisplay.innerHTML = elHtml;

                console.log("[JT] video title updated", {
                    reason,
                    videoTitle: app.videoTitle,
                    videoAuthor: app.videoAuthor,
                    videoUrl: app.videoUrl,
                    videoId: urlVideoId,
                });

                return true;
            } catch(e) {
                if(attempt < maxAttempts) {
                    setTimeout(function() {
                        updateVideoTitle(reason, attempt + 1);
                    }, 40);
                }
                else {
                    console.warn("[JT] video title update failed", { reason, error: e });
                }
                return false;
            }
        }

        window.JoliTubeUpdateVideoTitle = updateVideoTitle;

        function hideVideoTitle() { document.getElementById("currentVideoNameDisplay").innerHTML = ""; }



    /* -----------------------------
        CHANNEL LOADING
       ----------------------------- */

    /* -----------------------------
        YOUTUBE PLAYER LOADING
       ----------------------------- */

        // FUNCTION TO CALL FOR PLAYER INITIALISATION
        function initYT()
        {
            // SRC : https://developers.google.com/youtube/iframe_api_reference#Getting_Started

            // Loading of the IFrame Player API code (asynchronous)
            tag = document.createElement('script');

            tag.src = "https://www.youtube.com/iframe_api";
            firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // Call of the YouTube API
            //onYouTubeIframeAPIReady();

        }

        var responseText = null;

        // CALL THE YOUTUBE API TO GET A PLAYER
        function onYouTubeIframeAPIReady()
        {
            console.log("YT global", window.YT);
            app.alreadyPlayed = [];
            app.alreadyPlayedErrors = [];
            
                try
                {
                    // Instanciation of the player
                    player = new YT.Player('player', {
                        host: 'https://www.youtube-nocookie.com',
                        events: {
                            'onReady': onPlayerReady,
                            'onStateChange': onPlayerStateChange,
                            'onError': onPlayerError
                        },
                        playerVars: {
                            origin: window.location.origin,
                            controls: 0,
                            modestbranding: 1,
                            playsinline: 1,
                            //rel: 0,
                            enablejsapi: 1,
                            list: app.playlistID,
                            index: app.playerIndexInitAttempt
                        }
                    });
                    document.getElementById("player").src += "?rel=0";
                    console.log("[JT] YouTube API READY");
                } catch(e) {}
            


                
        }


/* =========================================================================
    PAGE LOADING
   ========================================================================= */

	document.addEventListener('DOMContentLoaded', function(event)
	{
	    hideVideo();

	    let firstChToLoad = 1;
	    if(window.location.hash.length > 0) {
	        firstChToLoad = parseInt(window.location.hash.substring(1));
	    }

	    if(!Number.isInteger(firstChToLoad) || firstChToLoad < 1 || firstChToLoad > channelList.length) {
	        firstChToLoad = 1;
	    }

	    getChannelUiController()?.initializeFirstChannel(firstChToLoad);
	    getChannelUiController()?.renderMenu();

    window.JoliTubeNavigation?.detectAutoplayPolicy?.(app, player, "DOMContentLoaded");

    // YouTube player boot. The first channel will be loaded from onPlayerReady().
    initYT();

    window.addEventListener("message", function(event) {
        try {
            updateDuration();
        }
        catch(e) {}
    });    
});


/* =========================================================================
    EVENT LISTENERS
   ========================================================================= */

    // FIRST LOADING
    function onPlayerReady(event)
    {
        console.log("[JT] Player READY");
    
        try
        {
            player.setPlaybackRate(app.speed);
    
            document.getElementById("player")
                .removeAttribute("allowfullscreen");
    
            document.getElementById("player")
                .setAttribute("allowFullScreen", "");
    
            app.realTimeDataMonitored = true;
            window.JoliTubeNavigation?.detectAutoplayPolicy?.(app, player, "YT player ready");
    
            // Prevent double boot
            if(!app.firstVideoLoaded)
            {
                app.firstVideoLoaded = true;
    
                console.log(
                    "[JT] Booting first channel",
                    app.channelNum
                );
    
                getChannelUiController()?.requestChannelLoad(app.channelNum);
            }
    
        } catch(e) {
            console.error(
                "[JT] onPlayerReady failed",
                e
            );
        }
    }

    // AT THE END OF THE CURRENT VIDEO
        function onPlayerStateChange(event)
        {
            console.group("[JT] onPlayerStateChange()");
        
            const states = {
                [-1]: "UNSTARTED",
                [0]: "ENDED",
                [1]: "PLAYING",
                [2]: "PAUSED",
                [3]: "BUFFERING",
                [5]: "CUED",
            };
        
            console.log("event.data", event.data);
        
            console.log(
                "STATE",
                states[event.data] || event.data
            );
        
            console.log(
                "currentVideoIndex",
                app.currentVideoIndex
            );
        
            console.log(
                "videoYtId",
                app.videoYtId
            );
        
            console.log(
                "alreadyPlayed",
                structuredClone(app.alreadyPlayed)
            );
        
            console.log(
                "randomPlaylist",
                structuredClone(app.randomPlaylist)
            );
        
            try {
                console.log(
                    "YT playlist index",
                    player.getPlaylistIndex()
                );
        
                console.log(
                    "YT player state",
                    player.getPlayerState()
                );
        
                console.log(
                    "YT current time",
                    player.getCurrentTime()
                );
        
                console.log(
                    "YT video url",
                    player.getVideoUrl()
                );
            } catch(e) {
                console.warn("YT runtime unavailable", e);
            }
        
            console.groupEnd();
        
            if(event.data == 0) {
                getPlayerControlsController()?.nextVideo();
            }
        }

    // AT ERROR (when the video has been delete, got private or forbidden
    // of embdeding)
    function onPlayerError(event)
    {
        hideVideo();
        let codeError = event.data;
        switch(parseInt(event.data)) {
            case 2 :
                console.warn("YT PLAYER ERROR : " + event.data + " -> Incorrect request parameter (ex : the ID player does not have a right number of caracters or incorrect one such as '/')");
                break;
            case 5 :
                console.warn("YT PLAYER ERROR : " + event.data + " -> Generic HTML5 player error happened or the content can't be loaded in the HTML5 player");
                break;
            case 100 :
                console.warn("YT PLAYER ERROR : " + event.data + " -> Unavailable video (removed or private)");
                break;
            case 101 :
                console.warn("YT PLAYER ERROR : " + event.data + " -> Video not authorized on the iFrame Player API");
                break;
            case 150 :
                console.warn("YT PLAYER ERROR : " + event.data + " -> Video not authorized on the iFrame Player API (same as error 101, but 'masked' ...)");
                break;
            default :
                console.warn("YT PLAYER ERROR : " + event.data + " -> UNKNOWN ERROR");
                break;
        }

        // Add the video to the errors to prevent replay with the previous button
        if(app.alreadyPlayed.length > 0) {
            app.alreadyPlayedErrors.unshift(app.alreadyPlayed.shift());
            // Play next video
            try {
                getPlayerControlsController()?.nextVideo();
                getPlayerControlsController()?.playChannel();
            } catch(e) {}
        }
        else {
            app.alreadyPlayedErrors.unshift(app.playerIndexInitAttempt);
            app.playerIndexInitAttempt++;
            getChannelUiController()?.requestChannelLoad(app.channelNum);
        }
    }










function createPlaylistOrder() {
    let n = range(parseInt(app.nbVideoCurrentChannel));

    app.alreadyPlayedErrors.sort();
    let NbRemovedErrors = 0;
    for(let i=0 ; i<app.alreadyPlayedErrors.length ; i++) {
        n.splice(app.alreadyPlayedErrors[i] - NbRemovedErrors, 1);
        NbRemovedErrors++;
    }

    app.randomPlaylist = shuffleArray(n);
}





/*
setTimeout(() => {
    document.getElementById("alertMsg").style.display = "none";
}, 5000);

setTimeout(() => {}, 5000);

*/



async function getVideoYouTubeId() {
    if(app.historyEditionSingleton === false) {
        app.historyEditionSingleton = true;
        return await new Promise(resolve => {
            const whileUnknownYtID = setInterval(() => {
                if(app.historyEditionSingleton === true)
                {
                    var res = null;
                    try {
                        res = player.playerInfo.videoData.video_id;
                    } catch(e) {}
                    if (res !== null && res !== undefined && (!app.videoHistory.includes(res))) {
                        app.videoYtId = res;
                        app.videoHistory.unshift(app.videoYtId);
                        resolve(app.videoYtId);
                        app.historyEditionSingleton = false;
                        clearInterval(whileUnknownYtID);
                    }
                    else if(app.videoHistory.includes(res) && res !== app.videoYtId) {
                        resolve(null);
                        app.historyEditionSingleton = false;
                        clearInterval(whileUnknownYtID);
                        getPlayerControlsController()?.nextVideo();
                    }
                }
            }, 20);
        });
    }
    else { return; } 
}


/*
function storeVideoYouTubeId()
{
    if(app.historyEditionSingleton === false) {
        app.historyEditionSingleton = true;
        var whileUnknownYtID = setInterval(function() {
        try {
            let vidId = player.playerInfo.videoData.video_id;
            if(app.historyEditionSingleton === true && vidId !== undefined && vidId !== app.videoYtId) {
                app.videoYtId = vidId;
                if(app.historyEditionSingleton === true && app.videoHistory.includes(vidId)) {
                    getPlayerControlsController()?.nextVideo();
                    clearInterval(whileUnknownYtID);
                    app.historyEditionSingleton = false;
                } else if(app.historyEditionSingleton === true) {
                    app.videoHistory.push(vidId);
                    clearInterval(whileUnknownYtID);
                    app.historyEditionSingleton = false;
                }
            }
        } catch(e) {}
    }, 20);
    }
}
*/
