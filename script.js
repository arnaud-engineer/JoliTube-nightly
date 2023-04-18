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

                this.randomPlaylist = [];
                this.alreadyPlayed = [];
                this.alreadyPlayedErrors = [];

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


                this.feedbackTimer = null;



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
                this.feedbackTimerDuration = 2000;
                this.videoDisplayed = false;
                this.alertSingleton = false;
                this.historyEditionSingleton = false;
            }
        }

        var app = new AppPreferences();


        function updateLanguagesRanks(cLang) {
            for(let i=0 ; i < app.subtitlesPrefList.length ; i++) {
                //console.log(cLang + " : " + app.subtitlesPrefMatrice[cLang][i] + " -- VS -- " + i + " : " + app.subtitlesPrefMatrice[i][cLang]);
                if(app.subtitlesPrefMatrice[cLang][i] > app.subtitlesPrefMatrice[i][cLang]) {
                    if (cLang > i) {
                        app.subtitlesPrefList.splice(i, 0, app.subtitlesPrefList.splice(cLang, 1)[0]);
                        app.subtitlesPrefMatrice.splice(i, 0, app.subtitlesPrefMatrice.splice(cLang, 1)[0]);
                    }
                }
            }
        }


        function updateLanguagesStats(cLang, availableTracks)
        {
            for(let i=0 ; i < app.subtitlesPrefMatrice[cLang].length ; i++) {
                for(let j=0 ; j < availableTracks.length ; j++) {
                    if(app.subtitlesPrefList[i] === availableTracks[j].languageCode) {
                        app.subtitlesPrefMatrice[cLang][i]++;
                    }
                }
                if(app.subtitlesPrefList[i] === "off") {
                    app.subtitlesPrefMatrice[cLang][app.subtitlesPrefList.indexOf("off")]++;
                } 

            }
            updateLanguagesRanks(cLang);
            //console.log(app.subtitlesPrefList);
            //console.log(app.subtitlesPrefMatrice);
        }




        function userTimeCodeSingleton() {
            userIsUpdatingTimeCode = true;
        }

        function userChangesTimeCode() {
            try {
                if(event.target.value >= 0) {
                    let newTimeCode = Math.round(event.target.value / 100);
                    player.seekTo(newTimeCode, true);
                }
            } catch(e) {}
            userIsUpdatingTimeCode = false;
        }

        function forwardInVideo() {
            try {
                if(player.getCurrentTime() >= 0) {
                    let newTimeCode = Math.round(player.getCurrentTime() + 5);
                    player.seekTo(newTimeCode, true);
                }
            } catch(e) {}
            userIsUpdatingTimeCode = false;
            showInterface();
        }

        function backwardInVideo() {
            try {
                if(player.getCurrentTime() >= 0) {
                    let newTimeCode = Math.round(player.getCurrentTime() - 5);
                    player.seekTo(newTimeCode, true);
                }
            } catch(e) {}
            userIsUpdatingTimeCode = false;
            showInterface();
        }

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

    /* -----------------------------
        DISPLAY MESSAGES
       ----------------------------- */

        // DISPLAY AN ALERT MESSAGE ON THE TOP OF THE PLAYER
        function displayAlert(titleAlert, descrAlert)
        {
            if(app.alertSingleton === false)
            {
                app.alertSingleton = true;
                // Replace the text
                document.getElementById("alertMsg").innerHTML = "<h2>" + titleAlert + "</h2><p>" + descrAlert + "</p>";
                // Display the message element for 5 seconds
                document.getElementById("alertMsg").style.display = "block";
                setTimeout(() => {
                    document.getElementById("alertMsg").style.display = "none";
                    app.alertSingleton = false;
                }, 10000);
            }
        }

        function emptyPlayerDisplay()
        {
            document.getElementById("currentChannelNameDisplay").innerHTML = "";
            document.getElementById("currentVideoNameDisplay").innerHTML = "";
            disablePlayer();// TODO se heurte parfois à un timeout
            setTimeout(() => {
                disablePlayer();
            }, 1000);
        }






    /*  ----------------------------------------
         SHOW / HIDE INTERFACE
        ---------------------------------------- */

function showVideo() {
    if(app.videoDisplayed === false) {
        app.videoIndexBeforePlayerDisplay = app.currentVideoIndex;
        var checkIfVideoReadyToDisplay = setInterval(function() {
            if(app.videoIndexBeforePlayerDisplay === app.currentVideoIndex && player.getPlayerState() === 1) {
                updateAllData();
                app.playerInitAttemptPassed = true;
                app.nextVideoInitAttemptPassed = true;
                app.videoDisplayed = true;
                document.getElementById("playerContainer").classList.remove("hidden");
                document.getElementById("playerContainer").classList.add("displayed");
                //storeVideoYouTubeId();
                clearInterval(checkIfVideoReadyToDisplay);
                getVideoYouTubeId();
            }
        }, 100);
    }
}

function hideVideo() {
    app.videoDisplayed = false;
    document.getElementById("playerContainer").classList.remove("displayed");
    document.getElementById("playerContainer").classList.add("hidden");
    app.nextVideoInitAttemptPassed = false;
    hideVideoTitle();
    hideCaptions();
}


function showFeedback(paramToDisplay, displayValue)
{
    app.feedbackTimer = true;
    let possibleParameters = document.getElementById("buttonsFeedback").childNodes;
    for(let i=0 ; i < possibleParameters.length ; i++) {
        try {
            if(possibleParameters[i].id !== paramToDisplay) {
                possibleParameters[i].classList.add("hidden");
            }
        } catch(e) {}
    }

    document.getElementById(paramToDisplay).innerHTML = displayValue;

    document.getElementById(paramToDisplay).classList.remove("hidden");
    document.getElementById("buttonsFeedback").classList.remove("hidden");
    document.getElementById("channelNumFeedback").classList.add("displayed");
    document.getElementById(paramToDisplay).classList.add("displayed");
}

function hideFeedback(paramToHide)
{
        app.feedbackTimer = false;
        setTimeout(() => {
            if(app.feedbackTimer === false) {
                document.getElementById(paramToHide).classList.remove("displayed");
                document.getElementById("buttonsFeedback").classList.remove("displayed");
                document.getElementById("buttonsFeedback").classList.add("hidden");
                setTimeout(() => {
                    if(app.feedbackTimer === false) {
                        document.getElementById(paramToHide).classList.add("hidden");
                    }
                }, app.feedbackTimerDuration);
            }
        }, app.feedbackTimerDuration);
}



function showInterface()
{
    app.noUserInterraction = false;
    let header = document.getElementsByTagName("header")[0];
    let channels = document.getElementById("channels");
    let menuControler = document.getElementById("menuControler");

    header.classList.remove("hidden");
    header.classList.remove("reduced");
    header.classList.remove("disappearing");
    channels.classList.remove("hidden");
    menuControler.classList.remove("hidden"); 
    header.classList.add("displayed");
    channels.classList.add("displayed");
    menuControler.classList.add("displayed");
    //setTimeout(() => {
    app.noUserInterraction = true;
    //}, 3000);
    showCursor();
    app.displayTimerOn = true;
    app.NbDisplayTimer++;
    autoHide();
    setTimeout(() => {
        if(app.NbDisplayTimer > 0) {
            app.NbDisplayTimer--;
        }
        if(app.NbDisplayTimer === 0) {
            app.displayTimerOn = false;
        }

    }, app.totalTimeToHide / 2);

}

function showCursor()
{
    document.getElementById("backgroundPlexiglass").classList.remove("nocursor");
    document.getElementById("backgroundPlexiglass").classList.add("cursor");
}

function hideCursor()
{
    document.getElementById("backgroundPlexiglass").classList.remove("cursor");
    document.getElementById("backgroundPlexiglass").classList.add("nocursor");
    document.getElementById("backgroundPlexiglass").focus();
}

function cursorEnterInterface()
{
    app.cursorOnInterface = true;
    showInterface();
}

function cursorExitInterface()
{
    app.cursorOnInterface = false;
}

function hideInterface()
{
    let header = document.getElementsByTagName("header")[0];
    let channels = document.getElementById("channels");
    let menuControler = document.getElementById("menuControler");

    if(app.searchSingleton === false && app.NbDisplayTimer === 0 && app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {
        header.classList.remove("displayed");
        channels.classList.remove("displayed");
        menuControler.classList.remove("displayed");
        channels.classList.add("hidden");
        menuControler.classList.add("hidden");

        hideCursor();

        header.classList.add("reduced");
        if(app.searchSingleton === false && menuControler.classList.contains("hidden") && app.NbDisplayTimer === 0 && app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {
            setTimeout(() => {
                if(app.searchSingleton === false && menuControler.classList.contains("hidden") && app.NbDisplayTimer === 0 && app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {
                    header.classList.add("disappearing");
                    header.classList.remove("reduced");
                    hideCursor();
                    setTimeout(() => {
                        if(app.searchSingleton === false && menuControler.classList.contains("hidden") && app.NbDisplayTimer === 0 && app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {
                            header.classList.add("hidden");
                            header.classList.remove("disappearing");
                            setTimeout(() => {
                                if(app.searchSingleton === false && menuControler.classList.contains("hidden") && app.NbDisplayTimer === 0 && app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {
                                    hideCursor();
                                }
                            }, app.totalTimeToHide * 2);
                        } else {
                            showInterface();
                        }
                    }, app.totalTimeToHide * 2);
                } else {
                    showInterface();
                }
            }, app.totalTimeToHide * 2);
        } else {
            showInterface();
        }
    }
}

function autoHide()
{
    setTimeout(() => {
        try
        {
            if(app.NbHidingTimer > 0) {
                app.NbHidingTimer--;
            }
            
            if(app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {   
                app.NbHidingTimer++;
                if(app.hidingTimerOn === false) {
                    app.hidingTimerOn = true;
                    //setTimeout(() => {
                        autoHide();
                    //}, 3000);
                }
                else if(app.hidingTimerOn === true) {
                    if(app.NbHidingTimer === 1) {
                        setTimeout(() => {
                            if(app.hidingTimerOn === true && app.NbHidingTimer === 1 && app.displayTimerOn === false) {
                                hideInterface();
                                app.hidingTimerOn = false;
                            }
                            else {
                                autoHide();
                            }
                        }, app.totalTimeToHide / 2);
                    }
                }
            } else if(app.hidingTimerOn === true) {
                autoHide();
            }
        }
        catch(e) {}
    }, app.totalTimeToHide / 2);
}

    /*  ----------------------------------------
         FULLSCREEN MODE
        ---------------------------------------- */

        function switchFullscreenMode() {
            if(app.fullscreenStatus === false) { goFullScreen(); }
            else                               { endFullScreen(); }
            playOrPause();
        }

        function goFullScreen()
        {
            if(app.fullscreenStatus === false) {
                app.fullscreenStatus = true;
                document.getElementById("fullscreen").setAttribute("display", "none");
                // Go fullscreen
                var body = document.getElementsByTagName("body")[0].requestFullscreen();
                // Fullscreen button evolves into end fullscreen button
                document.getElementById("fullscreen").setAttribute("src", "rsrc/mediaPlayer/fullscreen-off.svg");
                document.getElementById("fullscreen").setAttribute("onmousedown", "endFullScreen();");
                document.getElementById("fullscreen").setAttribute("display", "block");
                updateRealTimeData();
            }
        }

        function endFullScreen()
        {
            if(app.fullscreenStatus === true) {
                document.getElementById("fullscreen").setAttribute("display", "none");
                // End fullscreen
                document.exitFullscreen();
                // End fullscreen button evolves into fullscreen button
                document.getElementById("fullscreen").setAttribute("src", "rsrc/mediaPlayer/fullscreen-on.svg");
                document.getElementById("fullscreen").setAttribute("onmousedown", "goFullScreen();");
                document.getElementById("fullscreen").setAttribute("display", "block");
                app.fullscreenStatus = false;
                showInterface();
                updateRealTimeData();
            }

        }

        function togglePictureInPicture() {
          if (document.getElementById("player").pictureInPictureElement) {
            document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled) {
            document.getElementById("player").requestPictureInPicture();
          }
        }


    /*  ----------------------------------------
         FILL / THEATHER MODE
        ---------------------------------------- */

        function goFillMode()
        {
            document.getElementById("fillingmode").setAttribute("display", "none");
            app.theaterOn = false;
            // Go fullscreen
            document.getElementById("playerContainer").classList.add("plain");
            // Fullscreen button evolves into end fullscreen button
            document.getElementById("fillingmode").setAttribute("src", "rsrc/mediaPlayer/theater-mode.svg");
            document.getElementById("fillingmode").setAttribute("onmousedown", "goTheatherMode();");
            document.getElementById("fillingmode").setAttribute("display", "block");
            showInterface();
        }

        function goTheatherMode()
        {
            document.getElementById("fillingmode").setAttribute("display", "none");
            app.theaterOn = true;
            // Go fullscreen
            document.getElementById("playerContainer").classList.remove("plain");
            // Fullscreen button evolves into end fullscreen button
            document.getElementById("fillingmode").setAttribute("src", "rsrc/mediaPlayer/fill-mode.svg");
            document.getElementById("fillingmode").setAttribute("onmousedown", "goFillMode();");
            document.getElementById("fillingmode").setAttribute("display", "block");
            showInterface();
        }



    /* -----------------------------
        CONTROL PANEL
       ----------------------------- */




/*

        function requestFullScreen() {

          var el = document.body;

          // Supports most browsers and their versions.
          var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen 
          || el.mozRequestFullScreen || el.msRequestFullScreen;

          if (requestMethod) {

            // Native full screen.
            requestMethod.call(el);

          } else if (typeof window.ActiveXObject !== "undefined") {

            // Older IE.
            var wscript = new ActiveXObject("WScript.Shell");

            if (wscript !== null) {
              wscript.SendKeys("{F11}");
            }
          }
        }
*/



        // PLAY THE PREVIOUS VIDEO
        function previousVideo()
        {
            if(app.alreadyPlayed.length > 1) {
                app.randomPlaylist.unshift(app.alreadyPlayed.shift());
                loadVideo(app.alreadyPlayed[0]);
            }
            // If this is the first played video, do nothing
            /*
            if(app.alreadyPlayed.length <= 1)
            {
                return;
            }
            else
            {
                // Take note we are going back in the already played videos
                //app.currentBackToTheFutureCount++;
                // Get the index of the previous video
                //var indexToPlay=app.alreadyPlayed[0];
                app.randomPlaylist.unshift(app.alreadyPlayed.shift());
                loadVideo(app.randomPlaylist[0]);
                //if (app.alreadyPlayed.length - app.currentBackToTheFutureCount - 1 >= 0) {
                    //indexToPlay = app.alreadyPlayed[app.alreadyPlayed.length - app.currentBackToTheFutureCount - 1];
                    //loadVideo(indexToPlay);
                //}
            }
            */
        }

        // PLAY THE NEXT VIDEO (NEXT IN THE BACKTOTHEFUTURE ORDER OR NEW RANDOM ONE)
        function nextVideo()
        {
            if(app.randomPlaylist.length === 0 && app.alreadyPlayed.length >= 1) {
                displayAlert("vous avez vu toutes les vidéos de " + app.playName + " !", "Vous pouvez éteindre JoliTube et reprendre une activité normale");
                loadSelectedChannel(app.channelNum);
            }
            else {
                app.alreadyPlayed.unshift(app.randomPlaylist.shift());
                loadVideo(app.alreadyPlayed[0]);
            }
        }

    /* -----------------------------
        VIDEO CONTROL
       ----------------------------- */


        // PLAY OR PAUSE THE VIDEO DEPENDING ON THE CURRENT STATE
        function playOrPause()
        {
            if((!app.inputForbidden)) {
                app.inputForbidden = true;
                let isFromPlayPauseButton = false;
                try {
                    isFromPlayPauseButton = (event.originalTarget.src === document.getElementById("playVideo").src);
                } catch(e) {}
                if(app.cursorOnInterface === false || isFromPlayPauseButton) {
                    if(app.playing === true) {
                        pauseChannel();
                    }
                    else if(app.playing === false)  {
                        playChannel();
                    }
                }
                else { app.inputForbidden = false; }
            }
        }

       function playChannel()
       {
            try {
                app.inputForbidden = true;
                player.playVideo();
                app.playing = true;
                document.getElementById("playVideo").src = "rsrc/mediaPlayer/pause.svg";
                app.inputForbidden = false;
                hideCursor();
            } catch(e) {}
       }

       function pauseChannel()
       {
            try {
                app.inputForbidden = true;
                player.pauseVideo();
                app.playing = false;
                document.getElementById("playVideo").src = "rsrc/mediaPlayer/play.svg";
                app.inputForbidden = false;
                //}, 300);
            } catch(e) {}
       }

       // UPDATE THE ICON PLAY/PAUSE OF THE CONTROL PANEL DEPENDING ON THE PLAYER STATE
       function updatePlayerState()
       {
            //back
            if(app.alreadyPlayed.length <= 1) /* || app.alreadyPlayed.length === app.currentBackToTheFutureCount + 1*/
            {
                document.getElementById("previousVideo").onclick = "";
                document.getElementById("previousVideo").classList.add("disabled");
            }
            else
            {
                document.getElementById("previousVideo").onclick = function() { previousVideo(); };
                document.getElementById("previousVideo").classList.remove("disabled");
            }

            // the player is ready if the function is called, so ensure the availability of the next button
            document.getElementById("nextVideo").onclick = function() { nextVideo(); };
            document.getElementById("nextVideo").classList.remove("disabled");

            
            try {
                if(player.getPlayerState() === 1 && app.playing === false) {
                    pauseChannel();

                } else if(player.getPlayerState() === 2 && app.playing === true) {
                    playChannel();
                }
            } catch(e) {}
            



       }

       function disablePlayer()
       {
            try {
                // Back
                document.getElementById("previousVideo").onclick = "";
                document.getElementById("previousVideo").classList.add("disabled");
                // Next
                document.getElementById("nextVideo").onclick = function() { nextVideo(); };
                document.getElementById("nextVideo").classList.remove("disabled");
            } catch(e) {}
       }




        function allowSearchInput() {
            event.stopPropagation();

            if(event.code === "Escape") {
                document.getElementById("searchBar").value = "";
                searchUpdate();
            }
            if(event.code === "Enter" || event.code === "Escape") {
                quitSearchMode();
                document.getElementById("searchBar").blur();
            }
            else if(event.code === "ArrowDown") {
                loadNextChannel();
            }
            else if(event.code === "ArrowUp") {
                loadPreviousChannel();
            }
        }

        function searchMode() {
            app.searchSingleton = true;
            showInterface();
        }

        function quitSearchMode() {
            app.searchSingleton = false;
        }


        function searchUpdate()
        {
            let inputedText = document.getElementById("searchBar").value;
            let channels = document.getElementsByClassName("elementMenuBar");

            for( let i=0; i < channels.length ; i++) {
                if(!channels[i].getElementsByTagName("h1")[0].outerText.toLowerCase().includes(inputedText.toLowerCase())) {
                    channels[i].classList.add("hidden");
                } else {
                    channels[i].classList.remove("hidden");
                }
            }
        }

        function searchReset()
        {
            document.getElementById("searchBar").value = "";
            let channels = document.getElementsByClassName("elementMenuBar");
            for( let i=0; i < channels.length ; i++) {
                channels[i].classList.remove("hidden");
            }
        }








    /* -----------------------------
        VIDEO LOADING
       ----------------------------- */


        function muteOrUnmute() {
            try {
                if(player.isMuted() === true) {
                    app.muteOn = false;
                    refreshVolume();
                } else {
                    app.muteOn = true;
                    refreshVolume();
                }
            } catch(e) {}
        }

        function userChangeVolume()
        {
            try
            {
                if(player.isMuted() === true) {
                    muteOrUnmute()
                }
                if(event.target.value >= 0) {
                    app.volume = event.target.value;
                    refreshVolume();
                }
            }
            catch(e) {}
        }

        function increaseVolume()
        {
            try
            {
                if(player.isMuted() === true) {
                    muteOrUnmute()
                }
                let roundedVol = Math.ceil(10 * app.volume) / 10;
                if(roundedVol === app.volume) {
                    roundedVol += 10;
                }
                app.volume = Math.min(roundedVol, 100);
                refreshVolume();
            }
            catch(e) {}
        }

        function decreaseVolume()
        {
            try
            {
                if(player.isMuted() === true) {
                    muteOrUnmute()
                }
                let roundedVol = Math.floor(10 * app.volume) / 10;
                if(roundedVol === app.volume) {
                    roundedVol -= 10;
                }
                app.volume = Math.max(roundedVol, 0);
                refreshVolume();
            }
            catch(e) {}
        }

        function refreshVolume() {
            try
            {
                if(app.muteOn) {
                    player.mute();
                    document.getElementById("mute").src = "rsrc/mediaPlayer/sound-mute.svg";
                    document.getElementById("volume").setAttribute("disabled", "");
                    document.getElementById("volume").value = 0;
                    document.getElementById("volumeBarContainer").classList.add("disabled");
                }
                else
                {
                    player.unMute();
                    document.getElementById("volume").removeAttribute("disabled");
                    document.getElementById("volumeBarContainer").classList.remove("disabled");
                    document.getElementById("volume").value = app.volume;
                    document.getElementById("webkitProgressFillVolume").style.width = app.volume + "%";//"calc(" + app.volume + "% * .785)";
                    if(app.volume <= 25) {
                        document.getElementById("mute").src = "rsrc/mediaPlayer/sound-0.svg";
                    }
                    else if(app.volume <= 50) {
                        document.getElementById("mute").src = "rsrc/mediaPlayer/sound-1.svg";
                    }
                    else if(app.volume <= 75) {
                        document.getElementById("mute").src = "rsrc/mediaPlayer/sound-2.svg";
                    }
                    else {
                        document.getElementById("mute").src = "rsrc/mediaPlayer/sound-3.svg";
                    }
                }
                player.setVolume(app.volume);
            }
            catch(e) {}
        }



        function userChangeQuality()
        {
            // If the user select a quality value < MAX RES
            if(possibleQualitiesValues.indexOf(event.target.value) >= 1) {
                app.userSelectedMaxRes = event.target.value;
                app.priorityToMaxRes = false;
            }
            else if(possibleQualitiesValues.indexOf(event.target.value) == 0) {
                app.userSelectedMaxRes = event.target.value;
                app.priorityToMaxRes = true;
            }
            app.currentQuality = event.target.value;
            loadQuality();
        }

        function setCaptionsWidth() {
            let selectSubtitles = event.target;
            let currentOption = selectSubtitles.selectedOptions[0];
            let currentOptionLenght = currentOption.firstChild.length;
            let currentOptionWidthVariable = currentOptionLenght * .8;
            let currentOptionWidthFix = 3;
            selectSubtitles.style.width = "calc(" + currentOptionWidthVariable + " * var(--h2FontSize) + " + currentOptionWidthFix + " * var(--h4FontSize))";
        }

        function setManualCaptionsWidth(currentOptionWidthVariable, currentOptionWidthFix) {
            selectSubtitles.style.width = "calc(" + currentOptionWidthVariable + " * var(--h2FontSize) + " + currentOptionWidthFix + " * var(--h4FontSize))";
        }   

        function nextSpeed()
        {
            event.stopPropagation();
            userIsChoosingSpeed();

            let possibleSpeedValues = [0.25, 0.5, 1, 1.5, 2];
            let nextValueIndex = possibleSpeedValues.indexOf(app.speed) + 1;
            if(nextValueIndex >= possibleSpeedValues.length) {
                nextValueIndex = 0;
            }
            let nextValue = possibleSpeedValues[nextValueIndex];
            try {
                let options = document.getElementById("selectSpeed");
                player.setPlaybackRate(nextValue);
                app.speed = nextValue;

                document.getElementById("selectSpeed").value = app.speed;
            } catch(e) {}
            userIsNotChoosingSpeed();
        }

        function userChangeSpeed()
        {
            event.stopPropagation();
            userIsChoosingSpeed();
            try {
                player.setPlaybackRate(parseFloat(event.target.value));
                app.speed = parseFloat(event.target.value);

                document.getElementById("selectSpeed").value = app.speed;
            } catch(e) {}
            userIsNotChoosingSpeed();
            // TODO : Quick Fix Cancer
            playOrPause();
            playOrPause();
        }

        function userIsChoosingSpeed() { app.userNotChoosingSpeed = false; app.inputForbidden = true; }
        function userIsNotChoosingSpeed() { app.userNotChoosingSpeed = true; app.inputForbidden = false; }

        function userChangeCaptions()
        {
            app.subtitlesManuallySelected = true;

            let selectSubtitles = event.target;
            let currentOption = selectSubtitles.selectedOptions[0];
            let currentOptionLenght = currentOption.firstChild.length;
            let currentOptionWidthVariable = currentOptionLenght * .8;
            let currentOptionWidthFix = 3;


            app.currentSubtitlesLanguage = currentOption.value;

            if(app.currentSubtitlesLanguage === "off") {
                app.subtitlesOn = false;
            } else {
                app.subtitlesOn = true;
            }

            loadCaptions();

            app.userNotChoosingSubtitles = true;
        }

        function userIsChoosingCaptions() { app.userNotChoosingSubtitles = false; }


        function loadQuality()
        {
            var whileVideoQualitiesNotFullyCharged = setInterval(function()
            {
                try {
                    app.availablesQualities = player.getAvailableQualityLevels();

                    if(app.availablesQualities.length > 0) {
                        if(app.currentQuality == null) {
                            app.currentQuality = player.getPlaybackQuality();
                        }

                        if((!app.availablesQualities.includes(app.currentQuality)) || app.priorityToMaxRes) {
                            if(app.priorityToMaxRes) {
                                app.currentQuality = app.availablesQualities[0];
                            }
                            else {
                                let currentQualityIndex = possibleQualitiesValues.indexOf(app.currentQuality);
                                for(let i=currentQualityIndex+1; i < possibleQualitiesValues.length ; i++) {
                                    if(app.availablesQualities.indexOf(possibleQualitiesValues[i]) >= 0) {
                                        app.currentQuality = app.availablesQualities.indexOf(possibleQualitiesValues[i]);
                                        break;
                                    }
                                }
                            }
                        }

                        let selectResolution = document.getElementById("selectResolution");

                        selectResolution.innerHTML = "";
                        for(let i=0; i < app.availablesQualities.length ; i++) {
                            let isSelected = "";
                            if(app.availablesQualities[i] === app.currentQuality) {
                                isSelected = " selected";
                            }
                            switch(app.availablesQualities[i])
                            {
                                case "hd2160" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">4K - 2160p</option>";
                                    break;
                                case "hd1440" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">HD - 1440p</option>";
                                    break;
                                case "hd1080" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">HD - 1080p</option>";
                                    break;
                                case "hd720" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">HQ - 720p</option>";
                                    break;
                                case "large" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">SD - 480p</option>";
                                    break;
                                case "medium" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">SD - 360p</option>";
                                    break;
                                case "small" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">SD - 240p</option>";
                                    break;
                                case "tiny" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">SD - 144p</option>";
                                    break;
                                case "auto" :
                                    selectResolution.innerHTML += "<option value='" + app.availablesQualities[i] + "'" + isSelected + ">AUTO</option>";
                                    break;
                            }
                        }

                        player.setPlaybackQuality(app.currentQuality);
                        clearInterval(whileVideoQualitiesNotFullyCharged);
                    }

                    
                } catch(e) { }    
            }, 20);   
        }

        function loadCaptions() {
            var whileVideoCaptionsNotFullyCharged = setInterval(function()
            {
                try {
                    let captionsList = player.getOption('captions', 'tracklist');
                    let captionSelected = player.getOption('captions', 'track').languageCode;
                    let selectSubtitles = document.getElementById("selectSubtitles");

                    if(captionsList !== undefined) {
                        if(app.currentSubtitlesLanguage === null) {
                            app.currentSubtitlesLanguage = captionSelected;
                        }

                        selectSubtitles.innerHTML = "";
                        if (captionsList.length === 0) {
                            selectSubtitles.innerHTML += "<option value='off' selected>No Subtitles</option>";
                            selectSubtitles.setAttribute("disabled", "");
                            player.unloadModule("captions");
                            setManualCaptionsWidth(10, 0);
                            app.subtitlesLoadingAttempts++;
                        }
                        else if (captionsList.length > 0) {
                            player.loadModule("captions"); 

                            if(!app.subtitlesManuallySelected) {
                                let currentBestRankedLanguage = null;
                                for(let i=0 ; i < captionsList.length ; i++) {
                                    for(let j=0 ; j < app.subtitlesPrefList.length ; j++) {
                                        if(currentBestRankedLanguage > j || currentBestRankedLanguage === null) {
                                            if(captionsList[i].languageCode === app.subtitlesPrefList[j] || app.subtitlesPrefList.indexOf("off") === app.subtitlesPrefList[j]) {
                                                currentBestRankedLanguage = j;
                                            }
                                        }
                                    }
                                }

                                app.currentSubtitlesLanguage = app.subtitlesPrefList[currentBestRankedLanguage];
                            } else {
                                let selectedLang = app.subtitlesPrefList.indexOf(app.currentSubtitlesLanguage);
                                if(selectedLang >= 0) {
                                    updateLanguagesStats(selectedLang, captionsList);
                                }
                            }
                            
                            for(let i=0 ; i < captionsList.length ; i++) {
                                let isSelected = "";
                                if(captionsList[i].languageCode === app.currentSubtitlesLanguage) {
                                    isSelected = " selected";
                                }
                                selectSubtitles.innerHTML += "<option value='" + captionsList[i].languageCode + "'" + isSelected + ">" + captionsList[i].languageName + "</option>";
                            }
                            let nosub = "";
                            if(app.subtitlesOn === false) {
                                nosub = " selected";
                            }
                            selectSubtitles.innerHTML += "<option value='off'" + nosub + ">Off</option>";

                            selectSubtitles.removeAttribute("disabled");

                            if(app.subtitlesOn === true) {
                                player.setOption("captions", "track", {"languageCode": app.currentSubtitlesLanguage});
                            } else {
                                player.unloadModule("captions"); 
                            }

                            setCaptionsWidth();
                            app.subtitlesManuallySelected = false;

                            if(app.subtitlesLoadingAttempts > 50 || captionsList.length > 0) {
                                clearInterval(whileVideoCaptionsNotFullyCharged);
                            }
                        }
                    }

                    
                }
                catch(e) { /*console.log("ERR - NO CAPTIONS RETURNED ...");*/ }

            }, 150);
        }

        function hideCaptions() { document.getElementById("selectSubtitles").innerHTML = ""; }

        // LOAD THE N INDEX VIDEO
        function loadVideo(n)
        {
            try {
                hideVideo();
                app.subtitlesLoadingAttempts=0;
                app.currentVideoIndex=n;
                app.videoYtId = null;
                player.playVideoAt(n);
                playChannel();
            } catch(e) {}
        }

        function updateAllData()
        {
            updateVideoTitle();
            updateDuration();
            updatePlayerState();
            loadQuality();
            loadCaptions();
            updateChannelData();
            refreshVolume();
        }

        function updateRealTimeData()
        {
            updateDuration();
            refreshVolume();
            updatePlayerState();
/*
            setTimeout(() => {
                updateDuration();;
                refreshVolume();
                updatePlayerState();
            }, 1000);
*/
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
        function updateVideoTitle()
        {
            var whileVideoDataNotFullyCharged = setInterval(function() {
                let vidTitle = null;
                let vidUrl = null;
                let elHtml = "-";
                try {
                    app.videoAuthor = player.playerInfo.videoData.author;
                    app.videoTitle = player.getVideoData().title;
                    app.videoUrl = player.getVideoUrl();
                    if(app.videoAuthor.length > 0 && app.videoTitle.length > 0 && app.videoUrl.length > 0) {
                        let authorText = "<span id='currentVideoSeparator'>➥</span><span id='currentVideoAuthor'>" + app.videoAuthor + "</span>"; // ➤ ☛
                        elHtml = "<a href='" + app.videoUrl + "' target='_blank'><span id='animatedBanner'>" + app.videoTitle + authorText + "</span></a>";
                        document.getElementById("currentVideoNameDisplay").innerHTML = elHtml;
                        clearInterval(whileVideoDataNotFullyCharged);
                    }
                } catch(e) {}
            }, 20);
        }

        function hideVideoTitle() { document.getElementById("currentVideoNameDisplay").innerHTML = ""; }



    /* -----------------------------
        CHANNEL LOADING
       ----------------------------- */

        // CHANGE THE CHANNEL IN THE PLAYER
        function loadSelectedChannel(num)
        {
            hideVideo();
            hideChannelData();

            let trueChannelIndex = num - 1;
            app.channelNum = num;
            app.playName = channelList[trueChannelIndex][0];
            app.playlistID = channelList[trueChannelIndex][3];
            app.logo = channelList[trueChannelIndex][2];
            app.currentChannelCuratorName=curratorsList[channelList[trueChannelIndex][4]][0];
            app.currentChannelCuratorURL=curratorsList[channelList[trueChannelIndex][4]][1];

            updateChannelData();

            app.playerFullyChargedSingleton = false;

            //searchReset();
            disablePlayer();
            showInterface();
            app.realTimeDataMonitored = false;
            app.firstVideoLoaded = false;
            app.nbVideoCurrentChannel = null;
            app.playerInitAttemptPassed = false;
            app.nextVideoInitAttemptPassed = false;
            app.randomPlaylist = [];
            app.alreadyPlayed = [];
            app.alreadyPlayedErrors = [];
            // disable the controls
            // Reset the player
            //document.getElementById("playerContainer").innerHTML = '<div id="player"></div>';
            //try { player.stopVideo(); } catch(e) {}

            document.getElementById("playerContainer").innerHTML = "" +
                '<div id="cropping-div" style="">' +
                    '<div id="div-to-crop" style="">' +
                      '<div id="player-wrapper">' +
                        '<div id="player"></div>' +
                      '</div>' +
                    '</div>' +
                '</div>';
            document.getElementById("playerContainer").className = "";
            // Update the global variables
            hideVideo();
            channelNumUpdate(app.channelNum);
            window.location.hash = app.channelNum;
            //window.location.href =+ "?c=" + app.channelNum;
            // Initialise the player
            initYT();
            //Update the channel informations (global variables and display)


            var whilePlayerNotFullyCharged = setInterval(function() {
                app.nbVideoCurrentChannel = null;
                try {
                    app.nbVideoCurrentChannel = player.playerInfo.playlist.length;
                } catch(e) {}
                if(app.nbVideoCurrentChannel !== null && app.playerFullyChargedSingleton === false) {
                    app.playerFullyChargedSingleton = true;
                    createPlaylistOrder();
                    nextVideo();

                    console.log("GO TO CHANNEL : " + app.channelNum);
                    //showInterface();
                    playChannel();

                    clearInterval(whilePlayerNotFullyCharged);
                }
            }, 20);
        }

        function loadPreviousChannel() {
            try {
                let channels = document.getElementsByClassName("elementMenuBar");
                let cChannelNum = app.channelNum;

                let isFirstDisplayedDisplayedChannel = false;
                let i = 0;
                while(!isFirstDisplayedDisplayedChannel) {
                    i++;
                    if(cChannelNum - i < 1) {
                        isFirstDisplayedDisplayedChannel = true;
                    }
                    else if(!channels[cChannelNum - 1 - i].classList.contains("hidden")) {
                        isFirstDisplayedDisplayedChannel = true;
                    }
                }
                cChannelNum = cChannelNum - i;
                if(cChannelNum <= 0) {
                    app.channelNum = channelList.length + 1;
                    loadPreviousChannel();
                } else {
                    loadSelectedChannel(cChannelNum);
                    channelNumUpdate(cChannelNum);
                    app.channelArrowNavigationTracker--;
                }
                
            } catch(e) { }
        }

        function loadNextChannel() {
            try {
                let channels = document.getElementsByClassName("elementMenuBar");
                let cChannelNum = app.channelNum;

                let isFirstDisplayedDisplayedChannel = false;
                let isLastDisplayedDisplayedChannel = false;
                let fChNum = null;
                let lChNum = null;
                let i = 0;
                for(i=1 ; i < channels.length - cChannelNum + 1 ; i++) {
                    if(!channels[cChannelNum - 1 + i].classList.contains("hidden")) {
                        if(isFirstDisplayedDisplayedChannel === false) {
                            isFirstDisplayedDisplayedChannel = true;
                            fChNum = cChannelNum + i;
                        }
                        isLastDisplayedDisplayedChannel = true;
                        lChNum = cChannelNum + i;
                    }
                }
                if(fChNum === null) {
                    app.channelNum = 0;
                    loadNextChannel();
                } else {
                    loadSelectedChannel(fChNum);
                    channelNumUpdate(fChNum);
                    app.channelArrowNavigationTracker++;
                }
            } catch(e) {}
        }

        function getChannelNum(chName) {
            let res = null;
            // for each channel in the menu
            for(var i=0; i< channelList.length; i++ )
            {
                // highlight it only if its the current channel
                if(channelList[i][0] == chName) {
                    res = i + 1;
                }
            }
            return res;
        }

        function channelNumUpdate(num) {
            app.prevChannelNum = app.channelNum;
            app.channelNum = num;
            let res = "" + num;
            if (res.length === 1) {
                res = "0" + app.channelNum;
            }
            app.displayChannelNum = res;
        }


        // UPDATE THE CHANNEL INFORMATIONS
        function updateChannelData()
        {
            // Update the control panel display
            let channelNumHtml = "<span id='currentChannelNum'>" + app.displayChannelNum + " - </span> ";
            let channelNameHtml = "<span id='currentChannelName'>" + app.playName + "</span> ";
            let curratorHTML = "<a id='currentChannelCurator' href='" + app.currentChannelCuratorURL + "' target='_blank'>" + app.currentChannelCuratorName + "</span>";
            document.getElementById("currentChannelNameDisplay").innerHTML = channelNumHtml + channelNameHtml + curratorHTML;
            document.getElementById("currentChannelLogo").src = app.logo;
            channelListRefresh();
        }

        // UPDATE THE CHANNEL INFORMATIONS
        function hideChannelData()
        {
            document.getElementById("currentChannelNameDisplay").innerHTML = "";
            document.getElementById("currentChannelLogo").src = "";
        }


        function channelListRefresh()
        {
            // Update the selection in the lateral menu
            var childDivs = document.getElementsByClassName('elementMenuBar');
            // for each channel in the menu
            for(var i=0; i < childDivs.length; i++ )
            {
                // reset the background color
                childDivs[i].classList.remove("selected");
                // highlight it only if its the current channel
                if(childDivs[i].innerHTML.includes("<h1>"+app.playName+"</h1>")) {
                    childDivs[i].classList.add("selected");
                    if(app.channelArrowNavigationTracker >= 3 || app.channelArrowNavigationTracker <= -3 || app.prevChannelNum - app.channelNum > 1 || app.prevChannelNum - app.channelNum < 1) {
                        // childDivs[idToDisplayPrevElements].scrollIntoView();
                        //else if(i === childDivs.length - 1) { childDivs[i].scrollIntoView(); }
                        //else {
                            let childNodeToDisplayCounter = 0;
                            let j = null;
                            let firstJ = null;
                            let lastJ = null;
                            for (j=i ; j >= 0 ; j--) {
                                if(!childDivs[j].classList.contains("hidden")) {
                                    childNodeToDisplayCounter++;
                                    if(childNodeToDisplayCounter == 1) {
                                        firstJ=j;
                                    }
                                    if(childNodeToDisplayCounter >= 1) {
                                        lastJ=j;
                                    }

                                    if(childNodeToDisplayCounter === 3) {
                                        childDivs[j].scrollIntoView();
                                        break;
                                    }
                                    else if(j === childDivs.length - 1) { childDivs[firstJ].scrollIntoView(); }
                                    else if(j === 0) { childDivs[lastJ].scrollIntoView(); }
                                }
                            }
                        //}
                    }
                }
            }
            searchUpdate();
        }

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
            onYouTubeIframeAPIReady();

        }

        var responseText = null;

        // CALL THE YOUTUBE API TO GET A PLAYER
        function onYouTubeIframeAPIReady()
        {
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
                            origin: window.location.host,
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
                } catch(e) {}
            


                //let interfaceAutoHidding = setInterval(function () { autoHide(); }, 100);
                
        }


/* =========================================================================
    PAGE LOADING
   ========================================================================= */

document.addEventListener('DOMContentLoaded', function(event)
{
    hideVideo();

    /* -----------------------------
        CHANNELS LOADING
       ----------------------------- */

        // Set the default channel (first in the channelList)

        let firstChToLoad = 1;
        if(window.location.hash.length > 0) { firstChToLoad = parseInt(window.location.hash.substring(1)); }
        channelNumUpdate(firstChToLoad);

        app.playlistID=channelList[firstChToLoad][3];
        app.playName=channelList[firstChToLoad][0];
        app.logo=channelList[firstChToLoad][2];
        app.currentChannelCuratorName=curratorsList[channelList[firstChToLoad][4]][0];
        app.currentChannelCuratorURL=curratorsList[channelList[firstChToLoad][4]][1];

        //Generation of the miniatures for each channel (HTML)
        var menuBarContent = "";
        var channelMiniature = "";
            let i = 0;
            channelList.forEach(function miniaturesGeneration(currentChannel, index) {
                i++;
                let displayChannelNum = "" + i;
                if (displayChannelNum.length === 1) {
                    displayChannelNum = "0" + displayChannelNum;
                }
                channelMiniature = '' +
                  '<div class="elementMenuBar" onclick="loadSelectedChannel(' + i + ');">' +
                    '<div class="logoElementMenuBar">' +
                      '<img src="' + currentChannel[2] + '"/>' +
                    '</div>' +
                    '<div class="titlesElementMenuBar">' +
                      '<h1>' + currentChannel[0] + '</h1>' +
                      '<h2>' + currentChannel[1] + '</h2>' +
                      '<h3>' + displayChannelNum + '</h3>' +
                    '</div>' +
                  '</div>';

                  /*
                      Result exemple :
                      <div class="elementMenuBar">
                          <div class="logoElementMenuBar">
                              <img src="rsrc/channelsLogos/TCM.png"/>
                          </div>
                          <div class="titlesElementMenuBar">
                              <h1>Court-Métrages TV</h1>
                              <h2>GIVE US BACK LA TOUR EIFFEL (FEAT WAKALIWOOD) - LE GRABUGE</h2>
                          </div>
                      </div>
                  */

                  menuBarContent += channelMiniature;
            });
            // Add the generated list of menu elements to the menu
            document.getElementById("menuBar").innerHTML = menuBarContent;

    /* -----------------------------
        YOUTUBE PLAYER LOADING
       ----------------------------- */


        //initYT();

        loadSelectedChannel(firstChToLoad);





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
        try
        {
            player.setPlaybackRate(app.speed);

            document.getElementById("player").removeAttribute("allowfullscreen");
            document.getElementById("player").setAttribute("allowFullScreen", "");

            app.realTimeDataMonitored = true;
        } catch(e) {}  

    }

    // AT THE END OF THE CURRENT VIDEO
    function onPlayerStateChange(event)
    {
        if(app.eventsTimer === null && app.playerInitAttemptPassed) {
            app.eventsTimer = setInterval(function () {
                if(app.realTimeDataMonitored) {
                    updateRealTimeData();
                }
                else {
                    clearInterval(app.eventsTimer);
                }
            }, 100);
        }

    

        if(event.data === 1 || event.data === 3) {
            app.firstVideoLoaded = true;
        }
        // ENDED VIDEO HANDLING
        else if ((app.currentVideoIndex !== player.getPlaylistIndex()) && app.firstVideoLoaded && app.nextVideoInitAttemptPassed === true) {
            nextVideo();
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
                nextVideo();
                playChannel();
            } catch(e) {}
        }
        else {
            app.alreadyPlayedErrors.unshift(app.playerIndexInitAttempt);
            app.playerIndexInitAttempt++;
            loadSelectedChannel(app.channelNum);
        }
    }










function loadSelectedChannelByRemote() {
    var checkRemoteInput = setInterval(function() {
        if(app.remoteDigitBuffer.length >= 2 && app.remoteDigitBuffer !== null) {
            let chNum = parseInt(app.remoteDigitBuffer);
            if(chNum < channelList.length) {
                showFeedback("channelNumFeedback", app.remoteDigitBuffer);
                app.remoteDigitBuffer = null;
                loadSelectedChannel(chNum);
                hideFeedback("channelNumFeedback");
                clearInterval(checkRemoteInput);
            }
            else {
                if(document.getElementById("channelNumFeedback").innerHTML !== "??") {
                    showFeedback("channelNumFeedback", app.remoteDigitBuffer);
                    app.remoteDigitSingleton = true;
                }
                app.remoteDigitBuffer = null;
                setTimeout(() => {
                    showFeedback("channelNumFeedback", "??");
                    hideFeedback("channelNumFeedback");
                    setInterval(function() {
                        app.remoteDigitSingleton = false;
                    }, app.feedbackTimerDuration * 1.5);
                }, app.feedbackTimerDuration);
            }
        }
    }, 20);

    setTimeout(() => {
        if(app.remoteDigitBuffer !== null) {
            try { clearInterval(checkRemoteInput); } catch(e) {}
            showFeedback("channelNumFeedback", "0" + app.remoteDigitBuffer);
            let chNum = parseInt(app.remoteDigitBuffer);
            app.remoteDigitBuffer = null;
            loadSelectedChannel(chNum);
            hideFeedback("channelNumFeedback");
        }
    }, 2500);
}



function addToRemoteDigitBuffer(digit)
{
    if(!app.remoteDigitSingleton) {
        if(app.remoteDigitBuffer === null) {
            app.remoteDigitBuffer = "";
            app.remoteDigitBuffer += digit;
            loadSelectedChannelByRemote();
        }
        else {
            app.remoteDigitBuffer += digit;
        }

        var displayTempValue = "" + app.remoteDigitBuffer;
        if(displayTempValue.length === 1) {
            displayTempValue = "-" + displayTempValue;
        }

        showFeedback("channelNumFeedback", displayTempValue);

        showInterface();
    }
}




function keyHandler()
{
    console.log("key input : " + event.code);
    switch(event.code)
    {
        case "KeyR":
            loadSelectedChannel(app.channelNum);
            break;
        case "KeyF":
            switchFullscreenMode();
            playOrPause();
            break;
        case "KeyT":
            if(app.theaterOn === false) { goTheatherMode(); }
            else                        { goFillMode(); }
            break;
        case "KeyK":
            playOrPause();
            break;
        case "Space":
            playOrPause();
            break;
        case "Escape":
            endFullScreen();
            break;
        case "ArrowUp":
            loadPreviousChannel();
            break;
        case "ArrowDown":
            loadNextChannel();
            break;
        case "ArrowLeft":
            try { backwardInVideo(); }catch(e) { }
            break;
        case "KeyJ":
            try { backwardInVideo(); setTimeout(() => { backwardInVideo(); }, 200); } catch(e) { }
            break;
        case "ArrowRight":
            try { forwardInVideo(); }catch(e) { }
            break;
        case "KeyL":
            try { forwardInVideo(); setTimeout(() => { forwardInVideo(); }, 200); } catch(e) { }
            break;
        case "Digit1" :
            addToRemoteDigitBuffer("1");
            break;
        case "Numpad1" :
            addToRemoteDigitBuffer("1");
            break;
        case "Digit2" :
            addToRemoteDigitBuffer("2");
            break;
        case "Numpad2" :
            addToRemoteDigitBuffer("2");
            break;
        case "Digit3" :
            addToRemoteDigitBuffer("3");
            break;
        case "Numpad3" :
            addToRemoteDigitBuffer("3");
            break;
        case "Digit4" :
            addToRemoteDigitBuffer("4");
            break;
        case "Numpad4" :
            addToRemoteDigitBuffer("4");
            break;
        case "Digit5" :
            addToRemoteDigitBuffer("5");
            break;
        case "Numpad5" :
            addToRemoteDigitBuffer("5");
            break;
        case "Digit6" :
            addToRemoteDigitBuffer("6");
            break;
        case "Numpad6" :
            addToRemoteDigitBuffer("6");
            break;
        case "Digit7" :
            addToRemoteDigitBuffer("7");
            break;
        case "Numpad7" :
            addToRemoteDigitBuffer("7");
            break;
        case "Digit8" :
            addToRemoteDigitBuffer("8");
            break;
        case "Numpad8" :
            addToRemoteDigitBuffer("8");
            break;
        case "Digit9" :
            addToRemoteDigitBuffer("9");
            break;
        case "Numpad9" :
            addToRemoteDigitBuffer("9");
            break;
        case "Digit0" :
            addToRemoteDigitBuffer("0");
            break;
        case "Numpad0" :
            addToRemoteDigitBuffer("0");
            break;
        case "NumpadAdd":
            increaseVolume();
            break;
        case "KeyQ":
            increaseVolume();
            break;
        case "NumpadSubtract":
            decreaseVolume();
            break;
        case "KeyA":
            decreaseVolume();
            break;
        case "KeyM":
            muteOrUnmute();
            break;
        case "Semicolon":
            muteOrUnmute();
            break;
        case "KeyN":
            nextVideo();
            break;
        case "KeyP":
            if(app.alreadyPlayed.length > 1) { //if(app.alreadyPlayed.length - app.currentBackToTheFutureCount > 1)
                previousVideo();
            }
            break;
        case "KeyX":
            nextSpeed();
            break;
        case "KeyS":
            document.getElementById("searchBar").focus();
            break;

    }

    hideCursor();
    event.preventDefault();
}

/*

YOUTUBE CMD
https://support.google.com/youtube/answer/7631406?hl=fr

.   Passer à l'image suivante de la vidéo (lorsqu'elle est en pause).
,   Passer à l'image précédente de la vidéo (lorsqu'elle est en pause).

>   Augmenter la vitesse de lecture de la vidéo.
<   Diminuer la vitesse de lecture de la vidéo.

Chiffres de 1 à 9 sur la barre de recherche (et non sur le pavé numérique)  Accéder à la vidéo selon un pourcentage d'avancement (de 10 % à 90 %).
Chiffre 0 sur la barre de recherche (et non sur le pavé numérique)  Accéder au début de la vidéo.

/   Accéder au champ de recherche.


c   Activer les sous-titres, s'ils sont disponibles. Pour masquer les sous-titres, appuyez de nouveau sur la touche C.

Touches multimedia

*/




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
                        nextVideo();
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
                    nextVideo();
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

