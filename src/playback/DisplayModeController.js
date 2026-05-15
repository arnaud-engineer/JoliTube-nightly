import { interfaceVisibilityController } from "../ui/interfaceVisibility.js";

const FULLSCREEN_ON_ICON = "rsrc/mediaPlayer/fullscreen-on.svg";
const FULLSCREEN_OFF_ICON = "rsrc/mediaPlayer/fullscreen-off.svg";
const THEATER_ICON = "rsrc/mediaPlayer/theater-mode.svg";
const FILL_ICON = "rsrc/mediaPlayer/fill-mode.svg";

export class DisplayModeController {
    constructor({
        appProvider = () => window.app,
        interfaceVisibility = interfaceVisibilityController,
        updateRealTimeData = () => window.updateRealTimeData?.(),
    } = {}) {
        this.appProvider = appProvider;
        this.interfaceVisibility = interfaceVisibility;
        this.updateRealTimeDataCallback = updateRealTimeData;
    }

    get app() {
        return this.appProvider();
    }

    getFillingModeButton() {
        return document.getElementById("fillingmode");
    }

    getFullscreenButton() {
        return document.getElementById("fullscreen");
    }

    getPlayerContainer() {
        return document.getElementById("playerContainer");
    }

    toggleFullscreenControl() {
        if (this.app?.fullscreenStatus === false) {
            this.goFullScreen();
        }
        else {
            this.endFullScreen();
        }
    }

    goFullScreen() {
        const app = this.app;
        const button = this.getFullscreenButton();

        if (!app || app.fullscreenStatus !== false || !button) {
            return;
        }

        app.fullscreenStatus = true;
        button.setAttribute("display", "none");
        document.getElementsByTagName("body")[0]?.requestFullscreen?.();
        button.setAttribute("src", FULLSCREEN_OFF_ICON);
        button.setAttribute("display", "block");
        this.updateRealTimeDataCallback();
    }

    endFullScreen() {
        const app = this.app;
        const button = this.getFullscreenButton();

        if (!app || app.fullscreenStatus !== true || !button) {
            return;
        }

        button.setAttribute("display", "none");
        document.exitFullscreen?.();
        button.setAttribute("src", FULLSCREEN_ON_ICON);
        button.setAttribute("display", "block");
        app.fullscreenStatus = false;
        this.interfaceVisibility.show();
        this.updateRealTimeDataCallback();
    }

    goFillMode() {
        const app = this.app;
        const button = this.getFillingModeButton();

        if (!app || !button) {
            return;
        }

        button.setAttribute("display", "none");
        app.theaterOn = false;
        this.getPlayerContainer()?.classList.add("plain");
        button.setAttribute("src", THEATER_ICON);
        button.setAttribute("display", "block");
        this.interfaceVisibility.show();
    }

    goTheaterMode() {
        const app = this.app;
        const button = this.getFillingModeButton();

        if (!app || !button) {
            return;
        }

        button.setAttribute("display", "none");
        app.theaterOn = true;
        this.getPlayerContainer()?.classList.remove("plain");
        button.setAttribute("src", FILL_ICON);
        button.setAttribute("display", "block");
        this.interfaceVisibility.show();
    }

    goTheatherMode() {
        this.goTheaterMode();
    }

    toggleTheaterMode() {
        if (this.app?.theaterOn === true) {
            this.goFillMode();
        }
        else {
            this.goTheaterMode();
        }
    }
}

export const displayModeController = new DisplayModeController();
