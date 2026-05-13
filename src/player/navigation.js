// JoliTube player navigation helpers.
//
// This module is intentionally exposed on window instead of imported directly from
// script.js. The legacy file is still a non-module script, so this keeps the first
// extraction low-risk while we progressively reduce script.js.

function getVideoIdFromUrl(videoUrl)
{
    if(!videoUrl)
    {
        return null;
    }

    const match = videoUrl.match(/[?&]v=([^&]+)/);

    if(match)
    {
        return match[1];
    }

    return null;
}

function getRuntimeApp()
{
    return window.app;
}

function getRuntimePlayer()
{
    return window.player;
}

function shuffleArray(array)
{
    for(let i = array.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function getYTPlaylist(player)
{
    if(!player || typeof player.getPlaylist !== "function")
    {
        return [];
    }

    try
    {
        return player.getPlaylist() || [];
    }
    catch(e)
    {
        console.warn("[JT][Navigation] getYTPlaylist() failed", e);
        return [];
    }
}

function ensureNavigationHistory(app)
{
    if(!app)
    {
        return;
    }

    if(!Array.isArray(app.navigationHistory))
    {
        app.navigationHistory = [];
    }

    if(typeof app.navigationCursor !== "number")
    {
        app.navigationCursor = -1;
    }
}

function getChannelFromNumber(channelNumber)
{
    return window.__JOLITUBE_CHANNEL_ENGINE__
        && typeof window.__JOLITUBE_CHANNEL_ENGINE__.getChannelByNumber === "function"
            ? window.__JOLITUBE_CHANNEL_ENGINE__.getChannelByNumber(channelNumber)
            : null;
}

function syncLegacyAlreadyPlayedForControls(app)
{
    if(!app)
    {
        return;
    }

    ensureNavigationHistory(app);

    // Legacy script.js still enables/disables the previous button from
    // app.alreadyPlayed.length. Until that UI logic is extracted too, mirror the
    // global navigation history enough to keep the control state coherent.
    app.alreadyPlayed = app.navigationHistory
        .slice(0, app.navigationCursor + 1)
        .map(function(entry) {
            return entry.playlistIndex;
        });
}

function getCurrentHistoryEntry(app, player, reason)
{
    if(!app || !player)
    {
        return null;
    }

    const playlistIndex = typeof player.getPlaylistIndex === "function"
        ? player.getPlaylistIndex()
        : app.currentVideoIndex;

    const videoUrl = typeof player.getVideoUrl === "function"
        ? player.getVideoUrl()
        : null;

    const videoId = getVideoIdFromUrl(videoUrl) || app.videoYtId;

    if(videoId == null || playlistIndex == null || playlistIndex < 0)
    {
        console.warn("[JT][History] current entry unavailable", {
            reason,
            playlistIndex,
            videoId,
            videoUrl,
        });
        return null;
    }

    return {
        channelNumber: app.channelNum,
        channelName: app.playName,
        playlistId: app.playlistID,
        videoId,
        playlistIndex,
        playedAt: Date.now(),
        reason,
    };
}

function entriesPointToSameVideo(a, b)
{
    return Boolean(
        a
        && b
        && a.playlistId === b.playlistId
        && a.videoId === b.videoId
    );
}

function pushHistoryEntry(app, entry, reason = "manual")
{
    if(!app || !entry)
    {
        console.warn("[JT][History] push skipped", { reason, hasApp: Boolean(app), hasEntry: Boolean(entry) });
        return;
    }

    ensureNavigationHistory(app);

    const currentEntry = app.navigationHistory[app.navigationCursor];

    if(entriesPointToSameVideo(currentEntry, entry))
    {
        app.navigationHistory[app.navigationCursor] = {
            ...currentEntry,
            ...entry,
            reason,
        };

        syncLegacyAlreadyPlayedForControls(app);

        console.log("[JT][History] push deduped current entry", {
            reason,
            navigationCursor: app.navigationCursor,
            entry: app.navigationHistory[app.navigationCursor],
            historyLength: app.navigationHistory.length,
        });
        return;
    }

    if(app.navigationCursor < app.navigationHistory.length - 1)
    {
        app.navigationHistory = app.navigationHistory.slice(0, app.navigationCursor + 1);
        console.log("[JT][History] forward history truncated", {
            reason,
            navigationCursor: app.navigationCursor,
            historyLength: app.navigationHistory.length,
        });
    }

    app.navigationHistory.push({
        ...entry,
        reason,
    });

    app.navigationCursor = app.navigationHistory.length - 1;

    if(!Array.isArray(app.videoHistory))
    {
        app.videoHistory = [];
    }

    if(app.videoHistory[0] !== entry.videoId)
    {
        app.videoHistory.unshift(entry.videoId);
    }

    syncLegacyAlreadyPlayedForControls(app);

    console.log("[JT][History] push", {
        reason,
        navigationCursor: app.navigationCursor,
        historyLength: app.navigationHistory.length,
        entry,
    });
}

function pushCurrentPlaybackToHistory(app, player, reason = "sync")
{
    const entry = getCurrentHistoryEntry(app, player, reason);

    if(entry)
    {
        pushHistoryEntry(app, entry, reason);
    }
}

function loadHistoryEntry(app, player, entry, reason = "manual")
{
    console.group("[JT][History] loadHistoryEntry()");

    if(!app || !player || !entry)
    {
        console.warn("[JT][History] load aborted", {
            reason,
            hasApp: Boolean(app),
            hasPlayer: Boolean(player),
            hasEntry: Boolean(entry),
        });
        console.groupEnd();
        return;
    }

    app.isLoadingHistoryEntry = true;
    app.channelNum = entry.channelNumber;
    app.currentVideoIndex = entry.playlistIndex;
    app.videoYtId = entry.videoId;
    app.playlistID = entry.playlistId;

    const channel = getChannelFromNumber(entry.channelNumber);

    if(channel)
    {
        app.playName = channel[0];
        app.logo = channel[2];
        app.playlistID = channel[3] || entry.playlistId;
    }
    else
    {
        app.playName = entry.channelName;
    }

    setPlaylistReady(app, false, reason + " / loading history entry");

    console.log("[JT][History] loading", {
        reason,
        navigationCursor: app.navigationCursor,
        entry,
    });

    try
    {
        const currentPlaylist = getYTPlaylist(player);
        const currentPlaylistId = app.playlistID;

        if(currentPlaylist.length > 0 && currentPlaylistId === entry.playlistId)
        {
            player.playVideoAt(entry.playlistIndex);
        }
        else
        {
            player.loadPlaylist({
                list: entry.playlistId,
                index: entry.playlistIndex,
            });
        }

        setTimeout(function()
        {
            app.isLoadingHistoryEntry = false;
            syncPlayerState(app, player, "loadHistoryEntry timeout");
        }, 800);
    }
    catch(e)
    {
        app.isLoadingHistoryEntry = false;
        console.error("[JT][History] load failed", e);
    }

    console.groupEnd();
}

function setPlaylistReady(app, ready, reason)
{
    if(!app)
    {
        console.warn("[JT][Navigation] playlistReady update skipped: app unavailable", { reason, ready });
        return;
    }

    app.playlistReady = ready;

    console.log("[JT][Navigation] playlistReady updated", {
        reason,
        playlistReady: app.playlistReady,
    });
}

function isPlaylistReady(app, player)
{
    const ytPlaylist = getYTPlaylist(player);

    return Boolean(
        app
        && app.playlistReady === true
        && ytPlaylist.length > 0
    );
}

function rebuildRandomPlaylist(app, playlistLength)
{
    console.log("[JT][Navigation] rebuildRandomPlaylist()", { playlistLength });

    app.randomPlaylist = [];

    for(let i = 0; i < playlistLength; i++)
    {
        app.randomPlaylist.push(i);
    }

    shuffleArray(app.randomPlaylist);

    console.log("[JT][Navigation] randomPlaylist rebuilt", structuredClone(app.randomPlaylist));

    return app.randomPlaylist;
}

function resetRuntimeVideoState(app, reason)
{
    if(!app)
    {
        console.warn("[JT][Navigation] reset skipped: app unavailable", { reason });
        return;
    }

    ensureNavigationHistory(app);

    app.currentVideoIndex = null;
    app.videoYtId = null;
    setPlaylistReady(app, false, reason + " / runtime reset");

    console.log("[JT][Navigation] runtime video state reset", {
        reason,
        currentVideoIndex: app.currentVideoIndex,
        videoYtId: app.videoYtId,
        playlistReady: app.playlistReady,
        navigationCursor: app.navigationCursor,
        historyLength: app.navigationHistory.length,
    });
}

function syncPlayerState(app, player, reason = "manual")
{
    console.log("[JT][Navigation] syncPlayerState()", { reason });

    if(!app)
    {
        console.warn("[JT][Navigation] sync aborted: app unavailable", { reason });
        return;
    }

    if(!player)
    {
        console.warn("[JT][Navigation] sync aborted: player unavailable", { reason });
        return;
    }

    ensureNavigationHistory(app);

    try
    {
        const ytPlaylist = getYTPlaylist(player);
        const playerState = typeof player.getPlayerState === "function"
            ? player.getPlayerState()
            : null;

        if(typeof player.getPlaylistIndex === "function")
        {
            app.currentVideoIndex = player.getPlaylistIndex();
        }

        if(typeof player.getVideoUrl === "function")
        {
            const videoId = getVideoIdFromUrl(player.getVideoUrl());

            if(videoId)
            {
                app.videoYtId = videoId;
            }
        }

        // YouTube loadPlaylist() is async. A playlist can briefly report [] during
        // transition, so navigation must stay locked until the player is actually
        // playing with a non-empty playlist.
        if(playerState === (window.YT?.PlayerState?.PLAYING ?? 1) && ytPlaylist.length > 0)
        {
            setPlaylistReady(app, true, reason + " / YT playlist available");
            pushCurrentPlaybackToHistory(app, player, reason + " / YT PLAYING");
        }

        console.log("[JT][Navigation] synced state", {
            reason,
            currentVideoIndex: app.currentVideoIndex,
            videoYtId: app.videoYtId,
            playlistReady: app.playlistReady,
            ytPlaylistLength: ytPlaylist.length,
            playerState,
            navigationCursor: app.navigationCursor,
            historyLength: app.navigationHistory.length,
        });
    }
    catch(e)
    {
        console.warn("[JT][Navigation] sync failed", { reason, error: e });
    }
}

function nextVideo(app, player)
{
    console.group("[JT][Navigation] nextVideo()");

    if(!player || typeof player.getPlaylist !== "function")
    {
        console.warn("[JT][Navigation] next aborted: player not ready");
        console.groupEnd();
        return;
    }

    ensureNavigationHistory(app);

    if(app.navigationCursor < app.navigationHistory.length - 1)
    {
        const forwardEntry = app.navigationHistory[app.navigationCursor + 1];
        app.navigationCursor++;
        syncLegacyAlreadyPlayedForControls(app);
        loadHistoryEntry(app, player, forwardEntry, "nextVideo / forward history");
        console.groupEnd();
        return;
    }

    const ytPlaylist = getYTPlaylist(player);

    console.log("[JT][Navigation] YT playlist", ytPlaylist);

    if(!isPlaylistReady(app, player))
    {
        console.warn("[JT][Navigation] next blocked: playlist not ready", {
            playlistReady: app?.playlistReady,
            ytPlaylistLength: ytPlaylist.length,
        });
        console.groupEnd();
        return;
    }

    if(ytPlaylist.length === 0)
    {
        console.warn("[JT][Navigation] next aborted: empty YouTube playlist");
        console.groupEnd();
        return;
    }

    if(!Array.isArray(app.randomPlaylist) || app.randomPlaylist.length === 0)
    {
        rebuildRandomPlaylist(app, ytPlaylist.length);
    }

    const nextIndex = app.randomPlaylist.shift();

    console.log("[JT][Navigation] selected nextIndex", nextIndex);

    if(nextIndex === undefined)
    {
        console.warn("[JT][Navigation] next aborted: no next index available");
        console.groupEnd();
        return;
    }

    app.currentVideoIndex = nextIndex;

    try
    {
        player.playVideoAt(nextIndex);

        setTimeout(function()
        {
            syncPlayerState(app, player, "nextVideo timeout");
        }, 800);
    }
    catch(e)
    {
        console.error("[JT][Navigation] next failed", e);
    }

    console.groupEnd();
}

function previousVideo(app, player)
{
    console.group("[JT][Navigation] previousVideo()");

    if(!player || typeof player.playVideoAt !== "function")
    {
        console.warn("[JT][Navigation] previous aborted: player not ready");
        console.groupEnd();
        return;
    }

    ensureNavigationHistory(app);

    if(app.navigationHistory.length === 0)
    {
        pushCurrentPlaybackToHistory(app, player, "previousVideo bootstrap current playback");
    }

    if(app.navigationCursor <= 0)
    {
        console.warn("[JT][Navigation] previous aborted: no previous entry in navigation history", {
            navigationCursor: app.navigationCursor,
            historyLength: app.navigationHistory.length,
        });
        console.groupEnd();
        return;
    }

    app.navigationCursor--;

    const previousEntry = app.navigationHistory[app.navigationCursor];

    console.log("[JT][Navigation] selected previous history entry", {
        navigationCursor: app.navigationCursor,
        previousEntry,
    });

    syncLegacyAlreadyPlayedForControls(app);
    loadHistoryEntry(app, player, previousEntry, "previousVideo");

    console.groupEnd();
}

function installLegacySyncBridge()
{
    if(window.__JOLITUBE_NAVIGATION_SYNC_BRIDGE_INSTALLED__)
    {
        return;
    }

    window.__JOLITUBE_NAVIGATION_SYNC_BRIDGE_INSTALLED__ = true;

    const legacyOnPlayerStateChange = window.onPlayerStateChange;

    if(typeof legacyOnPlayerStateChange === "function")
    {
        window.onPlayerStateChange = function(event)
        {
            const result = legacyOnPlayerStateChange.apply(this, arguments);
            const playingState = window.YT?.PlayerState?.PLAYING ?? 1;

            if(event && event.data === playingState)
            {
                syncPlayerState(getRuntimeApp(), getRuntimePlayer(), "YT PLAYING event");
            }

            return result;
        };

        console.log("[JT][Navigation] onPlayerStateChange sync bridge installed");
    }
    else
    {
        console.warn("[JT][Navigation] onPlayerStateChange bridge skipped: legacy handler unavailable");
    }

    const legacyLoadSelectedChannel = window.loadSelectedChannel;

    if(typeof legacyLoadSelectedChannel === "function")
    {
        window.loadSelectedChannel = function(channelNum)
        {
            resetRuntimeVideoState(getRuntimeApp(), "before loadSelectedChannel(" + channelNum + ")");
            return legacyLoadSelectedChannel.apply(this, arguments);
        };

        console.log("[JT][Navigation] loadSelectedChannel reset bridge installed");
    }
    else
    {
        console.warn("[JT][Navigation] loadSelectedChannel bridge skipped: legacy handler unavailable");
    }
}

window.JoliTubeNavigation = {
    nextVideo,
    previousVideo,
    rebuildRandomPlaylist,
    resetRuntimeVideoState,
    syncPlayerState,
    setPlaylistReady,
    isPlaylistReady,
    ensureNavigationHistory,
    pushHistoryEntry,
    pushCurrentPlaybackToHistory,
    loadHistoryEntry,
    installLegacySyncBridge,
};

installLegacySyncBridge();

console.log("[JT][Navigation] module loaded");
