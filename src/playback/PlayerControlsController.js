import { displayModeController } from "./DisplayModeController.js";
import { PlaybackSettingsController } from "./PlaybackSettingsController.js";
import { transportControlsController } from "./TransportControlsController.js";
import { volumeControlsController } from "./VolumeControlsController.js";

export class PlayerControlsController {
    constructor({
        appProvider = () => window.app,
        playerProvider = () => window.player,
        displayModeControls = displayModeController,
        playbackSettings = null,
        transportControls = transportControlsController,
        volumeControls = volumeControlsController,
        loadQuality = () => window.loadQuality?.(),
        loadCaptions = () => window.loadCaptions?.(),
    } = {}) {
        this.displayModeControls = displayModeControls;
        this.transportControls = transportControls;
        this.playbackSettings = playbackSettings || new PlaybackSettingsController({
            appProvider,
            playerProvider,
            playbackToggle: () => this.playOrPause(),
            loadQuality,
            loadCaptions,
        });
        this.volumeControls = volumeControls;
        this.started = false;
    }

    start() {
        if (this.started) {
            return;
        }

        this.started = true;
        this.bindDomEvents();
    }

    bindDomEvents() {
        this.transportControls.getBackgroundPlexiglass()?.addEventListener("click", (event) => {
            this.transportControls.playOrPause(event);
        });

        this.transportControls.getBackgroundPlexiglass()?.addEventListener("dblclick", () => {
            this.transportControls.switchFullscreenMode();
            this.transportControls.playOrPause();
        });

        this.transportControls.getProgressionBar()?.addEventListener("input", (event) => {
            this.transportControls.userChangesTimeCode(event);
        });

        this.transportControls.getProgressionBar()?.addEventListener("click", () => {
            this.transportControls.userTimeCodeSingleton();
        });

        this.transportControls.getPlayButton()?.addEventListener("click", (event) => {
            this.transportControls.playOrPause(event);
        });

        this.playbackSettings.getResolutionSelect()?.addEventListener("change", (event) => {
            this.playbackSettings.userChangeQuality(event);
        });

        this.playbackSettings.getSpeedSelect()?.addEventListener("click", () => {
            this.playbackSettings.userIsChoosingSpeed();
        });

        this.playbackSettings.getSpeedSelect()?.addEventListener("change", (event) => {
            this.playbackSettings.userChangeSpeed(event);
        });

        this.playbackSettings.getSubtitlesSelect()?.addEventListener("click", () => {
            this.playbackSettings.userIsChoosingCaptions();
        });

        this.playbackSettings.getSubtitlesSelect()?.addEventListener("change", (event) => {
            this.playbackSettings.userChangeCaptions(event);
        });

        this.getMuteButton()?.addEventListener("mousedown", () => {
            this.volumeControls.muteOrUnmute();
        });

        this.getVolumeInput()?.addEventListener("input", (event) => {
            this.volumeControls.userChangeVolume(event);
        });

        this.getFillingModeButton()?.addEventListener("mousedown", () => {
            this.displayModeControls.toggleTheaterMode();
        });

        this.getFullscreenButton()?.addEventListener("mousedown", () => {
            this.displayModeControls.toggleFullscreenControl();
        });
    }

    getMuteButton() {
        return document.getElementById("mute");
    }

    getVolumeInput() {
        return document.getElementById("volume");
    }

    getFillingModeButton() {
        return document.getElementById("fillingmode");
    }

    getFullscreenButton() {
        return document.getElementById("fullscreen");
    }

    userTimeCodeSingleton() {
        this.transportControls.userTimeCodeSingleton();
    }

    userChangesTimeCode(event) {
        this.transportControls.userChangesTimeCode(event);
    }

    seekBy(seconds) {
        this.transportControls.seekBy(seconds);
    }

    forwardInVideo() {
        this.transportControls.forwardInVideo();
    }

    backwardInVideo() {
        this.transportControls.backwardInVideo();
    }

    switchFullscreenMode() {
        this.transportControls.switchFullscreenMode();
    }

    toggleFullscreenControl() {
        this.displayModeControls.toggleFullscreenControl();
    }

    goFullScreen() {
        this.displayModeControls.goFullScreen();
    }

    endFullScreen() {
        this.displayModeControls.endFullScreen();
    }

    goFillMode() {
        this.displayModeControls.goFillMode();
    }

    goTheaterMode() {
        this.displayModeControls.goTheaterMode();
    }

    goTheatherMode() {
        this.displayModeControls.goTheatherMode();
    }

    toggleTheaterMode() {
        this.displayModeControls.toggleTheaterMode();
    }

    previousVideo() {
        return this.transportControls.previousVideo();
    }

    nextVideo() {
        return this.transportControls.nextVideo();
    }

    playOrPause(event) {
        return this.transportControls.playOrPause(event);
    }

    playChannel() {
        this.transportControls.playChannel();
    }

    pauseChannel() {
        this.transportControls.pauseChannel();
    }

    updatePlayerState() {
        this.transportControls.updatePlayerState();
    }

    disablePlayer() {
        this.transportControls.disablePlayer();
    }

    muteOrUnmute() {
        this.volumeControls.muteOrUnmute();
    }

    userChangeVolume(event) {
        this.volumeControls.userChangeVolume(event);
    }

    increaseVolume() {
        this.volumeControls.increaseVolume();
    }

    decreaseVolume() {
        this.volumeControls.decreaseVolume();
    }

    refreshVolume() {
        this.volumeControls.refreshVolume();
    }

    userChangeQuality(event) {
        this.playbackSettings.userChangeQuality(event);
    }

    nextSpeed(event) {
        this.playbackSettings.nextSpeed(event);
    }

    userChangeSpeed(event) {
        this.playbackSettings.userChangeSpeed(event);
    }

    userIsChoosingSpeed() {
        this.playbackSettings.userIsChoosingSpeed();
    }

    userIsNotChoosingSpeed() {
        this.playbackSettings.userIsNotChoosingSpeed();
    }

    userChangeCaptions(event) {
        this.playbackSettings.userChangeCaptions(event);
    }

    userIsChoosingCaptions() {
        this.playbackSettings.userIsChoosingCaptions();
    }
}

export const playerControlsController = new PlayerControlsController();
