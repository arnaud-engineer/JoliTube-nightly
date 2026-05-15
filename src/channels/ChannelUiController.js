import { channelEngine } from "./ChannelEngine.js";
import { interfaceVisibilityController } from "../ui/interfaceVisibility.js";
import { playerControlsController } from "../playback/PlayerControlsController.js";

/*
 * ChannelUiController
 *
 * Transitional owner for channel menu rendering, search filtering, and
 * selected-channel UI state. The legacy script still owns the YouTube player
 * runtime, so this controller still calls a few playback helpers globally.
 */

export class ChannelUiController {
    constructor({
        engine = channelEngine,
        interfaceVisibility = interfaceVisibilityController,
        playerControls = playerControlsController,
        appProvider = () => window.app,
        playerProvider = () => window.player,
        curatorListProvider = () => window.curratorsList,
    } = {}) {
        this.engine = engine;
        this.interfaceVisibility = interfaceVisibility;
        this.playerControls = playerControls;
        this.appProvider = appProvider;
        this.playerProvider = playerProvider;
        this.curatorListProvider = curatorListProvider;
        this.started = false;
    }

    get app() {
        return this.appProvider();
    }

    get player() {
        return this.playerProvider();
    }

    get channelList() {
        return this.engine.getChannelList();
    }

    formatChannelNumber(channelNumber) {
        const normalized = Number.parseInt(channelNumber, 10);

        if (!Number.isFinite(normalized)) {
            return "";
        }

        return normalized < 10
            ? "0" + normalized
            : "" + normalized;
    }

    getMenuElementList() {
        return Array.from(document.getElementsByClassName("elementMenuBar"));
    }

    getSearchInput() {
        return document.getElementById("searchBar");
    }

    start() {
        if (this.started) {
            return;
        }

        this.started = true;
        this.installGlobalChannelBridge();
        this.bindSearchInput();
    }

    installGlobalChannelBridge() {
        window.loadSelectedChannel = (channelNumber) => {
            this.loadSelectedChannel(channelNumber);
        };
    }

    bindSearchInput() {
        const searchInput = this.getSearchInput();

        if (!searchInput) {
            return;
        }

        searchInput.addEventListener("input", () => {
            this.searchUpdate();
        });

        searchInput.addEventListener("keydown", (event) => {
            this.handleSearchKeyDown(event);
        });

        searchInput.addEventListener("focus", () => {
            this.enterSearchMode();
        });

        searchInput.addEventListener("focusout", () => {
            this.exitSearchMode();
        });
    }

    enterSearchMode() {
        const app = this.app;

        if (app) {
            app.searchSingleton = true;
        }

        this.interfaceVisibility.show();
    }

    exitSearchMode() {
        const app = this.app;

        if (app) {
            app.searchSingleton = false;
        }
    }

    focusSearch() {
        const searchInput = this.getSearchInput();

        if (searchInput) {
            searchInput.focus();
        }

        this.enterSearchMode();
    }

    handleSearchKeyDown(event) {
        event.stopPropagation();

        if (event.code === "Escape") {
            this.searchReset();
        }

        if (event.code === "Enter" || event.code === "Escape") {
            this.exitSearchMode();
            this.getSearchInput()?.blur();
        }
        else if (event.code === "ArrowDown") {
            event.preventDefault();
            this.loadNextVisibleChannel();
        }
        else if (event.code === "ArrowUp") {
            event.preventDefault();
            this.loadPreviousVisibleChannel();
        }
    }

    getCurator(channel) {
        const curators = this.curatorListProvider();
        const curator = Array.isArray(curators)
            ? curators[channel?.[4]]
            : null;

        return {
            name: curator?.[0] ?? "",
            url: curator?.[1] ?? "",
        };
    }

    updateChannelNumber(channelNumber) {
        const app = this.app;

        if (!app) {
            return;
        }

        const normalized = Number.parseInt(channelNumber, 10);

        app.prevChannelNum = app.channelNum;
        app.channelNum = normalized;
        app.displayChannelNum = this.formatChannelNumber(normalized);
    }

    setCurrentChannel(channelNumber, channel) {
        const app = this.app;

        if (!app || !channel) {
            return;
        }

        const curator = this.getCurator(channel);

        this.updateChannelNumber(channelNumber);
        app.playlistID = channel[3];
        app.playName = channel[0];
        app.logo = channel[2];
        app.currentChannelCuratorName = curator.name;
        app.currentChannelCuratorURL = curator.url;
    }

    initializeFirstChannel(channelNumber) {
        const channel = this.engine.getChannelByNumber(channelNumber);

        if (!channel) {
            return false;
        }

        this.setCurrentChannel(channelNumber, channel);
        return true;
    }

    renderMenu() {
        const menuBar = document.getElementById("menuBar");

        if (!menuBar) {
            return;
        }

        menuBar.innerHTML = "";

        this.channelList.forEach((channel, index) => {
            const channelNumber = index + 1;
            const channelElement = document.createElement("div");
            channelElement.className = "elementMenuBar";
            channelElement.dataset.channelNumber = "" + channelNumber;
            channelElement.addEventListener("click", () => {
                this.requestChannelLoad(channelNumber);
            });

            const logoContainer = document.createElement("div");
            logoContainer.className = "logoElementMenuBar";

            const logo = document.createElement("img");
            logo.src = channel[2];
            logoContainer.appendChild(logo);

            const titles = document.createElement("div");
            titles.className = "titlesElementMenuBar";

            const title = document.createElement("h1");
            title.textContent = channel[0];

            const description = document.createElement("h2");
            description.textContent = channel[1];

            const number = document.createElement("h3");
            number.textContent = this.formatChannelNumber(channelNumber);

            titles.append(title, description, number);
            channelElement.append(logoContainer, titles);
            menuBar.appendChild(channelElement);
        });
    }

    searchUpdate() {
        const searchInput = this.getSearchInput();
        const inputedText = searchInput?.value ?? "";

        this.getMenuElementList().forEach((channel) => {
            const title = channel.getElementsByTagName("h1")[0];
            const titleText = title?.outerText ?? title?.textContent ?? "";

            if (!titleText.toLowerCase().includes(inputedText.toLowerCase())) {
                channel.classList.add("hidden");
            }
            else {
                channel.classList.remove("hidden");
            }
        });
    }

    searchReset() {
        const searchInput = this.getSearchInput();

        if (searchInput) {
            searchInput.value = "";
        }

        this.getMenuElementList().forEach((channel) => {
            channel.classList.remove("hidden");
        });
    }

    getVisibleChannelNumbers() {
        return this.getMenuElementList()
            .filter((channel) => !channel.classList.contains("hidden"))
            .map((channel) => Number.parseInt(channel.dataset.channelNumber, 10))
            .filter((channelNumber) => Number.isFinite(channelNumber));
    }

    loadPreviousVisibleChannel() {
        const app = this.app;

        if (!app) {
            return;
        }

        const visibleChannels = this.getVisibleChannelNumbers();

        if (visibleChannels.length === 0) {
            return;
        }

        const currentChannel = Number.parseInt(app.channelNum, 10);
        const previousChannel = [...visibleChannels]
            .reverse()
            .find((channelNumber) => channelNumber < currentChannel)
            ?? visibleChannels[visibleChannels.length - 1];

        this.requestChannelLoad(previousChannel);
        app.channelArrowNavigationTracker--;
    }

    loadNextVisibleChannel() {
        const app = this.app;

        if (!app) {
            return;
        }

        const visibleChannels = this.getVisibleChannelNumbers();

        if (visibleChannels.length === 0) {
            return;
        }

        const currentChannel = Number.parseInt(app.channelNum, 10);
        const nextChannel = visibleChannels.find((channelNumber) => channelNumber > currentChannel)
            ?? visibleChannels[0];

        this.requestChannelLoad(nextChannel);
        app.channelArrowNavigationTracker++;
    }

    requestChannelLoad(channelNumber) {
        window.loadSelectedChannel?.(channelNumber);
    }

    getChannelNumber(channelName) {
        const channelIndex = this.channelList.findIndex((channel) => channel[0] === channelName);

        return channelIndex >= 0
            ? channelIndex + 1
            : null;
    }

    updateChannelData() {
        const app = this.app;
        const currentChannelDisplay = document.getElementById("currentChannelNameDisplay");
        const currentChannelLogo = document.getElementById("currentChannelLogo");

        if (!app || !currentChannelDisplay || !currentChannelLogo) {
            return;
        }

        const channelNumHtml = "<span id='currentChannelNum'>" + app.displayChannelNum + " - </span> ";
        const channelNameHtml = "<span id='currentChannelName'>" + app.playName + "</span> ";
        const curatorHtml = "<a id='currentChannelCurator' href='" + app.currentChannelCuratorURL + "' target='_blank'>" + app.currentChannelCuratorName + "</span>";

        currentChannelDisplay.innerHTML = channelNumHtml + channelNameHtml + curatorHtml;
        currentChannelLogo.src = app.logo;
        this.refreshChannelList();
    }

    hideChannelData() {
        const currentChannelDisplay = document.getElementById("currentChannelNameDisplay");
        const currentChannelLogo = document.getElementById("currentChannelLogo");

        if (currentChannelDisplay) {
            currentChannelDisplay.innerHTML = "";
        }

        if (currentChannelLogo) {
            currentChannelLogo.src = "";
        }
    }

    refreshChannelList() {
        const app = this.app;
        const childDivs = this.getMenuElementList();

        if (!app) {
            return;
        }

        childDivs.forEach((childDiv, index) => {
            childDiv.classList.remove("selected");

            const channelNumber = Number.parseInt(childDiv.dataset.channelNumber, 10);
            const channelName = childDiv.getElementsByTagName("h1")[0]?.textContent;
            const isSelected = channelNumber === app.channelNum || channelName === app.playName;

            if (!isSelected) {
                return;
            }

            childDiv.classList.add("selected");

            if(
                app.channelArrowNavigationTracker >= 3
                || app.channelArrowNavigationTracker <= -3
                || app.prevChannelNum - app.channelNum > 1
                || app.prevChannelNum - app.channelNum < 1
            ) {
                this.scrollSelectedChannelIntoView(childDivs, index);
            }
        });

        this.searchUpdate();
    }

    scrollSelectedChannelIntoView(childDivs, selectedIndex) {
        let visibleCounter = 0;
        let firstVisibleIndex = null;
        let lastVisibleIndex = null;

        for (let index = selectedIndex; index >= 0; index--) {
            if (childDivs[index].classList.contains("hidden")) {
                continue;
            }

            visibleCounter++;

            if (visibleCounter === 1) {
                firstVisibleIndex = index;
            }

            if (visibleCounter >= 1) {
                lastVisibleIndex = index;
            }

            if (visibleCounter === 3) {
                childDivs[index].scrollIntoView();
                break;
            }
            else if (index === childDivs.length - 1 && firstVisibleIndex !== null) {
                childDivs[firstVisibleIndex].scrollIntoView();
            }
            else if (index === 0 && lastVisibleIndex !== null) {
                childDivs[lastVisibleIndex].scrollIntoView();
            }
        }
    }

    loadSelectedChannel(channelNumber) {
        const app = this.app;
        const player = this.player;
        const normalized = Number.parseInt(channelNumber, 10);

        console.group("[JT] loadSelectedChannel()");

        console.log("REQUESTED channelNum", channelNumber);
        console.log("app.channelNum BEFORE", app?.channelNum);
        console.log("app.currentVideoIndex BEFORE", app?.currentVideoIndex);
        console.log("app.videoYtId BEFORE", app?.videoYtId);
        console.log("app.playName BEFORE", app?.playName);
        console.log("alreadyPlayed BEFORE", structuredClone(app?.alreadyPlayed ?? []));
        console.log("randomPlaylist BEFORE", structuredClone(app?.randomPlaylist ?? []));
        console.log("videoHistory BEFORE", structuredClone(app?.videoHistory ?? []));

        console.log("GO TO CHANNEL :", normalized);

        if (!app) {
            console.error("App runtime not found");
            console.groupEnd();
            return;
        }

        const channel = this.engine.getChannelByNumber(normalized);

        console.log("resolved channel", channel);

        if (!channel) {
            console.error("Channel not found", normalized);
            console.groupEnd();
            return;
        }

        app.alreadyPlayed = [];
        app.randomPlaylist = [];
        this.setCurrentChannel(normalized, channel);

        window.hideVideo?.();
        this.hideChannelData();
        this.updateChannelData();
        this.playerControls.disablePlayer();
        this.interfaceVisibility.show();

        app.playerFullyChargedSingleton = false;
        app.realTimeDataMonitored = false;
        app.firstVideoLoaded = false;
        app.nbVideoCurrentChannel = null;
        app.playerInitAttemptPassed = false;
        app.nextVideoInitAttemptPassed = false;

        if (player?.loadPlaylist) {
            console.log("[JT] Loading YouTube playlist", app.playlistID);

            player.loadPlaylist({
                listType: "playlist",
                list: app.playlistID,
                index: app.playerIndexInitAttempt || 0,
            });
        }
        else {
            console.warn("[JT] Cannot load playlist: player not ready");
        }

        console.log("app.channelNum AFTER", app.channelNum);
        console.log("app.currentVideoIndex AFTER", app.currentVideoIndex);
        console.log("app.videoYtId AFTER", app.videoYtId);
        console.log("app.playName AFTER", app.playName);
        console.log("alreadyPlayed AFTER", structuredClone(app.alreadyPlayed));
        console.log("randomPlaylist AFTER", structuredClone(app.randomPlaylist));
        console.log("videoHistory AFTER", structuredClone(app.videoHistory));

        console.groupEnd();
    }
}

export const channelUiController = new ChannelUiController();
