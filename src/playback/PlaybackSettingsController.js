const SPEED_VALUES = [0.25, 0.5, 1, 1.5, 2];

export class PlaybackSettingsController {
    constructor({
        appProvider = () => window.app,
        playerProvider = () => window.player,
        playbackToggle = () => {},
        loadQuality = () => window.loadQuality?.(),
        loadCaptions = () => window.loadCaptions?.(),
    } = {}) {
        this.appProvider = appProvider;
        this.playerProvider = playerProvider;
        this.playbackToggleCallback = playbackToggle;
        this.loadQualityCallback = loadQuality;
        this.loadCaptionsCallback = loadCaptions;
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

    getSpeedSelect() {
        return document.getElementById("selectSpeed");
    }

    getSubtitlesSelect() {
        return document.getElementById("selectSubtitles");
    }

    userChangeQuality(event) {
        const app = this.app;
        const value = event?.target?.value;
        const possibleQualities = window.possibleQualitiesValues || [];

        if (!app || value === undefined) {
            return;
        }

        if (possibleQualities.indexOf(value) >= 1) {
            app.userSelectedMaxRes = value;
            app.priorityToMaxRes = false;
        }
        else if (possibleQualities.indexOf(value) === 0) {
            app.userSelectedMaxRes = value;
            app.priorityToMaxRes = true;
        }

        app.currentQuality = value;
        this.loadQualityCallback();
    }

    nextSpeed(event) {
        event?.stopPropagation?.();
        this.userIsChoosingSpeed();

        let nextValueIndex = SPEED_VALUES.indexOf(this.app?.speed) + 1;

        if (nextValueIndex >= SPEED_VALUES.length) {
            nextValueIndex = 0;
        }

        const nextValue = SPEED_VALUES[nextValueIndex];

        try {
            this.player.setPlaybackRate(nextValue);
            this.app.speed = nextValue;
            this.getSpeedSelect().value = this.app.speed;
        } catch(e) {}

        this.userIsNotChoosingSpeed();
    }

    userChangeSpeed(event) {
        event?.stopPropagation?.();
        this.userIsChoosingSpeed();

        try {
            const value = Number.parseFloat(event?.target?.value);
            this.player.setPlaybackRate(value);
            this.app.speed = value;
            this.getSpeedSelect().value = this.app.speed;
        } catch(e) {}

        this.userIsNotChoosingSpeed();
        this.playbackToggleCallback();
        this.playbackToggleCallback();
    }

    userIsChoosingSpeed() {
        if (!this.app) {
            return;
        }

        this.app.userNotChoosingSpeed = false;
        this.app.inputForbidden = true;
    }

    userIsNotChoosingSpeed() {
        if (!this.app) {
            return;
        }

        this.app.userNotChoosingSpeed = true;
        this.app.inputForbidden = false;
    }

    userChangeCaptions(event) {
        const app = this.app;
        const selectSubtitles = event?.target;
        const currentOption = selectSubtitles?.selectedOptions?.[0];

        if (!app || !currentOption) {
            return;
        }

        app.subtitlesManuallySelected = true;
        app.currentSubtitlesLanguage = currentOption.value;
        app.subtitlesOn = app.currentSubtitlesLanguage !== "off";
        this.loadCaptionsCallback();
        app.userNotChoosingSubtitles = true;
    }

    userIsChoosingCaptions() {
        if (this.app) {
            this.app.userNotChoosingSubtitles = false;
        }
    }
}

export const playbackSettingsController = new PlaybackSettingsController();
