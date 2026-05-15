const QUALITY_LABELS = {
    hd2160: "4K - 2160p",
    hd1440: "HD - 1440p",
    hd1080: "HD - 1080p",
    hd720: "HQ - 720p",
    large: "SD - 480p",
    medium: "SD - 360p",
    small: "SD - 240p",
    tiny: "SD - 144p",
    auto: "AUTO",
};

const DEFAULT_QUALITY_ORDER = ["hd2160", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny", "auto"];

export class YouTubeSettingsLoader {
    constructor({
        appProvider = () => window.app,
        playerProvider = () => window.player,
    } = {}) {
        this.appProvider = appProvider;
        this.playerProvider = playerProvider;
    }

    get app() {
        return this.appProvider();
    }

    get player() {
        return this.playerProvider();
    }

    getResolutionSelect() {
        return document.getElementById("selectResolution");
    }

    getSubtitlesSelect() {
        return document.getElementById("selectSubtitles");
    }

    getQualityOrder() {
        return Array.from(new Set(window.possibleQualitiesValues || DEFAULT_QUALITY_ORDER));
    }

    selectBestQuality(availableQualities) {
        const app = this.app;

        if (!app || !Array.isArray(availableQualities) || availableQualities.length === 0) {
            return null;
        }

        if (app.priorityToMaxRes) {
            return availableQualities[0];
        }

        if (availableQualities.includes(app.currentQuality)) {
            return app.currentQuality;
        }

        const qualityOrder = this.getQualityOrder();
        const preferredQualityIndex = qualityOrder.indexOf(app.currentQuality);
        const searchStart = preferredQualityIndex >= 0 ? preferredQualityIndex + 1 : 0;

        for (let index = searchStart; index < qualityOrder.length; index++) {
            if (availableQualities.includes(qualityOrder[index])) {
                return qualityOrder[index];
            }
        }

        return availableQualities[0];
    }

    renderQualityOptions(availableQualities) {
        const app = this.app;
        const selectResolution = this.getResolutionSelect();

        if (!app || !selectResolution) {
            return;
        }

        selectResolution.replaceChildren();

        for (const quality of availableQualities) {
            const option = document.createElement("option");
            option.value = quality;
            option.textContent = QUALITY_LABELS[quality] || quality;
            option.selected = quality === app.currentQuality;
            selectResolution.append(option);
        }

        selectResolution.disabled = availableQualities.length === 0;
    }

    loadQuality() {
        const interval = setInterval(() => {
            const app = this.app;
            const player = this.player;

            try {
                if (!app || !player) {
                    return;
                }

                const availableQualities = player.getAvailableQualityLevels?.() || [];
                app.availablesQualities = availableQualities;

                if (availableQualities.length === 0) {
                    this.renderQualityOptions([]);
                    return;
                }

                if (app.currentQuality == null) {
                    app.currentQuality = player.getPlaybackQuality?.();
                }

                app.currentQuality = this.selectBestQuality(availableQualities);
                this.renderQualityOptions(availableQualities);
                player.setPlaybackQuality?.(app.currentQuality);
                clearInterval(interval);
            } catch(e) {}
        }, 20);
    }

    updateLanguagesRanks(languageIndex) {
        const app = this.app;

        if (!app) {
            return;
        }

        for (let index = 0; index < app.subtitlesPrefList.length; index++) {
            if (app.subtitlesPrefMatrice[languageIndex][index] > app.subtitlesPrefMatrice[index][languageIndex]) {
                if (languageIndex > index) {
                    app.subtitlesPrefList.splice(index, 0, app.subtitlesPrefList.splice(languageIndex, 1)[0]);
                    app.subtitlesPrefMatrice.splice(index, 0, app.subtitlesPrefMatrice.splice(languageIndex, 1)[0]);
                }
            }
        }
    }

    updateLanguagesStats(languageIndex, availableTracks) {
        const app = this.app;

        if (!app) {
            return;
        }

        for (let index = 0; index < app.subtitlesPrefMatrice[languageIndex].length; index++) {
            for (const track of availableTracks) {
                if (app.subtitlesPrefList[index] === track.languageCode) {
                    app.subtitlesPrefMatrice[languageIndex][index]++;
                }
            }

            if (app.subtitlesPrefList[index] === "off") {
                app.subtitlesPrefMatrice[languageIndex][app.subtitlesPrefList.indexOf("off")]++;
            }
        }

        this.updateLanguagesRanks(languageIndex);
    }

    findPreferredSubtitleLanguage(captionsList) {
        const app = this.app;

        if (!app || !Array.isArray(captionsList)) {
            return "off";
        }

        const availableLanguages = new Set(captionsList.map((caption) => caption.languageCode));
        return app.subtitlesPrefList.find((language) => language === "off" || availableLanguages.has(language)) || "off";
    }

    setCaptionsWidth(selectSubtitles, widthMultiplier = null, widthOffset = 3) {
        if (!selectSubtitles) {
            return;
        }

        const currentOption = selectSubtitles.selectedOptions?.[0];
        const textLength = widthMultiplier ?? (currentOption?.textContent?.length || 10) * 0.8;
        selectSubtitles.style.width = `calc(${textLength} * var(--h2FontSize) + ${widthOffset} * var(--h4FontSize))`;
    }

    renderNoCaptions(selectSubtitles) {
        const player = this.player;

        selectSubtitles.replaceChildren(new Option("No Subtitles", "off", true, true));
        selectSubtitles.disabled = true;
        selectSubtitles.style.display = "none";
        player?.unloadModule?.("captions");
        this.setCaptionsWidth(selectSubtitles, 10, 0);
    }

    renderCaptions(captionsList, selectSubtitles) {
        const app = this.app;
        const player = this.player;

        if (!app || !player) {
            return;
        }

        player.loadModule?.("captions");

        if (!app.subtitlesManuallySelected) {
            app.currentSubtitlesLanguage = this.findPreferredSubtitleLanguage(captionsList);
            app.subtitlesOn = app.currentSubtitlesLanguage !== "off";
        }
        else {
            const selectedLanguageIndex = app.subtitlesPrefList.indexOf(app.currentSubtitlesLanguage);
            if (selectedLanguageIndex >= 0) {
                this.updateLanguagesStats(selectedLanguageIndex, captionsList);
            }
        }

        selectSubtitles.replaceChildren();

        for (const caption of captionsList) {
            const option = document.createElement("option");
            option.value = caption.languageCode;
            option.textContent = caption.languageName;
            option.selected = caption.languageCode === app.currentSubtitlesLanguage;
            selectSubtitles.append(option);
        }

        const offOption = document.createElement("option");
        offOption.value = "off";
        offOption.textContent = "Off";
        offOption.selected = app.subtitlesOn === false;
        selectSubtitles.append(offOption);

        selectSubtitles.disabled = false;
        selectSubtitles.style.display = "";

        if (app.subtitlesOn === true) {
            player.setOption?.("captions", "track", { languageCode: app.currentSubtitlesLanguage });
        }
        else {
            player.unloadModule?.("captions");
        }

        this.setCaptionsWidth(selectSubtitles);
        app.subtitlesManuallySelected = false;
    }

    loadCaptions() {
        const interval = setInterval(() => {
            const app = this.app;
            const player = this.player;
            const selectSubtitles = this.getSubtitlesSelect();

            try {
                if (!app || !player || !selectSubtitles) {
                    return;
                }

                const captionsList = player.getOption?.("captions", "tracklist");
                const selectedTrack = player.getOption?.("captions", "track");

                if (captionsList === undefined) {
                    return;
                }

                if (app.currentSubtitlesLanguage === null) {
                    app.currentSubtitlesLanguage = selectedTrack?.languageCode || "off";
                }

                if (captionsList.length === 0) {
                    this.renderNoCaptions(selectSubtitles);
                    app.subtitlesLoadingAttempts++;
                }
                else {
                    this.renderCaptions(captionsList, selectSubtitles);
                }

                if (app.subtitlesLoadingAttempts > 50 || captionsList.length > 0) {
                    clearInterval(interval);
                }
            } catch(e) {}
        }, 150);
    }

    hideCaptions() {
        const selectSubtitles = this.getSubtitlesSelect();

        if (!selectSubtitles) {
            return;
        }

        selectSubtitles.replaceChildren();
        selectSubtitles.style.display = "none";
    }
}

export const youTubeSettingsLoader = new YouTubeSettingsLoader();
