/*
 * JoliTube runtime state shell.
 *
 * This is NOT meant to fully replace the legacy `app` object yet.
 *
 * The objective is progressive migration.
 */

export const appState = {
    ui: {
        interfaceVisible: true,
        cursorVisible: true,
        fullscreen: false,
        theaterMode: true,
        searchMode: false,
    },

    playback: {
        playing: false,
        muted: false,
        volume: 100,
        speed: 1,
        currentTime: 0,
        duration: 0,
    },

    channel: {
        currentChannel: null,
        previousChannel: null,
        playlistId: null,
    },

    video: {
        currentVideoId: null,
        currentTitle: null,
        currentAuthor: null,
    },

    subtitles: {
        enabled: false,
        language: "off",
    }
};
