import { interfaceVisibilityController } from "../ui/interfaceVisibility.js";
import { displayModeController } from "./DisplayModeController.js";

const PLAY_ICON = "rsrc/mediaPlayer/play.svg";
const PAUSE_ICON = "rsrc/mediaPlayer/pause.svg";
const SEEK_CHAIN_TIMEOUT_MS = 1200;

export class TransportControlsController {
    constructor({
        appProvider = () => window.app,
        playerProvider = () => window.player,
        navigationProvider = () => window.JoliTubeNavigation,
        interfaceVisibility = interfaceVisibilityController,
        displayModeControls = displayModeController,
    } = {}) {
        this.appProvider = appProvider;
        this.playerProvider = playerProvider;
        this.navigationProvider = navigationProvider;
        this.interfaceVisibility = interfaceVisibility;
        this.displayModeControls = displayModeControls;
        this.pendingSeekTarget = null;
        this.lastSeekAt = 0;
    }

    get app() {
        return this.appProvider();
    }

    get player() {
        return this.playerProvider();
    }

    get navigation() {
        return this.navigationProvider();
    }

    getBackgroundPlexiglass() {
        return document.getElementById("backgroundPlexiglass");
    }

    getProgressionBar() {
        return document.getElementById("progressionBar");
    }

    getPlayButton() {
        return document.getElementById("playVideo");
    }

    getPreviousButton() {
        return document.getElementById("previousVideo");
    }

    getNextButton() {
        return document.getElementById("nextVideo");
    }

    userTimeCodeSingleton() {
        if (this.app) {
            this.app.userIsUpdatingTimeCode = true;
        }
    }

    userChangesTimeCode(event) {
        const app = this.app;
        const player = this.player;
        const value = Number(event?.target?.value);

        try {
            if (player && value >= 0) {
                player.seekTo(Math.round(value / 100), true);
            }
        } catch(e) {}

        if (app) {
            app.userIsUpdatingTimeCode = false;
        }
    }

    seekBy(seconds) {
        const player = this.player;

        try {
            const currentTime = player?.getCurrentTime();
            if (currentTime >= 0) {
                const now = Date.now();
                const canChainSeek = this.pendingSeekTarget !== null
                    && now - this.lastSeekAt < SEEK_CHAIN_TIMEOUT_MS;
                const baseTime = canChainSeek
                    ? this.pendingSeekTarget
                    : currentTime;
                const duration = typeof player.getDuration === "function"
                    ? player.getDuration()
                    : null;
                const unclampedTarget = Math.round(baseTime + seconds);
                const target = Number.isFinite(duration) && duration > 0
                    ? Math.min(Math.max(unclampedTarget, 0), Math.floor(duration))
                    : Math.max(unclampedTarget, 0);

                this.pendingSeekTarget = target;
                this.lastSeekAt = now;
                player.seekTo(target, true);
            }
        } catch(e) {}

        if (this.app) {
            this.app.userIsUpdatingTimeCode = false;
        }

        this.interfaceVisibility.show();
    }

    forwardInVideo() {
        this.seekBy(5);
    }

    backwardInVideo() {
        this.seekBy(-5);
    }

    switchFullscreenMode() {
        this.displayModeControls.toggleFullscreenControl();
        this.playOrPause();
    }

    previousVideo() {
        return this.navigation?.previousVideo?.(this.app, this.player);
    }

    nextVideo() {
        return this.navigation?.nextVideo?.(this.app, this.player);
    }

    playOrPause(event) {
        const app = this.app;

        if (!app || app.inputForbidden) {
            return;
        }

        if (app.navigationTransition === true && app.playlistReady !== true) {
            const kicked = this.navigation?.kickNavigationTransition?.(
                app,
                this.player,
                "playback toggle during navigation transition"
            );
            console.warn("[JT] playback toggle blocked during navigation transition", {
                kicked,
                navigationTransitionReason: app.navigationTransitionReason,
                expected: app.navigationTransitionExpected,
                videoUrl: typeof this.player?.getVideoUrl === "function"
                    ? this.player.getVideoUrl()
                    : null,
            });
            return;
        }

        const playButton = this.getPlayButton();
        const eventTarget = event?.target || event?.originalTarget;
        const isFromPlayPauseButton = Boolean(
            playButton
            && eventTarget
            && (
                eventTarget === playButton
                || eventTarget.src === playButton.src
            )
        );

        if (app.cursorOnInterface === false || isFromPlayPauseButton) {
            if (app.playing === true) {
                this.pauseChannel();
            }
            else if (app.playing === false) {
                this.playChannel();
            }
        }
        else {
            app.inputForbidden = false;
        }
    }

    playChannel() {
        const app = this.app;
        const player = this.player;

        try {
            if (app?.navigationTransition === true && app.playlistReady !== true) {
                const kicked = this.navigation?.kickNavigationTransition?.(
                    app,
                    player,
                    "playChannel during navigation transition"
                );
                console.warn("[JT] play blocked during navigation transition", {
                    kicked,
                    currentTime: typeof player?.getCurrentTime === "function"
                        ? player.getCurrentTime()
                        : null,
                    navigationTransitionReason: app.navigationTransitionReason,
                    expected: app.navigationTransitionExpected,
                    videoUrl: typeof player?.getVideoUrl === "function"
                        ? player.getVideoUrl()
                        : null,
                });
                app.inputForbidden = false;
                return;
            }

            app.inputForbidden = true;
            player.playVideo();
            app.playing = true;
            this.getPlayButton().src = PAUSE_ICON;
            app.inputForbidden = false;
            this.interfaceVisibility.hideCursor();
        } catch(e) {}
    }

    pauseChannel() {
        const app = this.app;
        const player = this.player;

        try {
            app.inputForbidden = true;
            player.pauseVideo();
            app.playing = false;
            this.getPlayButton().src = PLAY_ICON;
            app.inputForbidden = false;
        } catch(e) {}
    }

    updatePlayerState() {
        const app = this.app;
        const player = this.player;
        const previousButton = this.getPreviousButton();
        const nextButton = this.getNextButton();
        const playButton = this.getPlayButton();

        if (!app || !previousButton || !nextButton || !playButton) {
            return;
        }

        const canGoBack = Array.isArray(app.navigationHistory) && app.navigationCursor > 0;

        previousButton.onclick = canGoBack
            ? () => this.previousVideo()
            : "";
        previousButton.classList.toggle("disabled", !canGoBack);

        nextButton.onclick = () => this.nextVideo();
        nextButton.classList.remove("disabled");

        try {
            const playerState = player.getPlayerState();

            if (app.navigationTransition === true && app.playlistReady !== true) {
                playButton.src = PLAY_ICON;
                app.playing = false;
            }
            else if (playerState === 1) {
                app.playing = true;
                playButton.src = PAUSE_ICON;
            }
            else if (playerState === 2) {
                app.playing = false;
                playButton.src = PLAY_ICON;
            }
        } catch(e) {}
    }

    disablePlayer() {
        try {
            const previousButton = this.getPreviousButton();
            const nextButton = this.getNextButton();

            previousButton.onclick = "";
            previousButton.classList.add("disabled");
            nextButton.onclick = () => this.nextVideo();
            nextButton.classList.remove("disabled");
        } catch(e) {}
    }
}

export const transportControlsController = new TransportControlsController();
