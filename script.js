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

        var channelList = [
        	// Premium
            ["JoliTube +","Les derniers ajouts","rsrc/channelsLogos/JoliTubePlus.png","PLEJ0pOW0FHeELfQtk-6za-V7Pirc15Nax","173"],
            ["JoliTube + Séries","Essayez des séries","rsrc/channelsLogos/JoliTubeSeries.png","PLEJ0pOW0FHeGn_AMco5NL9QbZPdaIJ0sK","87"],
            ["JoliTube + Cinéma","Pop-corn vendu séparément","rsrc/channelsLogos/JoliTubeCinema.png","PLEJ0pOW0FHeGv1QU3JIuqYnGoIP3a7J0r","17"],
            ["JoliTube + Courts","Comme un long mais court","rsrc/channelsLogos/JoliTubeCourts.png","PLEJ0pOW0FHeF7sE3tM3HsrAEhdQaNT1Zl","98"],
            ["JoliTube + Spectacles","Show ou pas show ?","rsrc/channelsLogos/JoliTubeSpectacles.png","PLEJ0pOW0FHeFifm36Yj6WN0OitSMuJ4YR","23"],
            // Cinéma
            ["Old Movies","C'est moins cher que Netflix","rsrc/channelsLogos/OldMovies.png","PLEJ0pOW0FHeFgOC544ujQty-gONR9GJVw","46"],
            //["JoliTube Ciné Cancer","C'est meilleur quand c'est nul","rsrc/channelsLogos/JoliTubeWebSeries.png","PLEJ0pOW0FHeFn4qMaIWp-N0XA4rFmrbwW","108"],
            // Comédie
            ["Comédie","Blagues de l\'Internouille","rsrc/channelsLogos/Comedie.png","PLEJ0pOW0FHeGM2aj0qVizu5PFd5OZpfft","156"],
            ["Comedy","Jokes made in Internet","rsrc/channelsLogos/Comedy.png","PLEJ0pOW0FHeF2Nr7x5qCipkRAT0-DRi63","160"],
            ["Old Comédie","C\'était sympa Dailymotion","rsrc/channelsLogos/OldComedie.png","PLEJ0pOW0FHeHXID5VahhSdu2ZvRWUOM3J","109"],
            ["Old Comedy","YouTube used to be funny","rsrc/channelsLogos/OldComedy.png","PLEJ0pOW0FHeFn19WRTmLeNCby6_VB-voT","80"],
            ["Funnier MTV","C\'est mieux avec des blagues","rsrc/channelsLogos/FunnierMTV.png","PLEJ0pOW0FHeFGAcuPQTlLpV0beaNyu_Ua","138"],
            ["YouTube Poop","Because It\'s where the poop is","rsrc/channelsLogos/ComedieYTP2.png","PLEJ0pOW0FHeForGVS9CZk6riBHOLmQnmj","62"],
            //["The Eric Andre Show","Trash & absurd","rsrc/channelsLogos/The_Eric_Andre_Logo.png","PLEJ0pOW0FHeGQyVUPTE-qhJwKKtZQHm4u","66"],
            //Musique
            ["MTV Eclectic Party","Bordel audible de soirée","rsrc/channelsLogos/MTV_Party.png","PLEJ0pOW0FHeF5LvDjIxUMLdv1Xh_Jt-bV","200"],
            ["MTV Covers","Les grands artistes volent","rsrc/channelsLogos/MTV_Covers.png","PLEJ0pOW0FHeEOZsliVPFJ0uVYksimlsJt","180"],
            ["MTV Mashups","Deux hits valent mieux qu'un","rsrc/channelsLogos/MTV_Mashups.png","PLEJ0pOW0FHeGlfiwS36aYUpV6JJumUeDF","131"],
            ["MTV +BCDM","+ Belles chansons du Monde","rsrc/channelsLogos/MTV_BCDM.png","PLEJ0pOW0FHeHhqQqSNbwfkwKbUx1II1Je","63"],
            ["MTV Visual","La Musique qui se regarde","rsrc/channelsLogos/MTV_Visual.png","PLEJ0pOW0FHeHq4zPJMSym3v5QQOltZ38A","122"],
            ["MTV Random","Surprennament, ça existe","rsrc/channelsLogos/MTV_Random.png","PLEJ0pOW0FHeEFm0IBxq8lzZFfT06d1aLr","160"],
            ["MTV Unusual","Sons et instruments bizarres","rsrc/channelsLogos/MTV_Unusual.png","PLEJ0pOW0FHeE0KFtYvOqy-j-dMJrJUNJt","197"],
            ["MTV Shitty","Shitty music is the best","rsrc/channelsLogos/MTVShitty.png","PLEJ0pOW0FHeEK-TjsvdDacq3_eDyAQwDh","200"],
            ["MTV Otamatone","Tout est mieux à l'Otamatone","rsrc/channelsLogos/MTV_Otamatone.png","PLEJ0pOW0FHeFBnYENy5LWpfAHcJ4NDjCs","53"],
            ["MTV Flute","Un instrument sous estimé","rsrc/channelsLogos/MTV_Flute.png","PLEJ0pOW0FHeGfuXlbqgYXiZKWTnEGwCex","43"],
            ["Euro 2000","Eurodance & euroambiance","rsrc/channelsLogos/Euro2000.png","PLEJ0pOW0FHeFRwE7WTbteW1OvJ6fTgZQ6","50"],
            ["Eurovision","Sans le décompte des points","rsrc/channelsLogos/Eurovision.png","PLEJ0pOW0FHeHnxrwXg_QDKFgs5j7JLdKl","49"],
            ["PostModern","Back to the Future","rsrc/channelsLogos/PostMo.png","PLEJ0pOW0FHeHXBa2L9ZA4vURmbpC4mNtx","101"],
            ["PostMo 30","30\'s rocks","rsrc/channelsLogos/PostMo30.png","PLEJ0pOW0FHeE2RaM1qJbcLbJ6E03vp6R9","57"],
            ["PostMo 60","60\'s Forever","rsrc/channelsLogos/PostMo60.png","PLEJ0pOW0FHeHWT-SDeRgvrZyA6zz8zkcD","45"],
            ["PostMo 80","Synthwave partout","rsrc/channelsLogos/PostMo80.png","PLEJ0pOW0FHeExdr1E-CzhMeVwh-ggWBcE","56"],
            ["PostMo Symph","Pop-symphonique","rsrc/channelsLogos/PostMoSymph.png","PLEJ0pOW0FHeFbplYMHal9mvYJtQSY7Jhv","64"],
            ["Paroles","Les pas plus grands textes","rsrc/channelsLogos/ParolesTV.png","PLEJ0pOW0FHeHfo8D0450uwDXsC2SvBicf","58"],
            ["Coco Hits Only","Marx avait raison","rsrc/channelsLogos/CocoTV.png","PLEJ0pOW0FHeFc3nuqu0G7Xsl2ZwOfEsMT","61"],
            ["Zik2Kebab","Ambiance ton maître-kebabier","rsrc/channelsLogos/Zik2Kebab.png","PLEJ0pOW0FHeGBqy3eZmsU5jo0v5yBp47d","39"],
            ["SilvaGunner","Fake Video Games Music Only","rsrc/channelsLogos/silvaGunner.png","PLEJ0pOW0FHeGRJKoolDq3hruSs7IW1ynF","58"],
            ["Britney","100 % Britney Spears","rsrc/channelsLogos/britney.png","PLEJ0pOW0FHeH7eFJ_xhL95mPyUFaPF4DL","64"],
            //Jeunesse
            ["Disney Channel Music","Ton enfance leur appartient","rsrc/channelsLogos/MTVDisneyStore.png","PLEJ0pOW0FHeFq5itu2wEmmHCf7CrJcbp_","72"],
            ["Canal J","Tu peux sortir les céréales","rsrc/channelsLogos/CanalJ.png","PLEJ0pOW0FHeHN170F8w7Y5YoXRJI83Fiv","200"],
            ["YouTube Kids","C\'est compliqué ...","rsrc/channelsLogos/YouTubeKids.png","PLEJ0pOW0FHeES9YZTEYfo3iJI3inSGBtL","43"],
            ["JeuxLeVeux","100% pubs, 0% dessins animés","rsrc/channelsLogos/JeuxLeVeux.png","PLEJ0pOW0FHeEU0Aomd50p-Ps8_6-zUHHH","126"],
            // Nouvelle génération
            ["[adult anim]","Animation pour les grands","rsrc/channelsLogos/AdultAnim.png","PLEJ0pOW0FHeFN5aWnQO026Rq3ybmtaDTq","115"],
            ["[sureal anim]","Animation pour les weirdos","rsrc/channelsLogos/AdultAnimSureal.png","PLEJ0pOW0FHeF5dkaPtUFGUL5bKHLIXHxN","166"],
            //["Cyriak","Animation surréel et psyché","rsrc/channelsLogos/Cyriak.png","PLEJ0pOW0FHeHfV7ox0iHKFn3Gs6zU8FTc","44"],
            // Fond de grille
            ["Random TV","Ainsi soit-il","rsrc/channelsLogos/randomTV.png","PLEJ0pOW0FHeFLhiQ1-2bi-oIUp-FPMojH","200"],
            ["Random TV Speed","Pas le temps de niaiser","rsrc/channelsLogos/randomTVspeed.png","PLEJ0pOW0FHeFeJK_JkPmIGdyHt1q3fGv6","119"],
            ["Random TV Petit Tube","Tu n'as jamais vu ces vidéos","rsrc/channelsLogos/randomTVPetitTube.png","PLEJ0pOW0FHeGSac-RPj03xmhYold-8hmO","171"],
            ["Memory Hole","L'angoisse des 90's","rsrc/channelsLogos/MemoryHole.png","PLEJ0pOW0FHeE2U_-OtyXrORU-X8ttTUxl","86"],
            ["Ads","Vu sur YouTube","rsrc/channelsLogos/ads.png","PLEJ0pOW0FHeFDRzAS6u6m2Oagn0-qClul","80"],
            ["SeuNeuCeuFeu TV","Une ambiance de Tchou tchou","rsrc/channelsLogos/SeuNeuCeuFeu.png","PLEJ0pOW0FHeGWvKiPBN0OybmreMjSCOHt","53"],
            ["Vidéo Grande Conso","N°1 sur le commerce de détail","rsrc/channelsLogos/VCG.png","PLEJ0pOW0FHeEOjiyKHydyn3Z5IptUayVR","35"],
            ["Steve Ballmer","Ce n\'est pas Steve Jobs","rsrc/channelsLogos/Ballmer.png","PLEJ0pOW0FHeGj5HQlf2BoahmvpdNYv9BO","38"],
            ["Ambient Music","Musique d'ambiance","rsrc/channelsLogos/AmbientMusic.png","PLEJ0pOW0FHeHjVH8BzOWQG4aDn0pjLfTR","39"],
            ["Ambient ScreenSaver","Des visuels pour vos soirées","rsrc/channelsLogos/AmbientScreenSaver.png","PLEJ0pOW0FHeHP5HNjoQdoAPRLI3MZKS_D","136"],
            ["Ambient Window","Une fenêtre sur le monde","rsrc/channelsLogos/AmbientWindow.png","PLEJ0pOW0FHeGIgL2QjcYyz0VqHLdctBo7","57"],
            ["Ambient Journey","La fenêtre du train en mieux","rsrc/channelsLogos/AmbientJourney.png","PLEJ0pOW0FHeHZoH7H1vak_JV_-xkZSNbQ","31"],
            // Étranger
            ["Planeta HD","Le meilleur de la pop bulgare","rsrc/channelsLogos/PlanetaHD.png","PLEJ0pOW0FHeGqtnSc4a12cE0EWa1Jw5jT","47"],
            ["Tiankov","N°1 sur la folk bulgare","rsrc/channelsLogos/Tiankov.png","PLEJ0pOW0FHeHYinJjgquQVGAaGDjLasPV","48"],
            ["RTB et amis","Tous tiers-monde d\'un autre","rsrc/channelsLogos/rtb.png","PLEJ0pOW0FHeGgMBBRCEUPVF586EMDKp9o","96"],
            ["Téléfrançais","Apprendons le Français","rsrc/channelsLogos/telefrancais.jpg","PLEJ0pOW0FHeGIHzCMPZL9qNn9KdL_RiOU","29"],
            //telefrancais.jpg
            // Fin fond de grille
            ["ATMO1777","Va voir, tu comprendras","rsrc/channelsLogos/ATMO1777.png","PLxGjXN7GLGCtUer7H5934MwtYXC6dPFyg","1774"],
            ["ATMO3003","Va comprendre, tu verras","rsrc/channelsLogos/ATMO3003.png","PLxGjXN7GLGCtPSG7Hh4ZQyWiqjdxf_RCQ","179"],
            ["Chill of the trade","Keep calm, stay corporate","rsrc/channelsLogos/ChillOfTheTrade.png","PLxGjXN7GLGCsPN51q2a_uVvrY1E_PsHMD","128"],
            ["J-TOP","Nolife ne meurt jamais","rsrc/channelsLogos/Jtop.png","PLhPXaGzNx63GViI0aZCYtzttRsjsrNx7_","1098"]
        ];

/* =========================================================================
    GLOBAL VARIABLES
   ========================================================================= */

    //Playlist data
    var playlistID = "";
    var playlistNbVideos = 0;

    //Already played videos
    var alreadyPlayed = [];
    var alreadyPlayedErrors = [];
    var currentChannel = "";
    var currentChannelLogo = "";
    var currentVideoIndex = -2;

    //Playback variables
    var currentBackToTheFutureCount = 0;

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
        function displayAlert(msgToDisplay)
        {
            // Replace the text
            document.getElementById("alertMsg").innerHTML = msgToDisplay;
            // Display the message element for 5 seconds
            document.getElementById("ytPlayerContainerLayer").style.display = "block";
            setTimeout(() => {
                document.getElementById("ytPlayerContainerLayer").style.display = "none";
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

    /* -----------------------------
        CONTROL PANEL
       ----------------------------- */

        // PLAY OR PAUSE THE VIDEO DEPENDING ON THE CURRENT STATE
        function playOrPause()
        {
            var currentState = player.getPlayerState();
            if(currentState == 1)
            {
                //document.getElementById("playVideo").src = "rsrc/mediaPlayer/pause.png";
                player.pauseVideo();
            }
            else
            {
                //document.getElementById("playVideo").src = "rsrc/mediaPlayer/play.png";
                player.playVideo();
            }
            updatePlayerState();
        }

        // PLAY THE PREVIOUS VIDEO
        function previousVideo()
        {
            // If this is the first played video, do nothing
            if(alreadyPlayed.length <= 1)
            {
                return;
            }
            else
            {
                // Take note we are going back in the already played videos
                currentBackToTheFutureCount++;
                // Get the index of the previous video
                var indexToPlay=alreadyPlayed[0];
                if(alreadyPlayed.length-currentBackToTheFutureCount-1 > 0)
                    indexToPlay = alreadyPlayed[alreadyPlayed.length-currentBackToTheFutureCount-1];
                // Play the video
                loadVideo(indexToPlay);
            }
        }

        // PLAY THE NEXT VIDEO (NEXT IN THE BACKTOTHEFUTURE ORDER OR NEW RANDOM ONE)
        function nextVideo()
        {
            var indexToPlay = 0;
            // If we already used the forward button, get the next video index
            if(currentBackToTheFutureCount > 0)
            {
                // Decrease the current position in the backtothefuture list
                currentBackToTheFutureCount--;
                // Get the index
                if(alreadyPlayed.length-currentBackToTheFutureCount-1 > 0)
                {
                    indexToPlay = alreadyPlayed[alreadyPlayed.length-currentBackToTheFutureCount-1];
                }
                //Play the video
                loadVideo(indexToPlay);
            }
            // If we are in the present, load a new random video
            else
            {
                loadRandomVideo();
            }
        }

    /* -----------------------------
        VIDEO CONTROL
       ----------------------------- */

       function playChannel()
       {
          player.playVideo();
          updatePlayerState();
       }

       function pauseChannel()
       {
          player.pauseVideo();
          updatePlayerState();
       }

       // UPDATE THE ICON PLAY/PAUSE OF THE CONTROL PANEL DEPENDING ON THE PLAYER STATE
       function updatePlayerState()
       {
            //play pause
            var currentState = player.getPlayerState();
            if(currentState == 0 || currentState == 2)
                document.getElementById("playVideo").src = "rsrc/mediaPlayer/play.png";
            else if(currentState == 1)
                document.getElementById("playVideo").src = "rsrc/mediaPlayer/pause.png";

            //back
            if(alreadyPlayed.length == 1 || alreadyPlayed.length == currentBackToTheFutureCount + 1)
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
       }

       function disablePlayer()
       {
            // Back
            document.getElementById("previousVideo").src = "rsrc/mediaPlayer/backGreyed.png";
            document.getElementById("previousVideo").onclick = "";
            document.getElementById("previousVideo").style.cursor = "not-allowed";
            // Next
            document.getElementById("nextVideo").src = "rsrc/mediaPlayer/forwardGreyed.png";
            document.getElementById("nextVideo").onclick = "";
            document.getElementById("nextVideo").style.cursor = "not-allowed";
       }


    /* -----------------------------
        VIDEO LOADING
       ----------------------------- */

        // LOAD THE N INDEX VIDEO
        function loadVideo(n)
        {
            updateVideoTitle();
            player.playVideoAt(n);
            currentVideoIndex=n;
        }

        // UPDATE THE VIDEO TITLE IN THE CONTROL PANEL
        function updateVideoTitle()
        {
            document.getElementById("currentVideoNameDisplay").innerHTML = player.getVideoData().title;
        }

        // RETURN A NON-PLAYED RANDOM VIDEO INDEX
        function getRandomVideoNumber()
        {
            // Range definition
            var min=0; 
            var max=playlistNbVideos; 
            if(playlistNbVideos > 200) //limitation of the YouTube API
                max=200;
            // Generation of the random index
            var n = Math.floor(Math.random() * (max - min)) + min;
            // TODO : bug if the last two elements to play randomly are consecutives
            while(alreadyPlayed.includes(n) || alreadyPlayedErrors.includes(n) || n + 1 == currentVideoIndex || n - 1 == currentVideoIndex)
            {
                n = getRandomVideoNumber();
            }
            return n;
        }

        // LOAD A RANDOM VIDEO ON THE YOUTUBE PLAYER
        function loadRandomVideo()
        {
            // If every video had been played, inform the user
            if(alreadyPlayed.length + alreadyPlayedErrors.length >= playlistNbVideos)
            {
                alreadyPlayed = [];
                displayAlert("Vous avez lu toutes les vidéos de cette chaîne");
            }
            // While necessary, generate a new index for the playlist
            var num = getRandomVideoNumber();
            // Keep note of it in the already played videos
            alreadyPlayed.push(num);
            // Play the video
            loadVideo(num);
            // Temporaraly disable the player to ensure fast user won't cause bugs
            // Will be reactivated during the state change when the video will be loaded
            disablePlayer();
            /*setTimeout(() => {
                updatePlayerState();
            }, 1000);*/
        }

    /* -----------------------------
        CHANNEL LOADING
       ----------------------------- */

        // CHANGE THE CHANNEL IN THE PLAYER
        function loadSelectedChannel(playName, playID, playNbVideos, logo)
        {
            // disable the controls
            disablePlayer();
            // Reset the player
            document.getElementById("background").innerHTML = '<div id="player"></div>';
            // Update the global variables
            playlistID = playID;
            playlistNbVideos = playNbVideos;
            alreadyPlayed = [];
            alreadyPlayedErrors = [];
            // Initialise the player
            initYT();
            //Update the channel informations (global variables and display)
            menuUpdate(playName, logo);
        }

        // UPDATE THE CHANNEL INFORMATIONS
        function menuUpdate(playName, logo)
        {
            // Update the global variable
            currentChannel=playName;
            currentChannelLogo=logo;
            // Update the control panel display
            document.getElementById("currentChannelNameDisplay").innerHTML = playName;
            document.getElementById("currentChannelLogo").src = logo;
            // Update the selection in the lateral menu
            var childDivs = document.getElementsByClassName('elementMenuBar');
            // for each channel in the menu
            for(var i=0; i< childDivs.length; i++ )
            {
                // reset the background color
                childDivs[i].classList.remove("selected");
                // highlight it only if its the current channel
                if(childDivs[i].innerHTML.includes("<h1>"+currentChannel+"</h1>"))
                    childDivs[i].classList.add("selected");
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

            // document.querySelector('iframe').contentDocument.body.querySelector('#ytp-watermark').style.display = 'none !important';
        }

        // CALL THE YOUTUBE API TO GET A PLAYER
        function onYouTubeIframeAPIReady()
        {
            //Quick fix degeux
            if(alreadyPlayed.length != 0 || alreadyPlayedErrors.length != 0)
            {
                alreadyPlayed=[];
                alreadyPlayedErrors=[];
            }

            // Pick a random video and update alreadyPlayed
            var vidNumber=getRandomVideoNumber();
            alreadyPlayed.push(vidNumber);
            currentVideoIndex=vidNumber;
            // Instanciation of the player
            player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                },
                playerVars: {
                    color: "white",
                    controls: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    enablejsapi: 1,
                    listType: 'playlist',
                    list: playlistID,
                    index: vidNumber,
                    fs: 0
                }
            });
        }

/* =========================================================================
    PAGE LOADING
   ========================================================================= */

    /* -----------------------------
        CHANNELS LOADING
       ----------------------------- */

        // Set the default channel (first in the channelList)
        playlistID=channelList[0][3];
        playlistNbVideos=channelList[0][4];
        currentChannel=channelList[0][0];
        currentChannelLogo=channelList[0][2];

        //Generation of the miniatures for each channel (HTML)
        var menuBarContent = "";
        var channelMiniature = "";
        setTimeout(() => {// Wait the html to be loaded (TODO : event listener)
            channelList.forEach(function miniaturesGeneration(currentChannel, index) {
                channelMiniature = '' +
                  '<div class="elementMenuBar" onclick="loadSelectedChannel(\'' + currentChannel[0] + '\',\'' + currentChannel[3] + '\',' + currentChannel[4] + ',\'' + currentChannel[2] + '\')";>' +
                    '<div class="logoElementMenuBar">' +
                      '<img src="' + currentChannel[2] + '"/>' +
                    '</div>' +
                    '<div class="titlesElementMenuBar">' +
                      '<h1>' + currentChannel[0] + '</h1>' +
                      '<h2>' + currentChannel[1] + '</h2>' +
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
        }, 300);

    /* -----------------------------
        YOUTUBE PLAYER LOADING
       ----------------------------- */

        initYT();

        /*
        Fix required for safari fullscreen
        setTimeout(() => {
            document.querySelector("video").webkitEnterFullScreen ();
        }, 3000);
        */

/* =========================================================================
    EVENT LISTENERS
   ========================================================================= */

    // FIRST LOADING
    function onPlayerReady(event)
    {
        // IF PB LOAD FIRST VIDEO
        if (player.getPlayerState() == -1)
        {
            initYT();
            return;
        }

        // QUICK FIX : Sometimes, the first registered index is false (-3 to +3 decallage to reality)
        var playIndex = player.getPlaylistIndex();
        if(playIndex != alreadyPlayed[0])
        {
            alreadyPlayed = [];
            alreadyPlayed.push(playIndex);
        }

        // Force the data actualisation (just in case)
        player.playVideo();
        updateVideoTitle();
        menuUpdate(currentChannel, currentChannelLogo);

        document.getElementById("player").removeAttribute("allowfullscreen");
        document.getElementById("player").setAttribute("allowFullScreen", "");

        // TODO c'est là le pb, on rend le bouton dispo alors que pas chargé
        setTimeout(() => {
            updatePlayerState();
        }, 1000);
    }

    // AT THE END OF THE CURRENT VIDEO
    function onPlayerStateChange(event)
    {
        // ENDED VIDEO HANDLING
        if (event.data == YT.PlayerState.ENDED)
        {
            //player.stopVideo();
            nextVideo();
            return;
        }

        // CASE WHERE THE USER CHANGE THE VIDEO WITH THE YT PLAYER (bypass the behavior)
        setTimeout(() => {
            var p = player.getPlaylistIndex();
            if(p == currentVideoIndex + 1)
            {
                nextVideo();
            }
            else if (p == currentVideoIndex - 1)
            {
                previousVideo();
            }
        }, 200);

        // In case the user changes it from the youtube interface
        updateVideoTitle();
        updatePlayerState();
    }

    // AT ERROR (when the video has been delete, got private or forbidden
    // of embdeding)
    function onPlayerError(event)
    {
        // Add the video to the errors to prevent replay with the previous button
        alreadyPlayedErrors.push(alreadyPlayed.pop());
        // Play next video
        nextVideo();
        player.playVideo();
    }