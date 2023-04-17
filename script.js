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

                this.firstVideoLoaded = false;
                this.firstVideoDebug = false;

                this.playerIndexInitAttempt = 0;
                this.playerInitAttemptPassed = false;



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












                this.feedbackTimerDuration = 2000;
            }
        }

        var app = new AppPreferences();


        function updateLanguagesRanks(cLang) {
            for(let i=0 ; i < app.subtitlesPrefList.length ; i++) {
                console.log(cLang + " : " + app.subtitlesPrefMatrice[cLang][i] + " -- VS -- " + i + " : " + app.subtitlesPrefMatrice[i][cLang]);
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
            console.log(app.subtitlesPrefList);
            console.log(app.subtitlesPrefMatrice);
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
                console.log(player.getCurrentTime());
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
    CHANNELS LIST
   ========================================================================= */

        /*
        STRUCTURE FOR A CHANNEL :
          - Title : 21 caracters
          - Description : 25 caracters
          - Logo : link to the img in rsrc/channelsLogos/
          - Playlist ID : you can find it the playlist URL
          - Nb videos : Number of videos in the playlist (if higher than the real value, might cause bugs in the index random generation)
        */

        var possibleQualitiesValues = ["hd2160", "hd1440", "hd1080", "hd720", "large", "hd720", "medium", "small", "tiny", "auto"];

        var channelList = [
        	// Premium
            ["TEST","TEST","rsrc/channelsLogos/JoliTubePlus.png","PLEJ0pOW0FHeECH6Q4OuOSkujC8Grt11Vo"],
            ["JoliTube +","Les derniers ajouts","rsrc/channelsLogos/JoliTubePlus.png","PLEJ0pOW0FHeELfQtk-6za-V7Pirc15Nax"],
            ["JoliTube + Séries","Essayez des séries","rsrc/channelsLogos/JoliTubeSeries.png","PLEJ0pOW0FHeGn_AMco5NL9QbZPdaIJ0sK"],
            ["JoliTube + Cinéma","Pop-corn vendu séparément","rsrc/channelsLogos/JoliTubeCinema.png","PLEJ0pOW0FHeGv1QU3JIuqYnGoIP3a7J0r"],
            ["JoliTube + Courts","Comme un long mais court","rsrc/channelsLogos/JoliTubeCourts.png","PLEJ0pOW0FHeF7sE3tM3HsrAEhdQaNT1Zl"],
            ["JoliTube + Spectacles","Show ou pas show ?","rsrc/channelsLogos/JoliTubeSpectacles.png","PLEJ0pOW0FHeFifm36Yj6WN0OitSMuJ4YR"],
            // Cinéma
            ["Old Movies","C'est moins cher que Netflix","rsrc/channelsLogos/OldMovies.png","PLEJ0pOW0FHeFgOC544ujQty-gONR9GJVw"],
            //["JoliTube Ciné Cancer","C'est meilleur quand c'est nul","rsrc/channelsLogos/JoliTubeWebSeries.png","PLEJ0pOW0FHeFn4qMaIWp-N0XA4rFmrbwW"],
            // Comédie
            ["Comédie","Blagues de l\'Internouille","rsrc/channelsLogos/Comedie.png","PLEJ0pOW0FHeGM2aj0qVizu5PFd5OZpfft"],
            ["Comedy","Jokes made in Internet","rsrc/channelsLogos/Comedy.png","PLEJ0pOW0FHeF2Nr7x5qCipkRAT0-DRi63"],
            ["Old Comédie","C\'était sympa Dailymotion","rsrc/channelsLogos/OldComedie.png","PLEJ0pOW0FHeHXID5VahhSdu2ZvRWUOM3J"],
            ["Old Comedy","YouTube used to be funny","rsrc/channelsLogos/OldComedy.png","PLEJ0pOW0FHeFn19WRTmLeNCby6_VB-voT"],
            ["Funnier MTV","C\'est mieux avec des blagues","rsrc/channelsLogos/FunnierMTV.png","PLEJ0pOW0FHeFGAcuPQTlLpV0beaNyu_Ua"],
            ["YouTube Poop","Because It\'s where the poop is","rsrc/channelsLogos/ComedieYTP2.png","PLEJ0pOW0FHeForGVS9CZk6riBHOLmQnmj"],
            //["The Eric Andre Show","Trash & absurd","rsrc/channelsLogos/The_Eric_Andre_Logo.png","PLEJ0pOW0FHeGQyVUPTE-qhJwKKtZQHm4u"],
            //Musique
            ["MTV Eclectic Party","Bordel audible de soirée","rsrc/channelsLogos/MTV_Party.png","PLEJ0pOW0FHeF5LvDjIxUMLdv1Xh_Jt-bV"],
            ["MTV Covers","Les grands artistes volent","rsrc/channelsLogos/MTV_Covers.png","PLEJ0pOW0FHeEOZsliVPFJ0uVYksimlsJt"],
            ["MTV Mashups","Deux hits valent mieux qu'un","rsrc/channelsLogos/MTV_Mashups.png","PLEJ0pOW0FHeGlfiwS36aYUpV6JJumUeDF"],
            ["MTV +BCDM","+ Belles chansons du Monde","rsrc/channelsLogos/MTV_BCDM.png","PLEJ0pOW0FHeHhqQqSNbwfkwKbUx1II1Je"],
            ["MTV Visual","La Musique qui se regarde","rsrc/channelsLogos/MTV_Visual.png","PLEJ0pOW0FHeHq4zPJMSym3v5QQOltZ38A"],
            ["MTV Random","Surprennament, ça existe","rsrc/channelsLogos/MTV_Random.png","PLEJ0pOW0FHeEFm0IBxq8lzZFfT06d1aLr"],
            ["MTV Unusual","Sons et instruments bizarres","rsrc/channelsLogos/MTV_Unusual.png","PLEJ0pOW0FHeE0KFtYvOqy-j-dMJrJUNJt"],
            ["MTV Shitty","Shitty music is the best","rsrc/channelsLogos/MTVShitty.png","PLEJ0pOW0FHeEK-TjsvdDacq3_eDyAQwDh"],
            ["MTV Otamatone","Tout est mieux à l'Otamatone","rsrc/channelsLogos/MTV_Otamatone.png","PLEJ0pOW0FHeFBnYENy5LWpfAHcJ4NDjCs"],
            ["MTV Flute","Un instrument sous estimé","rsrc/channelsLogos/MTV_Flute.png","PLEJ0pOW0FHeGfuXlbqgYXiZKWTnEGwCex"],
            ["Euro 2000","Eurodance & euroambiance","rsrc/channelsLogos/Euro2000.png","PLEJ0pOW0FHeFRwE7WTbteW1OvJ6fTgZQ6"],
            ["Eurovision","Sans le décompte des points","rsrc/channelsLogos/Eurovision.png","PLEJ0pOW0FHeHnxrwXg_QDKFgs5j7JLdKl"],
            ["PostModern","Back to the Future","rsrc/channelsLogos/PostMo.png","PLEJ0pOW0FHeHXBa2L9ZA4vURmbpC4mNtx"],
            ["PostMo 30","30\'s rocks","rsrc/channelsLogos/PostMo30.png","PLEJ0pOW0FHeE2RaM1qJbcLbJ6E03vp6R9"],
            ["PostMo 60","60\'s Forever","rsrc/channelsLogos/PostMo60.png","PLEJ0pOW0FHeHWT-SDeRgvrZyA6zz8zkcD"],
            ["PostMo 80","Synthwave partout","rsrc/channelsLogos/PostMo80.png","PLEJ0pOW0FHeExdr1E-CzhMeVwh-ggWBcE"],
            ["PostMo Symph","Pop-symphonique","rsrc/channelsLogos/PostMoSymph.png","PLEJ0pOW0FHeFbplYMHal9mvYJtQSY7Jhv"],
            ["Paroles","Les pas plus grands textes","rsrc/channelsLogos/ParolesTV.png","PLEJ0pOW0FHeHfo8D0450uwDXsC2SvBicf"],
            ["Coco Hits Only","Marx avait raison","rsrc/channelsLogos/CocoTV.png","PLEJ0pOW0FHeFc3nuqu0G7Xsl2ZwOfEsMT"],
            ["Zik2Kebab","Ambiance ton maître-kebabier","rsrc/channelsLogos/Zik2Kebab.png","PLEJ0pOW0FHeGBqy3eZmsU5jo0v5yBp47d"],
            ["SilvaGunner","Fake Video Games Music Only","rsrc/channelsLogos/silvaGunner.png","PLEJ0pOW0FHeGRJKoolDq3hruSs7IW1ynF"],
            ["Britney","100 % Britney Spears","rsrc/channelsLogos/britney.png","PLEJ0pOW0FHeH7eFJ_xhL95mPyUFaPF4DL"],
            //Jeunesse
            ["Disney Channel Music","Ton enfance leur appartient","rsrc/channelsLogos/MTVDisneyStore.png","PLEJ0pOW0FHeFq5itu2wEmmHCf7CrJcbp_"],
            ["Canal J","Tu peux sortir les céréales","rsrc/channelsLogos/CanalJ.png","PLEJ0pOW0FHeHN170F8w7Y5YoXRJI83Fiv"],
            ["YouTube Kids","C\'est compliqué ...","rsrc/channelsLogos/YouTubeKids.png","PLEJ0pOW0FHeES9YZTEYfo3iJI3inSGBtL"],
            ["JeuxLeVeux","100% pubs, 0% dessins animés","rsrc/channelsLogos/JeuxLeVeux.png","PLEJ0pOW0FHeEU0Aomd50p-Ps8_6-zUHHH"],
            // Nouvelle génération
            ["[adult anim]","Animation pour les grands","rsrc/channelsLogos/AdultAnim.png","PLEJ0pOW0FHeFN5aWnQO026Rq3ybmtaDTq"],
            ["[sureal anim]","Animation pour les weirdos","rsrc/channelsLogos/AdultAnimSureal.png","PLEJ0pOW0FHeF5dkaPtUFGUL5bKHLIXHxN"],
            ["Cyriak","Animation surréel et psyché","rsrc/channelsLogos/Cyriak.png","PLEJ0pOW0FHeHfV7ox0iHKFn3Gs6zU8FTc"],
            // Fond de grille
            ["Random TV","Ainsi soit-il","rsrc/channelsLogos/randomTV.png","PLEJ0pOW0FHeFLhiQ1-2bi-oIUp-FPMojH"],
            ["Random TV Speed","Pas le temps de niaiser","rsrc/channelsLogos/randomTVspeed.png","PLEJ0pOW0FHeFeJK_JkPmIGdyHt1q3fGv6"],
            ["Random TV Petit Tube","Tu n'as jamais vu ces vidéos","rsrc/channelsLogos/randomTVPetitTube.png","PLEJ0pOW0FHeGSac-RPj03xmhYold-8hmO"],
            ["Memory Hole","L'angoisse des 90's","rsrc/channelsLogos/MemoryHole.png","PLEJ0pOW0FHeE2U_-OtyXrORU-X8ttTUxl"],
            ["Ads","Vu sur YouTube","rsrc/channelsLogos/ads.png","PLEJ0pOW0FHeFDRzAS6u6m2Oagn0-qClul"],
            ["SeuNeuCeuFeu TV","Une ambiance de Tchou tchou","rsrc/channelsLogos/SeuNeuCeuFeu.png","PLEJ0pOW0FHeGWvKiPBN0OybmreMjSCOHt"],
            ["Vidéo Grande Conso","N°1 sur le commerce de détail","rsrc/channelsLogos/VCG.png","PLEJ0pOW0FHeEOjiyKHydyn3Z5IptUayVR"],
            ["Steve Ballmer","Ce n\'est pas Steve Jobs","rsrc/channelsLogos/Ballmer.png","PLEJ0pOW0FHeGj5HQlf2BoahmvpdNYv9BO"],
            ["Ambient Music","Musique d'ambiance","rsrc/channelsLogos/AmbientMusic.png","PLEJ0pOW0FHeHjVH8BzOWQG4aDn0pjLfTR"],
            ["Ambient ScreenSaver","Des visuels pour vos soirées","rsrc/channelsLogos/AmbientScreenSaver.png","PLEJ0pOW0FHeHP5HNjoQdoAPRLI3MZKS_D"],
            ["Ambient Window","Une fenêtre sur le monde","rsrc/channelsLogos/AmbientWindow.png","PLEJ0pOW0FHeGIgL2QjcYyz0VqHLdctBo7"],
            ["Ambient Journey","La fenêtre du train en mieux","rsrc/channelsLogos/AmbientJourney.png","PLEJ0pOW0FHeHZoH7H1vak_JV_-xkZSNbQ"],
            // Étranger
            ["Planeta HD","Le meilleur de la pop bulgare","rsrc/channelsLogos/PlanetaHD.png","PLEJ0pOW0FHeGqtnSc4a12cE0EWa1Jw5jT"],
            ["Tiankov","N°1 sur la folk bulgare","rsrc/channelsLogos/Tiankov.png","PLEJ0pOW0FHeHYinJjgquQVGAaGDjLasPV"],
            ["RTB et amis","Tous tiers-monde d\'un autre","rsrc/channelsLogos/rtb.png","PLEJ0pOW0FHeGgMBBRCEUPVF586EMDKp9o"],
            ["Téléfrançais","Apprendons le Français","rsrc/channelsLogos/telefrancais.jpg","PLEJ0pOW0FHeGIHzCMPZL9qNn9KdL_RiOU"],
            //telefrancais.jpg
            // Fin fond de grille
            ["ATMO1777","Va voir, tu comprendras","rsrc/channelsLogos/ATMO1777.png","PLxGjXN7GLGCtUer7H5934MwtYXC6dPFyg"],
            ["ATMO3003","Va comprendre, tu verras","rsrc/channelsLogos/ATMO3003.png","PLxGjXN7GLGCtPSG7Hh4ZQyWiqjdxf_RCQ"],
            ["Chill of the trade","Keep calm, stay corporate","rsrc/channelsLogos/ChillOfTheTrade.png","PLxGjXN7GLGCsPN51q2a_uVvrY1E_PsHMD"],
            ["J-TOP","Nolife ne meurt jamais","rsrc/channelsLogos/Jtop.png","PLhPXaGzNx63GViI0aZCYtzttRsjsrNx7_"]
        ];

/* =========================================================================
    GLOBAL VARIABLES
   ========================================================================= */

    //Already played videos
    var currentChannel = "";
    app.currentVideoIndex = -2;

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
            // Replace the text
            document.getElementById("alertMsg").innerHTML = "<h2>" + titleAlert + "</h2><p>" + descrAlert + "</p>";
            // Display the message element for 5 seconds
            document.getElementById("alertMsg").style.display = "block";
            setTimeout(() => {
                document.getElementById("alertMsg").style.display = "none";
            }, 5000);
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
    app.videoIndexBeforePlayerDisplay = app.currentVideoIndex;
    setTimeout(function() {
        if(app.videoIndexBeforePlayerDisplay === app.currentVideoIndex) {
            document.getElementById("playerContainer").classList.remove("hidden");
            document.getElementById("playerContainer").classList.add("displayed");
            app.playerInitAttemptPassed = true;
        }
    }, 500);
}

function hideVideo() {
    document.getElementById("playerContainer").classList.remove("displayed");
    document.getElementById("playerContainer").classList.add("hidden");
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

    document.getElementsByTagName('body')[0].classList.remove("nocursor");
    document.getElementsByTagName('body')[0].classList.add("cursor");
    document.getElementById("background").classList.remove("nocursor");
    document.getElementById("background").classList.add("cursor");
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

    if(app.NbDisplayTimer === 0 && app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {
        header.classList.remove("displayed");
        channels.classList.remove("displayed");
        menuControler.classList.remove("displayed");
        channels.classList.add("hidden");
        menuControler.classList.add("hidden");

        header.classList.add("reduced");
        setTimeout(() => {
            if(app.NbDisplayTimer === 0 && app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {
                header.classList.add("disappearing");
                header.classList.remove("reduced");
                setTimeout(() => {
                    if(app.NbDisplayTimer === 0 && app.noUserInterraction === true && app.cursorOnInterface === false && app.playing === true && app.userNotChoosingSubtitles === true && app.userNotChoosingSpeed === true) {
                        header.classList.add("hidden");
                        header.classList.remove("disappearing");
                    }
                }, 1000);
            }
        }, app.totalTimeToHide * 2);
    }

    document.getElementsByTagName('body')[0].classList.remove("cursor");
    document.getElementById("background").focus();
    /*
    document.getElementById("background").classList.remove("cursor");
    document.getElementById("background").classList.add("nocursor");
    document.getElementById("playerContainer").classList.remove("cursor");
    document.getElementById("playerContainer").classList.add("nocursor");
    document.getElementById("cropping-div").classList.remove("cursor");
    document.getElementById("cropping-div").classList.add("nocursor");
    document.getElementById("div-to-crop").classList.remove("cursor");
    document.getElementById("div-to-crop").classList.add("nocursor");
    document.getElementById("player-wrapper").classList.remove("cursor");
    document.getElementById("player-wrapper").classList.add("nocursor");
    */

    setTimeout(() => {
        document.getElementsByTagName('body')[0].classList.add("nocursor");
        /*
        document.getElementById("background").classList.remove("cursor");
        document.getElementById("background").classList.add("nocursor");
        document.getElementById("playerContainer").classList.remove("cursor");
        document.getElementById("playerContainer").classList.add("nocursor");
        document.getElementById("cropping-div").classList.remove("cursor");
        document.getElementById("cropping-div").classList.add("nocursor");
        document.getElementById("div-to-crop").classList.remove("cursor");
        document.getElementById("div-to-crop").classList.add("nocursor");
        document.getElementById("player-wrapper").classList.remove("cursor");
        document.getElementById("player-wrapper").classList.add("nocursor");
        */
    }, 500);

    //url('rsrc/mediaPlayer/voidcursor.png'), 
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
                document.getElementById("fullscreen").setAttribute("src", "rsrc/mediaPlayer/fullscreen-end-icon.svg");
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
                document.getElementById("fullscreen").setAttribute("src", "rsrc/mediaPlayer/fullscreen-icon.svg");
                document.getElementById("fullscreen").setAttribute("onmousedown", "goFullScreen();");
                document.getElementById("fullscreen").setAttribute("display", "block");
                app.fullscreenStatus = false;
                showInterface();
                updateRealTimeData();
            }

        }

        function togglePictureInPicture() {
            console.log(document.getElementById("player"));
            console.log("=========");
            console.log(document.getElementsByTagName('video'));
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
                app.channelNum = getCurrentChannelNum();
                loadSelectedChannelByNum(app.channelNum);
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
                let isFromPlayPauseButton = false;
                try {
                    isFromPlayPauseButton = (event.originalTarget.src === document.getElementById("playVideo").src);
                } catch(e) {}
                if(app.cursorOnInterface === false || isFromPlayPauseButton) {
                    if(app.playing === true) {
                        app.inputForbidden = true;
                        pauseChannel();
                    }
                    else if(app.playing === false)  {
                        app.inputForbidden = true;
                        playChannel();
                    }
                }
                setTimeout(() => {
                    app.inputForbidden = false;
                }, 300);
            }
        }

       function playChannel()
       {
            try {
                player.playVideo();
                app.playing = true;
                setTimeout(() => {
                    if(app.playing === true) {
                        document.getElementById("playVideo").src = "rsrc/mediaPlayer/pause.png";
                        //showInterface();
                        app.inputForbidden = false;
                    }
                }, 300);
            } catch(e) {}
       }

       function pauseChannel()
       {
            try {
                player.pauseVideo();
                app.playing = false;
                setTimeout(() => {
                    if(app.playing === false) {
                        document.getElementById("playVideo").src = "rsrc/mediaPlayer/play.png";
                        //showInterface();
                        app.inputForbidden = false;
                    }
                }, 300);
            } catch(e) {}
       }

       // UPDATE THE ICON PLAY/PAUSE OF THE CONTROL PANEL DEPENDING ON THE PLAYER STATE
       function updatePlayerState()
       {
            //back
            if(app.alreadyPlayed.length <= 1) /* || app.alreadyPlayed.length === app.currentBackToTheFutureCount + 1*/
            {
                document.getElementById("previousVideo").src = "rsrc/mediaPlayer/backGreyed.png";
                document.getElementById("previousVideo").onclick = "";
                document.getElementById("previousVideo").style.cursor = "not-allowed";
            }
            else
            {
                document.getElementById("previousVideo").src = "rsrc/mediaPlayer/back.png";
                document.getElementById("previousVideo").onclick = function() { previousVideo(); };
                document.getElementById("previousVideo").style.cursor = "pointer";
            }

            // the player is ready if the function is called, so ensure the availability of the next button
            document.getElementById("nextVideo").src = "rsrc/mediaPlayer/forward.png";
            document.getElementById("nextVideo").onclick = function() { nextVideo(); };
            document.getElementById("nextVideo").style.cursor = "pointer";

            try {
                if(player.getPlayerState() === 1 && app.playing === false) {
                    playChannel();
                } else if(player.getPlayerState() === 0 && app.playing === true) {
                    pauseChannel();
                }
            } catch(e) {}



       }

       function disablePlayer()
       {
            try {
                // Back
                document.getElementById("previousVideo").src = "rsrc/mediaPlayer/backGreyed.png";
                document.getElementById("previousVideo").onclick = "";
                document.getElementById("previousVideo").style.cursor = "not-allowed";
                // Next
                document.getElementById("nextVideo").src = "rsrc/mediaPlayer/forwardGreyed.png";
                document.getElementById("nextVideo").onclick = "";
                document.getElementById("nextVideo").style.cursor = "not-allowed";
            } catch(e) {}
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

        function nextSpeed() {
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
                
                app.userNotChoosingSpeed = true;
                app.inputForbidden = false;
            } catch(e) {}
        }

        function userChangeSpeed()
        {
            try {
                let options = document.getElementById("selectSpeed");
                player.setPlaybackRate(parseFloat(event.target.value));
                app.speed = parseFloat(event.target.value);

                document.getElementById("selectSpeed").value = app.speed;
                
                app.userNotChoosingSpeed = true;
                app.inputForbidden = false;
            } catch(e) {}
        }

        function userIsChoosingSpeed() { app.userNotChoosingSpeed = false; app.inputForbidden = true; }

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

            console.log("LLLLLL : " + currentOption.value);

            //console.log(currentOptionLenght);

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
                        console.log(player.getOption('captions', 'tracklist'));
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
                player.playVideoAt(n);
                updateAllData();
            } catch(e) {}
        }

        function updateAllData()
        {
            updateVideoTitle();
            updateDuration();
            updatePlayerState();
            loadQuality();
            loadCaptions();
            menuUpdate();
            refreshVolume();
/*
            setTimeout(() => {
                updateVideoTitle();
                updateDuration();
                updatePlayerState();
                loadQuality();
                loadCaptions();
                menuUpdate();
                refreshVolume();
            }, 1000);
*/
        }

        function updateRealTimeData()
        {
            updateDuration();
            refreshVolume();
            updatePlayerState();

            setTimeout(() => {
                updateDuration();;
                refreshVolume();
                updatePlayerState();
            }, 1000);
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

                        if((durationHH > 0 || durationMM > 0 || durationSS > 0) && player.getCurrentTime() > 0) {
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

        function loadSelectedChannelByNum(num)
        {
            let i = num - 1;
            loadSelectedChannel(channelList[i][0], channelList[i][3], channelList[i][2]);
        }

        // CHANGE THE CHANNEL IN THE PLAYER
        function loadSelectedChannel(playName, playID, logo)
        {
            showInterface();
            hideVideo();
            app.realTimeDataMonitored = false;
            app.firstVideoLoaded = false;
            app.nbVideoCurrentChannel = null;
            app.playerInitAttemptPassed = false;
            app.randomPlaylist = [];
            app.alreadyPlayed = [];
            app.alreadyPlayedErrors = [];
            // disable the controls
            disablePlayer();
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
            app.playlistID = playID;

            //app.currentBackToTheFutureCount = 0;

            app.playName = playName;
            app.logo = logo;
            channelNumUpdate(getChannelNum(playName));
            menuUpdate();
            // Initialise the player
            initYT();
            //Update the channel informations (global variables and display)


            var whilePlayerNotFullyCharged = setInterval(function() {
                app.nbVideoCurrentChannel = null;
                try {
                    app.nbVideoCurrentChannel = player.playerInfo.playlist.length;
                } catch(e) {}
                if(app.nbVideoCurrentChannel !== null) {
                    createPlaylistOrder();
                    nextVideo();

                    //updateAllData();
                    console.log("CHANNEL : " + getCurrentChannelNum());
                    //showInterface();
                    playChannel();

                    clearInterval(whilePlayerNotFullyCharged);
                }
            }, 20);
        }

        function getCurrentChannelNum() {
            getChannelNum(app.channelNum);
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
            app.channelNum = num;
            let res = "" + num;
            if (res.length === 1) {
                res = "0" + app.channelNum;
            }
            app.displayChannelNum = res;
        }

        // UPDATE THE CHANNEL INFORMATIONS
        function menuUpdate()
        {
            // Update the control panel display
            document.getElementById("currentChannelNameDisplay").innerHTML = "<span id='currentChannelNum'>" + app.displayChannelNum + " - </span> " + app.playName;
            document.getElementById("currentChannelLogo").src = app.logo;
            // Update the selection in the lateral menu
            var childDivs = document.getElementsByClassName('elementMenuBar');
            // for each channel in the menu
            for(var i=0; i< childDivs.length; i++ )
            {
                // reset the background color
                childDivs[i].classList.remove("selected");
                // highlight it only if its the current channel
                if(childDivs[i].innerHTML.includes("<h1>"+app.playName+"</h1>")) {
                    childDivs[i].classList.add("selected");
                    let idToDisplayPrevElements = i - 2;
                    if(idToDisplayPrevElements < 0) { idToDisplayPrevElements = 0; }
                    childDivs[idToDisplayPrevElements].scrollIntoView();
                }
            }
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

    /* -----------------------------
        CHANNELS LOADING
       ----------------------------- */

        // Set the default channel (first in the channelList)
        app.playlistID=channelList[0][3];
        app.playName=channelList[0][0];
        app.logo=channelList[0][2];

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
                  '<div class="elementMenuBar" onclick="loadSelectedChannel(\'' + currentChannel[0] + '\',\'' + currentChannel[3] + '\',\'' + currentChannel[2] + '\');">' +
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

        loadSelectedChannelByNum(1);





        window.addEventListener("message", function(event) {
            try {
                updateDuration();
            }
            catch(e) {}
        });

/*
        var timerMouse;
        var timerNoUser;
        document.addEventListener('mousemove', function() {
            if (timerMouse) clearTimeout(timerMouse);
            if (timerNoUser) clearTimeout(timerNoUser);
            timerMouse = setTimeout(function() {
                console.log('mouse hasn\'t moved for 5 seconds');
                autoHide();
                timerMouse = setTimeout(function() {
                    hideInterface();
                }, 10000);
            }, 5000);
        });
*/

    
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

        try {
            /*
            let tests = player.getPlaylistIndex();
            if(app.currentVideoIndex !== player.getPlaylistIndex()) {
                nextVideo();
            }
            */
        } catch(e) {}
        

        //if(player.getPlayerState() === 2) { // IF PLAY
            //showVideo();
        //}

        if(event.data === 1 || event.data === 3) {
            app.firstVideoLoaded = true;
        }
        // ENDED VIDEO HANDLING
        else if ((app.currentVideoIndex !== player.getPlaylistIndex()) && app.firstVideoLoaded) {
            nextVideo();
        }
        /*
        else if (app.videoTitle !== player.getVideoData().title)
        {
            updateAllData();
        }
        */


    }

    // AT ERROR (when the video has been delete, got private or forbidden
    // of embdeding)
    function onPlayerError(event)
    {
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
            loadSelectedChannelByNum(app.channelNum);
        }
    }










function loadSelectedChannelByRemote() {
    var checkRemoteInput = setInterval(function() {
        if(app.remoteDigitBuffer.length >= 2 && app.remoteDigitBuffer !== null) {
            let chNum = parseInt(app.remoteDigitBuffer);
            if(chNum < channelList.length) {
                showFeedback("channelNumFeedback", app.remoteDigitBuffer);
                app.remoteDigitBuffer = null;
                loadSelectedChannelByNum(chNum);
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
            loadSelectedChannelByNum(chNum);
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
    console.log(event.code);
    switch(event.code)
    {
        case "KeyR":
            loadSelectedChannel(app.playName, app.playlistID, app.logo);
            event.preventDefault();
            break;
        case "KeyF":
            switchFullscreenMode();
            event.preventDefault();
            break;
        case "KeyT":
            if(app.theaterOn === false) { goTheatherMode(); }
            else                        { goFillMode(); }
            event.preventDefault();
            break;
        case "KeyK":
            playOrPause();
            event.preventDefault();
            break;
        case "Space":
            playOrPause();
            event.preventDefault();
            break;
        case "Escape":
            endFullScreen();
            event.preventDefault();
            break;
        case "ArrowUp":
            try {
                channelNumUpdate(app.channelNum - 1);
                if(app.channelNum > 0) {
                    loadSelectedChannelByNum(app.channelNum);
                } else {
                    loadSelectedChannelByNum(channelList.length);
                }
            }
            catch(e) { }
            event.preventDefault();
            break;
        case "ArrowDown":
            try {
                channelNumUpdate(app.channelNum + 1);
                if(app.channelNum <= channelList.length) {
                    loadSelectedChannelByNum(app.channelNum);
                } else {
                    loadSelectedChannelByNum(1);
                }
            }
            catch(e) { }
            event.preventDefault();
            break;
        case "ArrowLeft":
            try { backwardInVideo(); }catch(e) { }
            event.preventDefault();
            break;
        case "KeyJ":
            try { backwardInVideo(); setTimeout(() => { backwardInVideo(); }, 200); } catch(e) { }
            event.preventDefault();
            break;
        case "ArrowRight":
            try { forwardInVideo(); }catch(e) { }
            event.preventDefault();
            break;
        case "KeyL":
            try { forwardInVideo(); setTimeout(() => { forwardInVideo(); }, 200); } catch(e) { }
            event.preventDefault();
            break;
        case "Digit1" :
            addToRemoteDigitBuffer("1");
            event.preventDefault();
            break;
        case "Numpad1" :
            addToRemoteDigitBuffer("1");
            event.preventDefault();
            break;
        case "Digit2" :
            addToRemoteDigitBuffer("2");
            event.preventDefault();
            break;
        case "Numpad2" :
            addToRemoteDigitBuffer("2");
            event.preventDefault();
            break;
        case "Digit3" :
            addToRemoteDigitBuffer("3");
            event.preventDefault();
            break;
        case "Numpad3" :
            addToRemoteDigitBuffer("3");
            event.preventDefault();
            break;
        case "Digit4" :
            addToRemoteDigitBuffer("4");
            event.preventDefault();
            break;
        case "Numpad4" :
            addToRemoteDigitBuffer("4");
            event.preventDefault();
            break;
        case "Digit5" :
            addToRemoteDigitBuffer("5");
            event.preventDefault();
            break;
        case "Numpad5" :
            addToRemoteDigitBuffer("5");
            event.preventDefault();
            break;
        case "Digit6" :
            addToRemoteDigitBuffer("6");
            event.preventDefault();
            break;
        case "Numpad6" :
            addToRemoteDigitBuffer("6");
            event.preventDefault();
            break;
        case "Digit7" :
            addToRemoteDigitBuffer("7");
            event.preventDefault();
            break;
        case "Numpad7" :
            addToRemoteDigitBuffer("7");
            event.preventDefault();
            break;
        case "Digit8" :
            addToRemoteDigitBuffer("8");
            event.preventDefault();
            break;
        case "Numpad8" :
            addToRemoteDigitBuffer("8");
            event.preventDefault();
            break;
        case "Digit9" :
            addToRemoteDigitBuffer("9");
            event.preventDefault();
            break;
        case "Numpad9" :
            addToRemoteDigitBuffer("9");
            event.preventDefault();
            break;
        case "Digit0" :
            addToRemoteDigitBuffer("0");
            event.preventDefault();
            break;
        case "Numpad0" :
            addToRemoteDigitBuffer("0");
            event.preventDefault();
            break;
        case "NumpadAdd":
            increaseVolume();
            event.preventDefault();
            break;
        case "KeyQ":
            increaseVolume();
            event.preventDefault();
            break;
        case "NumpadSubtract":
            decreaseVolume();
            event.preventDefault();
            break;
        case "KeyA":
            decreaseVolume();
            event.preventDefault();
            break;
        case "KeyM":
            muteOrUnmute();
            event.preventDefault();
            break;
        case "Semicolon":
            muteOrUnmute();
            event.preventDefault();
            break;
        case "KeyN":
            nextVideo();
            event.preventDefault();
            break;
        case "KeyP":
            if(app.alreadyPlayed.length > 1) { //if(app.alreadyPlayed.length - app.currentBackToTheFutureCount > 1)
                previousVideo();
            }
            event.preventDefault();
            break;
        case "KeyX":
            nextSpeed();
            event.preventDefault();
            break;

    }
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

    console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
    console.log(app.randomPlaylist);
    console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
}





/*
setTimeout(() => {
    document.getElementById("alertMsg").style.display = "none";
}, 5000);

setTimeout(() => {}, 5000);

*/


