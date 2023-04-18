var possibleQualitiesValues = ["hd2160", "hd1440", "hd1080", "hd720", "large", "hd720", "medium", "small", "tiny", "auto"];

/* =========================================================================
    CHANNELS LIST
   ========================================================================= */

        /*
        STRUCTURE FOR A CHANNEL :
          - Title : 21 caracters
          - Description : 25 caracters
          - Logo : link to the img in rsrc/channelsLogos/
          - Playlist ID : you can find it the playlist URL
          - Curator ID
        */

var curratorsList = [
    ["arnaud.cool","https://arnaud.cool/"],
    ["MrHassancehef","https://www.youtube.com/@MrHassancehef/videos"],
    ["Walter Proof","https://www.linaudible.com/"],
    ["Nolife", "https://nolife-wiki.fr/Accueil"]
]


var channelList = [
	// Premium
    ["TEST","TEST","rsrc/channelsLogos/JoliTubePlus.png","PLEJ0pOW0FHeECH6Q4OuOSkujC8Grt11Vo",0],
    ["JoliTube +","Les derniers ajouts","rsrc/channelsLogos/JoliTubePlus.png","PLEJ0pOW0FHeELfQtk-6za-V7Pirc15Nax",0],
    ["JoliTube + Séries","Essayez des séries","rsrc/channelsLogos/JoliTubeSeries.png","PLEJ0pOW0FHeGn_AMco5NL9QbZPdaIJ0sK",0],
    ["JoliTube + Cinéma","Pop-corn vendu séparément","rsrc/channelsLogos/JoliTubeCinema.png","PLEJ0pOW0FHeGv1QU3JIuqYnGoIP3a7J0r",0],
    ["JoliTube + Courts","Comme un long mais court","rsrc/channelsLogos/JoliTubeCourts.png","PLEJ0pOW0FHeF7sE3tM3HsrAEhdQaNT1Zl",0],
    ["JoliTube + Spectacles","Show ou pas show ?","rsrc/channelsLogos/JoliTubeSpectacles.png","PLEJ0pOW0FHeFifm36Yj6WN0OitSMuJ4YR",0],
    // Cinéma
    ["Old Movies","C'est moins cher que Netflix","rsrc/channelsLogos/OldMovies.png","PLEJ0pOW0FHeFgOC544ujQty-gONR9GJVw",0],
    //["JoliTube Ciné Cancer","C'est meilleur quand c'est nul","rsrc/channelsLogos/JoliTubeWebSeries.png","PLEJ0pOW0FHeFn4qMaIWp-N0XA4rFmrbwW"],
    // Comédie
    ["Comédie","Blagues de l\'Internouille","rsrc/channelsLogos/Comedie.png","PLEJ0pOW0FHeGM2aj0qVizu5PFd5OZpfft",0],
    ["Comedy","Jokes made in Internet","rsrc/channelsLogos/Comedy.png","PLEJ0pOW0FHeF2Nr7x5qCipkRAT0-DRi63",0],
    ["Old Comédie","C\'était sympa Dailymotion","rsrc/channelsLogos/OldComedie.png","PLEJ0pOW0FHeHXID5VahhSdu2ZvRWUOM3J",0],
    ["Old Comedy","YouTube used to be funny","rsrc/channelsLogos/OldComedy.png","PLEJ0pOW0FHeFn19WRTmLeNCby6_VB-voT",0],
    ["Funnier MTV","C\'est mieux avec des blagues","rsrc/channelsLogos/FunnierMTV.png","PLEJ0pOW0FHeFGAcuPQTlLpV0beaNyu_Ua",0],
    ["YouTube Poop","Because It\'s where the poop is","rsrc/channelsLogos/ComedieYTP2.png","PLEJ0pOW0FHeForGVS9CZk6riBHOLmQnmj",0],
    ["The Eric Andre Show","Trash & absurd","rsrc/channelsLogos/The_Eric_Andre_Logo.png","PLEJ0pOW0FHeGQyVUPTE-qhJwKKtZQHm4u",0],
    //Musique
    ["MTV Eclectic Party","Bordel audible de soirée","rsrc/channelsLogos/MTV_Party.png","PLEJ0pOW0FHeF5LvDjIxUMLdv1Xh_Jt-bV",0],
    ["MTV Covers","Les grands artistes volent","rsrc/channelsLogos/MTV_Covers.png","PLEJ0pOW0FHeEOZsliVPFJ0uVYksimlsJt",0],
    ["MTV Mashups","Deux hits valent mieux qu'un","rsrc/channelsLogos/MTV_Mashups.png","PLEJ0pOW0FHeGlfiwS36aYUpV6JJumUeDF",0],
    ["MTV +BCDM","+ Belles chansons du Monde","rsrc/channelsLogos/MTV_BCDM.png","PLEJ0pOW0FHeHhqQqSNbwfkwKbUx1II1Je",2],
    ["MTV Visual","La Musique qui se regarde","rsrc/channelsLogos/MTV_Visual.png","PLEJ0pOW0FHeHq4zPJMSym3v5QQOltZ38A",0],
    ["MTV Random","Surprennament, ça existe","rsrc/channelsLogos/MTV_Random.png","PLEJ0pOW0FHeEFm0IBxq8lzZFfT06d1aLr",0],
    ["MTV Unusual","Sons et instruments bizarres","rsrc/channelsLogos/MTV_Unusual.png","PLEJ0pOW0FHeE0KFtYvOqy-j-dMJrJUNJt",0],
    ["MTV Shitty","Shitty music is the best","rsrc/channelsLogos/MTVShitty.png","PLEJ0pOW0FHeEK-TjsvdDacq3_eDyAQwDh",0],
    ["MTV Otamatone","Tout est mieux à l'Otamatone","rsrc/channelsLogos/MTV_Otamatone.png","PLEJ0pOW0FHeFBnYENy5LWpfAHcJ4NDjCs",0],
    ["MTV Flute","Un instrument sous estimé","rsrc/channelsLogos/MTV_Flute.png","PLEJ0pOW0FHeGfuXlbqgYXiZKWTnEGwCex",0],
    ["Euro 2000","Eurodance & euroambiance","rsrc/channelsLogos/Euro2000.png","PLEJ0pOW0FHeFRwE7WTbteW1OvJ6fTgZQ6",0],
    ["Eurovision","Sans le décompte des points","rsrc/channelsLogos/Eurovision.png","PLEJ0pOW0FHeHnxrwXg_QDKFgs5j7JLdKl",0],
    ["PostModern","Back to the Future","rsrc/channelsLogos/PostMo.png","PLEJ0pOW0FHeHXBa2L9ZA4vURmbpC4mNtx",0],
    ["PostMo 30","30\'s rocks","rsrc/channelsLogos/PostMo30.png","PLEJ0pOW0FHeE2RaM1qJbcLbJ6E03vp6R9",0],
    ["PostMo 60","60\'s Forever","rsrc/channelsLogos/PostMo60.png","PLEJ0pOW0FHeHWT-SDeRgvrZyA6zz8zkcD",0],
    ["PostMo 80","Synthwave partout","rsrc/channelsLogos/PostMo80.png","PLEJ0pOW0FHeExdr1E-CzhMeVwh-ggWBcE",0],
    ["PostMo Symph","Pop-symphonique","rsrc/channelsLogos/PostMoSymph.png","PLEJ0pOW0FHeFbplYMHal9mvYJtQSY7Jhv",0],
    ["Paroles","Les pas plus grands textes","rsrc/channelsLogos/ParolesTV.png","PLEJ0pOW0FHeHfo8D0450uwDXsC2SvBicf",0],
    ["Coco Hits Only","Marx avait raison","rsrc/channelsLogos/CocoTV.png","PLEJ0pOW0FHeFc3nuqu0G7Xsl2ZwOfEsMT",0],
    ["Zik2Kebab","Ambiance ton maître-kebabier","rsrc/channelsLogos/Zik2Kebab.png","PLEJ0pOW0FHeGBqy3eZmsU5jo0v5yBp47d",1],
    ["SilvaGunner","Fake Video Games Music Only","rsrc/channelsLogos/silvaGunner.png","PLEJ0pOW0FHeGRJKoolDq3hruSs7IW1ynF",0],
    ["Britney","100 % Britney Spears","rsrc/channelsLogos/britney.png","PLEJ0pOW0FHeH7eFJ_xhL95mPyUFaPF4DL",0],
    //Jeunesse
    ["Disney Channel Music","Ton enfance leur appartient","rsrc/channelsLogos/MTVDisneyStore.png","PLEJ0pOW0FHeFq5itu2wEmmHCf7CrJcbp_",0],
    ["Canal J","Tu peux sortir les céréales","rsrc/channelsLogos/CanalJ.png","PLEJ0pOW0FHeHN170F8w7Y5YoXRJI83Fiv",0],
    ["YouTube Kids","C\'est compliqué ...","rsrc/channelsLogos/YouTubeKids.png","PLEJ0pOW0FHeES9YZTEYfo3iJI3inSGBtL",0],
    ["JeuxLeVeux","100% pubs, 0% dessins animés","rsrc/channelsLogos/JeuxLeVeux.png","PLEJ0pOW0FHeEU0Aomd50p-Ps8_6-zUHHH",0],
    // Nouvelle génération
    ["[adult anim]","Animation pour les grands","rsrc/channelsLogos/AdultAnim.png","PLEJ0pOW0FHeFN5aWnQO026Rq3ybmtaDTq",0],
    ["[sureal anim]","Animation pour les weirdos","rsrc/channelsLogos/AdultAnimSureal.png","PLEJ0pOW0FHeF5dkaPtUFGUL5bKHLIXHxN",0],
    ["Cyriak","Animation surréel et psyché","rsrc/channelsLogos/Cyriak.png","PLEJ0pOW0FHeHfV7ox0iHKFn3Gs6zU8FTc",0],
    // Fond de grille
    ["Random TV","Ainsi soit-il","rsrc/channelsLogos/randomTV.png","PLEJ0pOW0FHeFLhiQ1-2bi-oIUp-FPMojH",0],
    ["Random TV Speed","Pas le temps de niaiser","rsrc/channelsLogos/randomTVspeed.png","PLEJ0pOW0FHeFeJK_JkPmIGdyHt1q3fGv6",0],
    ["Random TV Petit Tube","Tu n'as jamais vu ces vidéos","rsrc/channelsLogos/randomTVPetitTube.png","PLEJ0pOW0FHeGSac-RPj03xmhYold-8hmO",0],
    ["Memory Hole","L'angoisse des 90's","rsrc/channelsLogos/MemoryHole.png","PLEJ0pOW0FHeE2U_-OtyXrORU-X8ttTUxl",0],
    ["Ads","Vu sur YouTube","rsrc/channelsLogos/ads.png","PLEJ0pOW0FHeFDRzAS6u6m2Oagn0-qClul",0],
    ["SeuNeuCeuFeu TV","Une ambiance de Tchou tchou","rsrc/channelsLogos/SeuNeuCeuFeu.png","PLEJ0pOW0FHeGWvKiPBN0OybmreMjSCOHt",0],
    ["Vidéo Grande Conso","N°1 sur le commerce de détail","rsrc/channelsLogos/VCG.png","PLEJ0pOW0FHeEOjiyKHydyn3Z5IptUayVR",0],
    ["Steve Ballmer","Ce n\'est pas Steve Jobs","rsrc/channelsLogos/Ballmer.png","PLEJ0pOW0FHeGj5HQlf2BoahmvpdNYv9BO",0],
    ["Ambient Music","Musique d'ambiance","rsrc/channelsLogos/AmbientMusic.png","PLEJ0pOW0FHeHjVH8BzOWQG4aDn0pjLfTR",0],
    ["Ambient ScreenSaver","Des visuels pour vos soirées","rsrc/channelsLogos/AmbientScreenSaver.png","PLEJ0pOW0FHeHP5HNjoQdoAPRLI3MZKS_D",0],
    ["Ambient Window","Une fenêtre sur le monde","rsrc/channelsLogos/AmbientWindow.png","PLEJ0pOW0FHeGIgL2QjcYyz0VqHLdctBo7",0],
    ["Ambient Journey","La fenêtre du train en mieux","rsrc/channelsLogos/AmbientJourney.png","PLEJ0pOW0FHeHZoH7H1vak_JV_-xkZSNbQ",0],
    // Étranger
    ["Planeta HD","Le meilleur de la pop bulgare","rsrc/channelsLogos/PlanetaHD.png","PLEJ0pOW0FHeGqtnSc4a12cE0EWa1Jw5jT",0],
    ["Tiankov","N°1 sur la folk bulgare","rsrc/channelsLogos/Tiankov.png","PLEJ0pOW0FHeHYinJjgquQVGAaGDjLasPV",0],
    ["RTB et amis","Tous tiers-monde d\'un autre","rsrc/channelsLogos/rtb.png","PLEJ0pOW0FHeGgMBBRCEUPVF586EMDKp9o",0],
    ["Téléfrançais","Apprendons le Français","rsrc/channelsLogos/telefrancais.jpg","PLEJ0pOW0FHeGIHzCMPZL9qNn9KdL_RiOU",0],
    //telefrancais.jpg
    // Fin fond de grille
    ["ATMO1777","Va voir, tu comprendras","rsrc/channelsLogos/ATMO1777.png","PLxGjXN7GLGCtUer7H5934MwtYXC6dPFyg",1],
    ["ATMO3003","Va comprendre, tu verras","rsrc/channelsLogos/ATMO3003.png","PLxGjXN7GLGCtPSG7Hh4ZQyWiqjdxf_RCQ",1],
    ["Chill of the trade","Keep calm, stay corporate","rsrc/channelsLogos/ChillOfTheTrade.png","PLxGjXN7GLGCsPN51q2a_uVvrY1E_PsHMD",0],
    ["J-TOP","Nolife ne meurt jamais","rsrc/channelsLogos/Jtop.png","PLhPXaGzNx63GViI0aZCYtzttRsjsrNx7_",3]
];