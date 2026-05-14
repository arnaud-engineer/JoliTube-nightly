/*
 * InterfaceVisibilityController
 *
 * Owns the legacy chrome visibility behavior:
 * - show/hide header, channel menu, and control panel
 * - cursor visibility over the player glass
 * - inactivity-driven auto-hide timers
 * - DOM event bindings previously declared inline in index.html
 */

export class InterfaceVisibilityController {
    constructor({
        appProvider = () => window.app,
    } = {}) {
        this.appProvider = appProvider;
        this.started = false;
    }

    get app() {
        return this.appProvider();
    }

    start() {
        if (this.started) {
            return;
        }

        this.started = true;
        this.installGlobalBridge();
        this.bindDomEvents();
    }

    installGlobalBridge() {
        window.showInterface = () => {
            this.show();
        };

        window.hideInterface = () => {
            this.hide();
        };

        window.showCursor = () => {
            this.showCursor();
        };

        window.hideCursor = () => {
            this.hideCursor();
        };

        window.cursorEnterInterface = () => {
            this.cursorEnter();
        };

        window.cursorExitInterface = () => {
            this.cursorExit();
        };

        window.autoHide = () => {
            this.autoHide();
        };
    }

    bindDomEvents() {
        document.body?.addEventListener("mousemove", () => {
            this.show();
        });

        [
            document.getElementsByTagName("header")[0],
            document.getElementById("channels"),
            document.getElementById("menuControler"),
        ].forEach((element) => {
            element?.addEventListener("mouseenter", () => {
                this.cursorEnter();
            });

            element?.addEventListener("mouseleave", () => {
                this.cursorExit();
            });
        });

        document.getElementById("menuControler")?.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    getHeader() {
        return document.getElementsByTagName("header")[0];
    }

    getChannels() {
        return document.getElementById("channels");
    }

    getMenuController() {
        return document.getElementById("menuControler");
    }

    getBackgroundPlexiglass() {
        return document.getElementById("backgroundPlexiglass");
    }

    isHideAllowed() {
        const app = this.app;

        return Boolean(
            app
            && app.searchSingleton === false
            && app.NbDisplayTimer === 0
            && app.noUserInterraction === true
            && app.cursorOnInterface === false
            && app.playing === true
            && app.userNotChoosingSubtitles === true
            && app.userNotChoosingSpeed === true
        );
    }

    isDeepHideAllowed() {
        return Boolean(
            this.isHideAllowed()
            && this.getMenuController()?.classList.contains("hidden")
        );
    }

    show() {
        const app = this.app;
        const header = this.getHeader();
        const channels = this.getChannels();
        const menuController = this.getMenuController();

        if (!app || !header || !channels || !menuController) {
            return;
        }

        app.noUserInterraction = false;

        header.classList.remove("hidden");
        header.classList.remove("reduced");
        header.classList.remove("disappearing");
        channels.classList.remove("hidden");
        menuController.classList.remove("hidden");
        header.classList.add("displayed");
        channels.classList.add("displayed");
        menuController.classList.add("displayed");

        app.noUserInterraction = true;
        this.showCursor();
        app.displayTimerOn = true;
        app.NbDisplayTimer++;
        this.autoHide();

        window.setTimeout(() => {
            if (app.NbDisplayTimer > 0) {
                app.NbDisplayTimer--;
            }

            if (app.NbDisplayTimer === 0) {
                app.displayTimerOn = false;
            }
        }, app.totalTimeToHide / 2);
    }

    showCursor() {
        const background = this.getBackgroundPlexiglass();

        if (!background) {
            return;
        }

        background.classList.remove("nocursor");
        background.classList.add("cursor");
    }

    hideCursor() {
        const background = this.getBackgroundPlexiglass();

        if (!background) {
            return;
        }

        background.classList.remove("cursor");
        background.classList.add("nocursor");
        background.focus();
    }

    cursorEnter() {
        const app = this.app;

        if (app) {
            app.cursorOnInterface = true;
        }

        this.show();
    }

    cursorExit() {
        const app = this.app;

        if (app) {
            app.cursorOnInterface = false;
        }
    }

    hide() {
        const app = this.app;
        const header = this.getHeader();
        const channels = this.getChannels();
        const menuController = this.getMenuController();

        if (!app || !header || !channels || !menuController || !this.isHideAllowed()) {
            return;
        }

        header.classList.remove("displayed");
        channels.classList.remove("displayed");
        menuController.classList.remove("displayed");
        channels.classList.add("hidden");
        menuController.classList.add("hidden");

        this.hideCursor();

        header.classList.add("reduced");

        if (this.isDeepHideAllowed()) {
            window.setTimeout(() => {
                if (this.isDeepHideAllowed()) {
                    header.classList.add("disappearing");
                    header.classList.remove("reduced");
                    this.hideCursor();

                    window.setTimeout(() => {
                        if (this.isDeepHideAllowed()) {
                            header.classList.add("hidden");
                            header.classList.remove("disappearing");

                            window.setTimeout(() => {
                                if (this.isDeepHideAllowed()) {
                                    this.hideCursor();
                                }
                            }, app.totalTimeToHide * 2);
                        }
                        else {
                            this.show();
                        }
                    }, app.totalTimeToHide * 2);
                }
                else {
                    this.show();
                }
            }, app.totalTimeToHide * 2);
        }
        else {
            this.show();
        }
    }

    autoHide() {
        const app = this.app;

        if (!app) {
            return;
        }

        window.setTimeout(() => {
            try {
                if (app.NbHidingTimer > 0) {
                    app.NbHidingTimer--;
                }

                if(
                    app.noUserInterraction === true
                    && app.cursorOnInterface === false
                    && app.playing === true
                    && app.userNotChoosingSubtitles === true
                    && app.userNotChoosingSpeed === true
                ) {
                    app.NbHidingTimer++;

                    if (app.hidingTimerOn === false) {
                        app.hidingTimerOn = true;
                        this.autoHide();
                    }
                    else if (app.hidingTimerOn === true && app.NbHidingTimer === 1) {
                        window.setTimeout(() => {
                            if(
                                app.hidingTimerOn === true
                                && app.NbHidingTimer === 1
                                && app.displayTimerOn === false
                            ) {
                                this.hide();
                                app.hidingTimerOn = false;
                            }
                            else {
                                this.autoHide();
                            }
                        }, app.totalTimeToHide / 2);
                    }
                }
                else if (app.hidingTimerOn === true) {
                    this.autoHide();
                }
            }
            catch(e) {}
        }, app.totalTimeToHide / 2);
    }
}

export const interfaceVisibilityController = new InterfaceVisibilityController();
