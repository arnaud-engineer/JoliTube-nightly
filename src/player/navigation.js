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

    app.currentVideoIndex = null;
    app.videoYtId = null;

    console.log("[JT][Navigation] runtime video state reset", {
        reason,
        currentVideoIndex: app.currentVideoIndex,
        videoYtId: app.videoYtId,
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

    try
    {
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

        console.log("[JT][Navigation] synced state", {
            reason,
            currentVideoIndex: app.currentVideoIndex,
            videoYtId: app.videoYtId,
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

    const ytPlaylist = player.getPlaylist() || [];

    console.log("[JT][Navigation] YT playlist", ytPlaylist);

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

    if(!Array.isArray(app.alreadyPlayed))
    {
        app.alreadyPlayed = [];
    }

    app.alreadyPlayed.push(nextIndex);

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

    if(!Array.isArray(app.alreadyPlayed) || app.alreadyPlayed.length < 2)
    {
        console.warn("[JT][Navigation] previous aborted: no previous video in app history");
        console.groupEnd();
        return;
    }

    // Remove current video, then go back to the preceding one.
    app.alreadyPlayed.pop();
    const previousIndex = app.alreadyPlayed.pop();

    console.log("[JT][Navigation] selected previousIndex", previousIndex);

    if(previousIndex === undefined)
    {
        console.warn("[JT][Navigation] previous aborted: previous index unavailable");
        console.groupEnd();
        return;
    }

    app.currentVideoIndex = previousIndex;
    app.alreadyPlayed.push(previousIndex);

    try
    {
        player.playVideoAt(previousIndex);

        setTimeout(function()
        {
            syncPlayerState(app, player, "previousVideo timeout");
        }, 800);
    }
    catch(e)
    {
        console.error("[JT][Navigation] previous failed", e);
    }

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
    installLegacySyncBridge,
};

installLegacySyncBridge();

console.log("[JT][Navigation] module loaded");
