const MUTE_ICON = "rsrc/mediaPlayer/sound-mute.svg";
const SOUND_ICONS = [
    { max: 25, src: "rsrc/mediaPlayer/sound-0.svg" },
    { max: 50, src: "rsrc/mediaPlayer/sound-1.svg" },
    { max: 75, src: "rsrc/mediaPlayer/sound-2.svg" },
    { max: 100, src: "rsrc/mediaPlayer/sound-3.svg" },
];

export class VolumeControlsController {
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

    getMuteButton() {
        return document.getElementById("mute");
    }

    getVolumeInput() {
        return document.getElementById("volume");
    }

    getVolumeBarContainer() {
        return document.getElementById("volumeBarContainer");
    }

    getVolumeFill() {
        return document.getElementById("webkitProgressFillVolume");
    }

    muteOrUnmute() {
        try {
            this.app.muteOn = this.player.isMuted() !== true;
            this.refreshVolume();
        } catch(e) {}
    }

    userChangeVolume(event) {
        try {
            if (this.player.isMuted() === true) {
                this.muteOrUnmute();
            }

            const value = Number(event?.target?.value);
            if (value >= 0) {
                this.app.volume = value;
                this.refreshVolume();
            }
        } catch(e) {}
    }

    increaseVolume() {
        try {
            if (this.player.isMuted() === true) {
                this.muteOrUnmute();
            }

            let roundedVolume = Math.ceil(10 * this.app.volume) / 10;
            if (roundedVolume === this.app.volume) {
                roundedVolume += 10;
            }

            this.app.volume = Math.min(roundedVolume, 100);
            this.refreshVolume();
        } catch(e) {}
    }

    decreaseVolume() {
        try {
            if (this.player.isMuted() === true) {
                this.muteOrUnmute();
            }

            let roundedVolume = Math.floor(10 * this.app.volume) / 10;
            if (roundedVolume === this.app.volume) {
                roundedVolume -= 10;
            }

            this.app.volume = Math.max(roundedVolume, 0);
            this.refreshVolume();
        } catch(e) {}
    }

    refreshVolume() {
        const app = this.app;
        const player = this.player;
        const muteButton = this.getMuteButton();
        const volumeInput = this.getVolumeInput();
        const volumeContainer = this.getVolumeBarContainer();
        const volumeFill = this.getVolumeFill();

        try {
            if (!app || !player || !muteButton || !volumeInput || !volumeContainer || !volumeFill) {
                return;
            }

            if (app.muteOn) {
                player.mute();
                muteButton.src = MUTE_ICON;
                volumeInput.setAttribute("disabled", "");
                volumeInput.value = 0;
                volumeContainer.classList.add("disabled");
            }
            else {
                player.unMute();
                volumeInput.removeAttribute("disabled");
                volumeContainer.classList.remove("disabled");
                volumeInput.value = app.volume;
                volumeFill.style.width = `${app.volume}%`;

                const icon = SOUND_ICONS.find(({ max }) => app.volume <= max) || SOUND_ICONS[SOUND_ICONS.length - 1];
                muteButton.src = icon.src;
            }

            player.setVolume(app.volume);
        } catch(e) {}
    }
}

export const volumeControlsController = new VolumeControlsController();
