import { channelEngine } from "../channels/ChannelEngine.js";

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

function getPlaylistIdFromUrl(videoUrl)
{
    if(!videoUrl)
    {
        return null;
    }

    const match = videoUrl.match(/[?&]list=([^&]+)/);

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

function getExpectedTargetIndex(expected)
{
    return Number.isInteger(expected?.playlistIndex)
        ? expected.playlistIndex
        : 0;
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

function getPlayerSnapshot(player)
{
    const ytPlaylist = getYTPlaylist(player);
    const playerState = typeof player?.getPlayerState === "function"
        ? player.getPlayerState()
        : null;
    const playlistIndex = typeof player?.getPlaylistIndex === "function"
        ? player.getPlaylistIndex()
        : null;
    const videoUrl = typeof player?.getVideoUrl === "function"
        ? player.getVideoUrl()
        : null;
    const currentTime = typeof player?.getCurrentTime === "function"
        ? player.getCurrentTime()
        : null;
    const videoId = getVideoIdFromUrl(videoUrl);
    const playlistId = getPlaylistIdFromUrl(videoUrl);

    return {
        ytPlaylist,
        playerState,
        currentTime,
        playlistIndex,
        videoUrl,
        videoId,
        playlistId,
    };
}

function ensureAutoplayStatus(app)
{
    if(!app)
    {
        return null;
    }

    if(!app.autoplayStatus)
    {
        app.autoplayStatus = {};
    }

    app.autoplayStatus = {
        browserPolicySupported: false,
        mediaElementPolicy: "unknown",
        audioContextPolicy: "unknown",
        youtubeElementPolicy: "unknown",
        youtubePlayback: "unknown",
        youtubePlaybackBeforeGesture: "unknown",
        youtubePlaybackAfterGesture: "unknown",
        audibleAutoplay: "unknown",
        userGestureSeen: false,
        firstUserGestureAt: null,
        lastUpdatedAt: null,
        lastReason: null,
        ...app.autoplayStatus,
    };

    return app.autoplayStatus;
}

function inferAudibleAutoplayStatus(status)
{
    if(status.youtubePlaybackBeforeGesture === "allowed-before-gesture")
    {
        return "allowed";
    }

    if(status.mediaElementPolicy === "allowed")
    {
        return "allowed";
    }

    if(status.mediaElementPolicy === "allowed-muted")
    {
        return "muted-only";
    }

    if(status.mediaElementPolicy === "disallowed" || status.youtubePlaybackBeforeGesture === "blocked-before-gesture")
    {
        return "blocked";
    }

    if(status.youtubePlaybackAfterGesture === "started-after-gesture")
    {
        return "gesture-required-or-unknown";
    }

    return "unknown";
}

function updateAutoplayStatus(app, patch, reason)
{
    const status = ensureAutoplayStatus(app);

    if(!status)
    {
        return null;
    }

    Object.assign(status, patch);
    status.audibleAutoplay = inferAudibleAutoplayStatus(status);
    status.lastUpdatedAt = Date.now();
    status.lastReason = reason;

    console.log("[JT][Autoplay] status updated", {
        reason,
        autoplayStatus: { ...status },
    });

    return status;
}

function cloneDiagnosticSnapshot(snapshot)
{
    if(!snapshot)
    {
        return null;
    }

    return {
        playerState: snapshot.playerState,
        currentTime: snapshot.currentTime,
        playlistIndex: snapshot.playlistIndex,
        playlistId: snapshot.playlistId,
        videoId: snapshot.videoId,
        playlistLength: snapshot.ytPlaylist?.length || 0,
        playlistVideoId: snapshot.ytPlaylist?.[snapshot.playlistIndex] || null,
        videoUrl: snapshot.videoUrl,
    };
}

function rememberUniqueValue(list, value)
{
    if(!value || !Array.isArray(list) || list.includes(value))
    {
        return;
    }

    list.push(value);
}

function getTransitionDiagnostics(app)
{
    if(!app?.navigationTransition)
    {
        return null;
    }

    if(!app.navigationTransitionDiagnostics)
    {
        app.navigationTransitionDiagnostics = {
            startedAt: app.navigationTransitionStartedAt || Date.now(),
            reason: app.navigationTransitionReason,
            expected: app.navigationTransitionExpected
                ? { ...app.navigationTransitionExpected }
                : null,
            firstObservedVideoId: null,
            firstObservedPlaylistId: null,
            firstStableVideoId: null,
            firstStablePlaylistId: null,
            observedVideoIds: [],
            observedPlaylistIds: [],
            incoherentSnapshots: [],
            playerErrors: [],
            retryReasons: [],
        };
    }

    return app.navigationTransitionDiagnostics;
}

function recordTransitionSnapshot(app, snapshot, validation, reason, stable = false)
{
    const diagnostics = getTransitionDiagnostics(app);

    if(!diagnostics || !snapshot)
    {
        return null;
    }

    rememberUniqueValue(diagnostics.observedVideoIds, snapshot.videoId);
    rememberUniqueValue(diagnostics.observedPlaylistIds, snapshot.playlistId);

    if(snapshot.videoId && !diagnostics.firstObservedVideoId)
    {
        diagnostics.firstObservedVideoId = snapshot.videoId;
        diagnostics.firstObservedPlaylistId = snapshot.playlistId || null;
    }

    if(stable && snapshot.videoId && !diagnostics.firstStableVideoId)
    {
        diagnostics.firstStableVideoId = snapshot.videoId;
        diagnostics.firstStablePlaylistId = snapshot.playlistId || null;
    }

    if(!stable && validation && validation.valid !== true)
    {
        diagnostics.incoherentSnapshots.push({
            reason,
            snapshot: cloneDiagnosticSnapshot(snapshot),
            validation: {
                stateMatches: validation.stateMatches,
                currentTimeMatches: validation.currentTimeMatches,
                coherentVideo: validation.coherentVideo,
                playlistMatchesExpected: validation.playlistMatchesExpected,
                videoMatchesExpected: validation.videoMatchesExpected,
                playlistLengthMatchesExpected: validation.playlistLengthMatchesExpected,
                stalePreviousVideo: validation.stalePreviousVideo,
                stalePreviousPlaylistLength: validation.stalePreviousPlaylistLength,
                playlistVideoId: validation.playlistVideoId,
                expectedPlaylistId: validation.expectedPlaylistId,
                expectedVideoId: validation.expectedVideoId,
            },
        });

        if(diagnostics.incoherentSnapshots.length > 8)
        {
            diagnostics.incoherentSnapshots.shift();
        }
    }

    return diagnostics;
}

function classifyTransitionAnomalies(diagnostics, stableSnapshot)
{
    if(!diagnostics || !stableSnapshot)
    {
        return [];
    }

    const expected = diagnostics.expected || {};
    const anomalies = [];
    const stableVideoId = stableSnapshot.videoId || diagnostics.firstStableVideoId;
    const firstObservedVideoId = diagnostics.firstObservedVideoId;
    const incoherentVideoIds = diagnostics.incoherentSnapshots
        .map(function(entry) {
            return entry.snapshot?.videoId;
        })
        .filter(Boolean);
    const distinctIncoherentVideoIds = [...new Set(incoherentVideoIds)];

    if(
        firstObservedVideoId
        && stableVideoId
        && firstObservedVideoId !== stableVideoId
    )
    {
        anomalies.push({
            type: firstObservedVideoId === expected.previousVideoId
                ? "stale-previous-video"
                : "suspected-silent-skip",
            firstObservedVideoId,
            stableVideoId,
            previousVideoId: expected.previousVideoId || null,
            playlistId: expected.playlistId || stableSnapshot.playlistId || null,
        });
    }

    distinctIncoherentVideoIds
        .filter(function(videoId) {
            return videoId !== stableVideoId;
        })
        .forEach(function(videoId) {
            anomalies.push({
                type: videoId === expected.previousVideoId
                    ? "stale-previous-video"
                    : "suspected-silent-skip",
                observedVideoId: videoId,
                stableVideoId,
                previousVideoId: expected.previousVideoId || null,
                playlistId: expected.playlistId || stableSnapshot.playlistId || null,
            });
        });

    return anomalies;
}

function finalizeTransitionDiagnostics(app, reason, stableSnapshot)
{
    const diagnostics = app?.navigationTransitionDiagnostics;

    if(!app || !diagnostics)
    {
        return;
    }

    recordTransitionSnapshot(app, stableSnapshot, { valid: true }, reason, true);

    diagnostics.finishedAt = Date.now();
    diagnostics.duration = diagnostics.finishedAt - diagnostics.startedAt;
    diagnostics.finishReason = reason;
    diagnostics.stableSnapshot = cloneDiagnosticSnapshot(stableSnapshot);
    diagnostics.anomalies = classifyTransitionAnomalies(diagnostics, stableSnapshot);

    app.lastNavigationTransitionDiagnostics = diagnostics;

    if(!Array.isArray(app.navigationTransitionAnomalies))
    {
        app.navigationTransitionAnomalies = [];
    }

    diagnostics.anomalies.forEach(function(anomaly) {
        app.navigationTransitionAnomalies.push({
            ...anomaly,
            reason,
            detectedAt: Date.now(),
            transitionReason: diagnostics.reason,
        });
    });

    if(app.navigationTransitionAnomalies.length > 50)
    {
        app.navigationTransitionAnomalies = app.navigationTransitionAnomalies.slice(-50);
    }

    if(diagnostics.anomalies.length > 0)
    {
        console.warn("[JT][Navigation] transition anomaly detected", {
            reason,
            diagnostics,
        });
    }
    else
    {
        console.log("[JT][Navigation] transition diagnostics clean", {
            reason,
            diagnostics,
        });
    }
}

function getAutoplayPolicyValue(target)
{
    if(typeof navigator === "undefined" || typeof navigator.getAutoplayPolicy !== "function")
    {
        return "unknown";
    }

    try
    {
        return navigator.getAutoplayPolicy(target);
    }
    catch(e)
    {
        return "unknown";
    }
}

function detectAutoplayPolicy(app, player, reason = "manual")
{
    const hasPolicyApi = typeof navigator !== "undefined"
        && typeof navigator.getAutoplayPolicy === "function";
    const playerElement = typeof player?.getIframe === "function"
        ? player.getIframe()
        : document.getElementById("player");

    return updateAutoplayStatus(app, {
        browserPolicySupported: hasPolicyApi,
        mediaElementPolicy: getAutoplayPolicyValue("mediaelement"),
        audioContextPolicy: getAutoplayPolicyValue("audiocontext"),
        youtubeElementPolicy: playerElement
            ? getAutoplayPolicyValue(playerElement)
            : "unknown",
    }, reason);
}

function neutralizeCurrentPlayback(app, player, reason)
{
    if(!player)
    {
        return false;
    }

    let snapshot = null;

    try
    {
        snapshot = getPlayerSnapshot(player);
    }
    catch(e) {}

    try
    {
        if(typeof player.stopVideo === "function")
        {
            player.stopVideo();
        }
        else if(typeof player.pauseVideo === "function")
        {
            player.pauseVideo();
        }

        if(app)
        {
            app.playing = false;
        }

        console.log("[JT][Navigation] current playback neutralized", {
            reason,
            snapshot: cloneDiagnosticSnapshot(snapshot),
        });
        return true;
    }
    catch(e)
    {
        console.warn("[JT][Navigation] current playback neutralize failed", {
            reason,
            error: e,
            snapshot: cloneDiagnosticSnapshot(snapshot),
        });
        return false;
    }
}

function markAutoplayUserGesture(app, reason = "user gesture")
{
    const status = ensureAutoplayStatus(app);

    if(!status)
    {
        return null;
    }

    if(status.userGestureSeen)
    {
        return status;
    }

    return updateAutoplayStatus(app, {
        userGestureSeen: true,
        firstUserGestureAt: Date.now(),
    }, reason);
}

function rememberYouTubeAutoplayResult(app, snapshot, result, reason)
{
    const status = ensureAutoplayStatus(app);

    if(!status)
    {
        return null;
    }

    const patch = status.userGestureSeen
        ? {
            youtubePlayback: result.afterGesture,
            youtubePlaybackAfterGesture: result.afterGesture,
        }
        : {
            youtubePlayback: result.beforeGesture,
            youtubePlaybackBeforeGesture: result.beforeGesture,
        };

    return updateAutoplayStatus(app, {
        ...patch,
        lastYouTubePlayerState: snapshot?.playerState ?? null,
        lastYouTubeCurrentTime: snapshot?.currentTime ?? null,
        lastYouTubeVideoId: snapshot?.videoId ?? null,
        lastYouTubePlaylistId: snapshot?.playlistId ?? null,
    }, reason);
}

function getExpectedTransitionState(app)
{
    const expected = app?.navigationTransitionExpected || {};
    const playlistLengths = app?.navigationPlaylistLengths || {};
    const playlistVideos = app?.navigationPlaylistVideos || {};
    const playlistId = expected.playlistId || app?.playlistID || null;
    const previousPlaylistId = expected.previousPlaylistId || null;
    const expectedPlaylistVideos = playlistId ? playlistVideos[playlistId] : null;

    return {
        playlistId,
        previousPlaylistId,
        previousVideoId: expected.previousVideoId || null,
        expectedVideoId: expected.videoId || (
            expectedPlaylistVideos && Number.isInteger(expected.playlistIndex)
                ? expectedPlaylistVideos[expected.playlistIndex]
                : null
        ),
        expectedPlaylistVideos,
        expectedPlaylistLength: playlistId ? playlistLengths[playlistId] : null,
        previousPlaylistLength: previousPlaylistId ? playlistLengths[previousPlaylistId] : null,
    };
}

function playlistMatchesVideos(ytPlaylist, expectedPlaylistVideos)
{
    if(!Array.isArray(expectedPlaylistVideos) || expectedPlaylistVideos.length === 0)
    {
        return false;
    }

    return ytPlaylist.length === expectedPlaylistVideos.length
        && ytPlaylist.every(function(videoId, index)
        {
            return videoId === expectedPlaylistVideos[index];
        });
}

function getSnapshotValidation(snapshot, expected = {}, options = {})
{
    const playingState = window.YT?.PlayerState?.PLAYING ?? 1;
    const allowedStates = options.allowedStates || [playingState];
    const maxCurrentTime = options.maxCurrentTime;
    const playlistVideoId = snapshot.ytPlaylist[snapshot.playlistIndex];
    const expectedPlaylistId = expected.playlistId || null;
    const expectedVideoId = expected.expectedVideoId || null;
    const expectedPlaylistVideosMatch = playlistMatchesVideos(
        snapshot.ytPlaylist,
        expected.expectedPlaylistVideos
    );
    const validPlaylistIndex = Number.isInteger(snapshot.playlistIndex)
        && snapshot.playlistIndex >= 0
        && snapshot.playlistIndex < snapshot.ytPlaylist.length;
    const validVideoId = typeof snapshot.videoId === "string" && snapshot.videoId.length > 0;
    const coherentVideo = validPlaylistIndex
        && validVideoId
        && String(playlistVideoId) === snapshot.videoId;
    const playlistMatchesExpected = !expectedPlaylistId
        || !snapshot.playlistId
        || snapshot.playlistId === expectedPlaylistId
        || expectedPlaylistVideosMatch;
    const videoMatchesExpected = !expectedVideoId
        || snapshot.videoId === expectedVideoId;
    const playlistLengthMatchesExpected = !expected.expectedPlaylistLength
        || snapshot.ytPlaylist.length === expected.expectedPlaylistLength;
    const stalePreviousPlaylistLength = Boolean(
        expected.previousPlaylistId
        && expectedPlaylistId
        && expected.previousPlaylistId !== expectedPlaylistId
        && expected.previousPlaylistLength
        && expected.expectedPlaylistLength
        && snapshot.ytPlaylist.length === expected.previousPlaylistLength
        && snapshot.ytPlaylist.length !== expected.expectedPlaylistLength
    );
    const stalePreviousVideo = Boolean(
        expected.previousVideoId
        && expected.previousPlaylistId
        && expectedPlaylistId
        && expected.previousPlaylistId !== expectedPlaylistId
        && snapshot.videoId === expected.previousVideoId
    );
    const stateMatches = allowedStates.includes(snapshot.playerState);
    const currentTimeMatches = maxCurrentTime == null
        || !Number.isFinite(snapshot.currentTime)
        || snapshot.currentTime <= maxCurrentTime;

    return {
        valid: stateMatches
            && snapshot.ytPlaylist.length > 0
            && coherentVideo
            && playlistMatchesExpected
            && videoMatchesExpected
            && playlistLengthMatchesExpected
            && !stalePreviousVideo
            && !stalePreviousPlaylistLength
            && currentTimeMatches,
        playingState,
        allowedStates,
        stateMatches,
        currentTimeMatches,
        validPlaylistIndex,
        validVideoId,
        coherentVideo,
        playlistMatchesExpected,
        videoMatchesExpected,
        playlistLengthMatchesExpected,
        expectedPlaylistVideosMatch,
        stalePreviousPlaylistLength,
        stalePreviousVideo,
        playlistVideoId,
        expectedPlaylistId,
        expectedVideoId,
        expectedPlaylistLength: expected.expectedPlaylistLength,
        previousPlaylistLength: expected.previousPlaylistLength,
    };
}

function getPlayingSnapshotValidation(snapshot, expected = {})
{
    return getSnapshotValidation(snapshot, expected);
}

function getCueSnapshotValidation(snapshot, expected = {})
{
    return getSnapshotValidation(snapshot, expected, {
        allowedStates: [
            window.YT?.PlayerState?.UNSTARTED ?? -1,
            window.YT?.PlayerState?.PAUSED ?? 2,
            window.YT?.PlayerState?.CUED ?? 5,
        ],
        maxCurrentTime: 0.5,
    });
}

function shouldRetryReadyTransitionSnapshot(app, snapshot, validation, cueValidation, expectedState)
{
    if(!app?.navigationTransition || !cueValidation?.stateMatches || !cueValidation?.currentTimeMatches)
    {
        return false;
    }

    const stalePreviousVideo = Boolean(
        snapshot.videoId
        && expectedState.previousVideoId
        && snapshot.videoId === expectedState.previousVideoId
    );
    const staleKnownExpectedVideo = Boolean(
        snapshot.videoId
        && expectedState.expectedVideoId
        && snapshot.videoId !== expectedState.expectedVideoId
    );

    return Boolean(
        validation.stalePreviousVideo
        || validation.stalePreviousPlaylistLength
        || validation.playlistMatchesExpected === false
        || stalePreviousVideo
        || staleKnownExpectedVideo
    );
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

    if(typeof app.navigationTransition !== "boolean")
    {
        app.navigationTransition = false;
    }
}

function getChannelFromNumber(channelNumber)
{
    return channelEngine.getChannelByNumber(channelNumber);
}

function refreshLegacyPlaybackControls(reason = "history sync")
{
    if(typeof window.updatePlayerState !== "function")
    {
        return;
    }

    try
    {
        window.updatePlayerState();
    }
    catch(e)
    {
        console.warn("[JT][Navigation] legacy playback controls refresh failed", {
            reason,
            error: e,
        });
    }
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
    // current channel navigation history enough to keep the control state coherent.
    app.alreadyPlayed = app.navigationHistory
        .slice(0, app.navigationCursor + 1)
        .map(function(entry) {
            return entry.playlistIndex;
        });

    refreshLegacyPlaybackControls("alreadyPlayed sync");
}

function resetCurrentNavigationHistory(app, reason = "manual")
{
    if(!app)
    {
        return;
    }

    app.navigationHistory = [];
    app.navigationCursor = -1;
    app.navigationAbortedHistoryTransitionRecovery = null;
    syncLegacyAlreadyPlayedForControls(app);

    console.log("[JT][History] current navigation history reset", {
        reason,
        channelNum: app.channelNum,
        playlistId: app.playlistID,
    });
}

function entryBelongsToActiveChannel(app, entry)
{
    if(!app || !entry)
    {
        return false;
    }

    const sameChannel = entry.channelNumber === app.channelNum;
    const samePlaylist = entry.playlistId === app.playlistID;

    return Boolean(sameChannel && samePlaylist);
}

function pruneForwardHistoryFromCursor(app, reason = "manual")
{
    ensureNavigationHistory(app);

    if(!app || app.navigationCursor >= app.navigationHistory.length - 1)
    {
        return;
    }

    app.navigationHistory = app.navigationHistory.slice(0, app.navigationCursor + 1);
    syncLegacyAlreadyPlayedForControls(app);

    console.log("[JT][History] forward history pruned", {
        reason,
        navigationCursor: app.navigationCursor,
        historyLength: app.navigationHistory.length,
    });
}

function rememberFailedPlaylistIndex(app, index)
{
    if(!app || !Number.isInteger(index))
    {
        return;
    }

    if(!Array.isArray(app.alreadyPlayedErrors))
    {
        app.alreadyPlayedErrors = [];
    }

    if(!app.alreadyPlayedErrors.includes(index))
    {
        app.alreadyPlayedErrors.unshift(index);
    }
}

function getCurrentHistoryEntry(app, player, reason, snapshot = null)
{
    if(!app || !player)
    {
        return null;
    }

    const currentSnapshot = snapshot || getPlayerSnapshot(player);
    const playlistIndex = currentSnapshot.playlistIndex ?? app.currentVideoIndex;
    const videoUrl = currentSnapshot.videoUrl;
    const videoId = currentSnapshot.videoId || app.videoYtId;

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

function replaceCurrentHistoryEntry(app, entry, reason = "manual")
{
    if(!app || !entry)
    {
        return false;
    }

    ensureNavigationHistory(app);

    if(app.navigationCursor < 0 || app.navigationCursor >= app.navigationHistory.length)
    {
        return false;
    }

    app.navigationHistory[app.navigationCursor] = {
        ...app.navigationHistory[app.navigationCursor],
        ...entry,
        reason,
    };

    if(!Array.isArray(app.videoHistory))
    {
        app.videoHistory = [];
    }

    if(entry.videoId && app.videoHistory[0] !== entry.videoId)
    {
        app.videoHistory.unshift(entry.videoId);
    }

    syncLegacyAlreadyPlayedForControls(app);

    console.log("[JT][History] replaced current entry", {
        reason,
        navigationCursor: app.navigationCursor,
        entry: app.navigationHistory[app.navigationCursor],
        historyLength: app.navigationHistory.length,
    });

    return true;
}

function pushCurrentPlaybackToHistory(app, player, reason = "sync")
{
    const snapshot = getPlayerSnapshot(player);
    const validation = getPlayingSnapshotValidation(snapshot, getExpectedTransitionState(app));

    if(!validation.valid)
    {
        console.warn("[JT][History] push current playback skipped: player snapshot not stable", {
            reason,
            navigationTransition: app?.navigationTransition,
            snapshot,
            validation,
        });
        return;
    }

    const entry = getCurrentHistoryEntry(app, player, reason, snapshot);

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

    const previousPlaylistId = app.playlistID;
    const previousVideoId = app.videoYtId;

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

    beginNavigationTransition(app, reason + " / loading history entry", {
        channelNumber: entry.channelNumber,
        playlistId: entry.playlistId,
        playlistIndex: entry.playlistIndex,
        videoId: entry.videoId,
        historyEntry: true,
        previousPlaylistId,
        previousVideoId,
    });

    console.log("[JT][History] loading", {
        reason,
        navigationCursor: app.navigationCursor,
        entry,
    });

    try
    {
        const currentSnapshot = getPlayerSnapshot(player);
        const currentValidation = getPlayingSnapshotValidation(
            currentSnapshot,
            getExpectedTransitionState(app)
        );
        const canReuseCurrentPlaylist = previousPlaylistId === entry.playlistId
            && currentValidation.valid;

        if(canReuseCurrentPlaylist)
        {
            player.playVideoAt(entry.playlistIndex);
        }
        else
        {
            console.log("[JT][History] reloading playlist for history entry", {
                reason,
                previousPlaylistId,
                targetPlaylistId: entry.playlistId,
                currentValidation,
            });

            player.loadPlaylist({
                listType: "playlist",
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

function rememberPlaylistSnapshot(app, playlistId, ytPlaylist, reason)
{
    if(!app || !playlistId || !Array.isArray(ytPlaylist) || ytPlaylist.length === 0)
    {
        return;
    }

    if(!app.navigationPlaylistLengths)
    {
        app.navigationPlaylistLengths = {};
    }

    if(!app.navigationPlaylistVideos)
    {
        app.navigationPlaylistVideos = {};
    }

    if(app.navigationPlaylistLengths[playlistId] !== ytPlaylist.length)
    {
        app.navigationPlaylistLengths[playlistId] = ytPlaylist.length;

        console.log("[JT][Navigation] playlist length remembered", {
            reason,
            playlistId,
            playlistLength: ytPlaylist.length,
        });
    }

    if(!playlistMatchesVideos(ytPlaylist, app.navigationPlaylistVideos[playlistId]))
    {
        app.navigationPlaylistVideos[playlistId] = ytPlaylist.slice();

        console.log("[JT][Navigation] playlist videos remembered", {
            reason,
            playlistId,
            playlistLength: ytPlaylist.length,
            firstVideoId: ytPlaylist[0],
        });
    }
}

function beginNavigationTransition(app, reason, expected = {})
{
    if(!app)
    {
        console.warn("[JT][Navigation] transition start skipped: app unavailable", { reason, expected });
        return;
    }

    ensureNavigationHistory(app);

    app.navigationTransition = true;
    app.navigationTransitionReason = reason;
    app.navigationTransitionStartedAt = Date.now();
    app.navigationTransitionRetryCount = 0;
    app.navigationTransitionHardResetCount = 0;
    app.navigationTransitionExpected = {
        previousPlaylistId: app.playlistID || null,
        previousVideoId: app.videoYtId || null,
        playlistIndex: 0,
        ...expected,
    };
    app.navigationTransitionDiagnostics = null;
    getTransitionDiagnostics(app);
    neutralizeCurrentPlayback(app, getRuntimePlayer(), reason + " / transition start");

    setPlaylistReady(app, false, reason + " / transition start");

    console.log("[JT][Navigation] transition locked", {
        reason,
        expected: app.navigationTransitionExpected,
        navigationCursor: app.navigationCursor,
        historyLength: app.navigationHistory.length,
    });
}

function finishNavigationTransition(app, reason, snapshot)
{
    if(!app)
    {
        console.warn("[JT][Navigation] transition finish skipped: app unavailable", { reason });
        return;
    }

    const duration = app.navigationTransitionStartedAt
        ? Date.now() - app.navigationTransitionStartedAt
        : null;

    app.navigationTransition = false;

    console.log("[JT][Navigation] transition unlocked", {
        reason,
        duration,
        previousReason: app.navigationTransitionReason,
        expected: app.navigationTransitionExpected,
        snapshot,
    });

    app.navigationTransitionReason = null;
    app.navigationTransitionStartedAt = null;
    app.navigationTransitionExpected = null;
    app.navigationTransitionRetryCount = 0;
    app.navigationTransitionHardResetCount = 0;
    app.navigationTransitionDiagnostics = null;
}

function rememberAbortedHistoryTransitionRecovery(app, reason, snapshot, validation)
{
    const expected = app?.navigationTransitionExpected;

    if(!app || !expected?.historyEntry || validation?.skipHistoryRecovery)
    {
        return;
    }

    app.navigationAbortedHistoryTransitionRecovery = {
        reason,
        expected: { ...expected },
        navigationCursor: app.navigationCursor,
        historyLength: app.navigationHistory?.length || 0,
        snapshot: cloneDiagnosticSnapshot(snapshot),
        validation,
        abortedAt: Date.now(),
    };
}

function abortNavigationTransition(app, reason, snapshot, validation)
{
    if(!app)
    {
        return;
    }

    const diagnostics = app.navigationTransitionDiagnostics;

    if(diagnostics)
    {
        if(snapshot)
        {
            recordTransitionSnapshot(app, snapshot, validation || { valid: false }, reason);
        }

        diagnostics.abortedAt = Date.now();
        diagnostics.abortReason = reason;
        diagnostics.duration = diagnostics.abortedAt - diagnostics.startedAt;
        diagnostics.abortSnapshot = cloneDiagnosticSnapshot(snapshot);
        app.lastNavigationTransitionDiagnostics = diagnostics;
    }

    console.warn("[JT][Navigation] transition aborted", {
        reason,
        previousReason: app.navigationTransitionReason,
        expected: app.navigationTransitionExpected,
        snapshot,
        validation,
        diagnostics,
    });

    rememberAbortedHistoryTransitionRecovery(app, reason, snapshot, validation);

    app.navigationTransition = false;
    setPlaylistReady(app, false, reason + " / transition aborted");
    app.navigationTransitionReason = null;
    app.navigationTransitionStartedAt = null;
    app.navigationTransitionExpected = null;
    app.navigationTransitionRetryCount = 0;
    app.navigationTransitionHardResetCount = 0;
    app.navigationTransitionDiagnostics = null;
}

function shouldHardResetTransitionPlayer(app, snapshot, validation, retryCount)
{
    if(!app?.navigationTransition)
    {
        return false;
    }

    const expected = app.navigationTransitionExpected;
    const hardResetCount = app.navigationTransitionHardResetCount || 0;

    if(!expected?.playlistId || hardResetCount >= 2)
    {
        return false;
    }

    const hasAdvancedOldMedia = Number.isFinite(snapshot.currentTime)
        && snapshot.currentTime > 0.5
        && validation?.valid !== true;
    const persistentStaleVideo = Boolean(
        snapshot.videoId
        && expected.previousVideoId
        && snapshot.videoId === expected.previousVideoId
        && retryCount >= 1
    );
    const staleVideoAfterRetries = Boolean(
        snapshot.videoId
        && validation?.coherentVideo === true
        && validation?.playlistMatchesExpected === true
        && validation?.videoMatchesExpected === false
        && retryCount >= 2
    );

    return hasAdvancedOldMedia || persistentStaleVideo || staleVideoAfterRetries;
}

function ensurePlayerMountNode(rebuild = false)
{
    const existingPlayerNode = document.getElementById("player");

    if(existingPlayerNode && !rebuild)
    {
        return existingPlayerNode;
    }

    const wrapper = document.getElementById("player-wrapper");

    if(!wrapper)
    {
        return null;
    }

    const playerNode = document.createElement("div");
    playerNode.id = "player";
    wrapper.innerHTML = "";
    wrapper.appendChild(playerNode);

    return playerNode;
}

function recreateYouTubePlayerForTransition(app, player, reason, snapshot, validation)
{
    if(!app?.navigationTransition || !window.YT?.Player)
    {
        return false;
    }

    const expected = app.navigationTransitionExpected;

    if(!expected?.playlistId)
    {
        return false;
    }

    app.navigationTransitionHardResetCount = (app.navigationTransitionHardResetCount || 0) + 1;
    app.currentVideoIndex = null;
    app.videoYtId = null;
    setPlaylistReady(app, false, reason + " / hard resetting YouTube player");

    getTransitionDiagnostics(app)?.retryReasons.push({
        reason,
        retryCount: app.navigationTransitionRetryCount || 0,
        hardResetCount: app.navigationTransitionHardResetCount,
        snapshot: cloneDiagnosticSnapshot(snapshot),
        validation,
        detectedAt: Date.now(),
        type: "hard-reset-player",
    });

    console.warn("[JT][Navigation] hard resetting YouTube player for transition", {
        reason,
        expected,
        hardResetCount: app.navigationTransitionHardResetCount,
        snapshot,
        validation,
    });

    try
    {
        neutralizeCurrentPlayback(app, player, reason + " / before hard reset");

        if(typeof player?.destroy === "function")
        {
            player.destroy();
        }
    }
    catch(e)
    {
        console.warn("[JT][Navigation] old YouTube player destroy failed", e);
    }

    const mountNode = ensurePlayerMountNode(true);

    if(!mountNode)
    {
        abortNavigationTransition(app, reason + " / hard reset mount unavailable", snapshot, validation);
        return false;
    }

    try
    {
        const targetIndex = getExpectedTargetIndex(expected);

        window.player = new window.YT.Player("player", {
            host: "https://www.youtube-nocookie.com",
            events: {
                onReady(event) {
                    try
                    {
                        event.target.setPlaybackRate?.(app.speed);
                        document.getElementById("player")?.removeAttribute("allowfullscreen");
                        document.getElementById("player")?.setAttribute("allowFullScreen", "");
                        app.realTimeDataMonitored = true;

                        event.target.loadPlaylist({
                            listType: "playlist",
                            list: expected.playlistId,
                            index: targetIndex,
                        });

                        console.log("[JT][Navigation] hard reset player ready", {
                            reason,
                            playlistId: expected.playlistId,
                            index: targetIndex,
                        });
                    }
                    catch(e)
                    {
                        console.warn("[JT][Navigation] hard reset player ready failed", e);
                    }
                },
                onStateChange: window.onPlayerStateChange,
                onError: window.onPlayerError,
            },
            playerVars: {
                origin: window.location.origin,
                controls: 0,
                modestbranding: 1,
                playsinline: 1,
                enablejsapi: 1,
                list: expected.playlistId,
                index: targetIndex,
            },
        });
    }
    catch(e)
    {
        console.warn("[JT][Navigation] hard reset player creation failed", e);
        abortNavigationTransition(app, reason + " / hard reset creation failed", snapshot, {
            ...validation,
            error: e?.message || String(e),
        });
        return false;
    }

    return true;
}

function getHistoryEntryPlayerErrorMatch(app, player, expected)
{
    const snapshot = getPlayerSnapshot(player);
    const expectedState = getExpectedTransitionState(app);
    const expectedPlaylistId = expected?.playlistId || expectedState.playlistId;
    const expectedVideoId = expected?.videoId || expectedState.expectedVideoId;
    const playlistMatches = !expectedPlaylistId
        || !snapshot.playlistId
        || snapshot.playlistId === expectedPlaylistId
        || playlistMatchesVideos(snapshot.ytPlaylist, expectedState.expectedPlaylistVideos);
    const indexMatches = Number.isInteger(expected?.playlistIndex)
        && snapshot.playlistIndex === expected.playlistIndex;
    const videoMatches = Boolean(
        expectedVideoId
        && snapshot.videoId
        && snapshot.videoId === expectedVideoId
    );
    const matches = playlistMatches && (
        expectedVideoId
            ? videoMatches
            : indexMatches
    );

    return {
        matches,
        snapshot,
        playlistMatches,
        indexMatches,
        videoMatches,
        expectedPlaylistId,
        expectedVideoId,
    };
}

function handleHistoryEntryPlayerError(app, player, expected, errorCode, reason)
{
    ensureNavigationHistory(app);

    const errorMatch = getHistoryEntryPlayerErrorMatch(app, player, expected);

    if(!errorMatch.matches)
    {
        getTransitionDiagnostics(app)?.playerErrors.push({
            reason,
            errorCode,
            ignored: true,
            ignoredReason: "stale-history-entry-error",
            snapshot: cloneDiagnosticSnapshot(errorMatch.snapshot),
            expected: {
                playlistId: expected?.playlistId,
                playlistIndex: expected?.playlistIndex,
                videoId: expected?.videoId,
            },
            detectedAt: Date.now(),
        });

        console.warn("[JT][History] ignored stale history-entry player error", {
            reason,
            errorCode,
            expected,
            match: errorMatch,
        });
        return true;
    }

    const failedCursor = app.navigationCursor;
    const failedEntry = app.navigationHistory[failedCursor] || null;
    const failedIndex = Number.isInteger(expected?.playlistIndex)
        ? expected.playlistIndex
        : failedEntry?.playlistIndex;

    rememberFailedPlaylistIndex(app, failedIndex);

    if(failedCursor >= 0 && failedCursor < app.navigationHistory.length)
    {
        app.navigationHistory.splice(failedCursor, 1);
    }

    const restoredCursor = Math.min(failedCursor, app.navigationHistory.length - 1);

    if(restoredCursor < 0)
    {
        abortNavigationTransition(
            app,
            reason + " / failed history entry has no fallback",
            getPlayerSnapshot(player),
            {
                errorCode,
                failedEntry,
                skipHistoryRecovery: true,
            }
        );
        syncLegacyAlreadyPlayedForControls(app);
        return true;
    }

    const restoredEntry = app.navigationHistory[restoredCursor];

    app.navigationCursor = restoredCursor;
    app.currentVideoIndex = null;
    app.videoYtId = null;
    app.navigationTransitionRetryCount = 0;
    app.navigationTransitionHardResetCount = 0;
    app.navigationTransitionExpected = {
        ...expected,
        channelNumber: restoredEntry.channelNumber,
        playlistId: restoredEntry.playlistId,
        playlistIndex: restoredEntry.playlistIndex,
        videoId: restoredEntry.videoId,
        historyEntry: true,
        failedHistoryEntry: failedEntry,
    };

    syncLegacyAlreadyPlayedForControls(app);
    setPlaylistReady(app, false, reason + " / restoring after failed history entry");

    console.warn("[JT][History] failed history entry removed; restoring nearest entry", {
        reason,
        errorCode,
        failedCursor,
        failedEntry,
        restoredCursor,
        restoredEntry,
        historyLength: app.navigationHistory.length,
    });

    try
    {
        player.loadPlaylist({
            listType: "playlist",
            list: restoredEntry.playlistId,
            index: restoredEntry.playlistIndex,
        });
    }
    catch(e)
    {
        abortNavigationTransition(
            app,
            reason + " / failed history fallback load failed",
            getPlayerSnapshot(player),
            {
                errorCode,
                failedEntry,
                restoredEntry,
                error: e?.message || String(e),
                skipHistoryRecovery: true,
            }
        );
    }

    return true;
}

function handleNavigationPlayerError(app, player, event, reason)
{
    if(!app?.navigationTransition || !player || typeof player.loadPlaylist !== "function")
    {
        return false;
    }

    const expected = app.navigationTransitionExpected;

    if(!expected?.playlistId)
    {
        return false;
    }

    const errorCode = Number.parseInt(event?.data, 10);
    const retryableErrors = new Set([2, 5, 100, 101, 150, 153]);

    if(!retryableErrors.has(errorCode))
    {
        abortNavigationTransition(app, reason + " / unretryable player error", getPlayerSnapshot(player), {
            errorCode,
        });
        return true;
    }

    if(expected.historyEntry)
    {
        return handleHistoryEntryPlayerError(app, player, expected, errorCode, reason);
    }

    const currentIndex = Number.isInteger(expected.playlistIndex)
        ? expected.playlistIndex
        : 0;
    const nextIndex = currentIndex + 1;
    const maxAttempts = 10;

    if(nextIndex > maxAttempts)
    {
        abortNavigationTransition(app, reason + " / player error retry limit", getPlayerSnapshot(player), {
            errorCode,
            maxAttempts,
        });
        return true;
    }

    expected.playlistIndex = nextIndex;
    app.playerIndexInitAttempt = nextIndex;
    app.currentVideoIndex = null;
    app.videoYtId = null;
    getTransitionDiagnostics(app)?.playerErrors.push({
        reason,
        errorCode,
        skippedIndex: currentIndex,
        nextIndex,
        detectedAt: Date.now(),
    });
    setPlaylistReady(app, false, reason + " / retrying playlist index after player error");

    console.warn("[JT][Navigation] retrying transition after player error", {
        reason,
        errorCode,
        playlistId: expected.playlistId,
        nextIndex,
    });

    try
    {
        player.loadPlaylist({
            listType: "playlist",
            list: expected.playlistId,
            index: nextIndex,
        });
    }
    catch(e)
    {
        console.warn("[JT][Navigation] transition error retry failed", e);
        abortNavigationTransition(app, reason + " / player error retry failed", getPlayerSnapshot(player), {
            errorCode,
            error: e?.message || String(e),
        });
        return true;
    }

    return true;
}

function handleReadyPlaylistPlayerError(app, player, event, reason)
{
    if(!app || app.navigationTransition || !player)
    {
        return false;
    }

    const errorCode = Number.parseInt(event?.data, 10);
    const retryableErrors = new Set([2, 5, 100, 101, 150, 153]);

    if(!retryableErrors.has(errorCode))
    {
        return false;
    }

    const snapshot = getPlayerSnapshot(player);
    const failedIndex = Number.isInteger(snapshot.playlistIndex)
        ? snapshot.playlistIndex
        : app.currentVideoIndex;

    if(!isPlaylistReady(app, player) && !recoverPlaylistReadyFromPlayer(app, player, reason + " / player error recovery"))
    {
        return false;
    }

    rememberFailedPlaylistIndex(app, failedIndex);

    app.currentVideoIndex = null;
    app.videoYtId = null;

    console.warn("[JT][Navigation] skipping failed ready playlist video", {
        reason,
        errorCode,
        failedIndex,
        snapshot,
    });

    setTimeout(function()
    {
        playRandomVideoFromReadyPlaylist(app, player, reason + " / player error recovery");
    }, 0);

    return true;
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

function recoverPlaylistReadyFromPlayer(app, player, reason)
{
    if(!app || app.navigationTransition || !player)
    {
        return false;
    }

    const snapshot = getPlayerSnapshot(player);
    const playlistId = app.playlistID || snapshot.playlistId;
    const rememberedPlaylist = playlistId
        ? app.navigationPlaylistVideos?.[playlistId]
        : null;
    const snapshotMatchesAppPlaylist = Boolean(
        snapshot.playlistId
        && app.playlistID
        && snapshot.playlistId === app.playlistID
    );
    const snapshotMatchesRememberedPlaylist = playlistMatchesVideos(
        snapshot.ytPlaylist,
        rememberedPlaylist
    );

    if(
        snapshot.ytPlaylist.length === 0
        || (!snapshotMatchesAppPlaylist && !snapshotMatchesRememberedPlaylist)
    )
    {
        return false;
    }

    if(Number.isInteger(snapshot.playlistIndex) && snapshot.playlistIndex >= 0)
    {
        app.currentVideoIndex = snapshot.playlistIndex;
    }

    if(snapshot.videoId)
    {
        app.videoYtId = snapshot.videoId;
    }

    rememberPlaylistSnapshot(
        app,
        playlistId,
        snapshot.ytPlaylist,
        reason + " / recovered playlist-ready snapshot"
    );
    setPlaylistReady(app, true, reason + " / recovered playlist-ready snapshot");

    console.warn("[JT][Navigation] playlist readiness recovered from player snapshot", {
        reason,
        playlistId,
        currentVideoIndex: app.currentVideoIndex,
        videoYtId: app.videoYtId,
        playlistLength: snapshot.ytPlaylist.length,
        snapshot,
    });

    return true;
}

function isValidPlaylistIndex(index, playlistLength)
{
    return Number.isInteger(index)
        && index >= 0
        && index < playlistLength;
}

function getRandomPlaylistBlockedIndexes(app, playlistLength, includeAlreadyPlayed = true)
{
    const blockedIndexes = new Set();
    const sources = [
        includeAlreadyPlayed ? app?.alreadyPlayed : [],
        app?.alreadyPlayedErrors,
        [app?.currentVideoIndex],
    ];

    sources.forEach(function(source) {
        if(!Array.isArray(source))
        {
            return;
        }

        source.forEach(function(index) {
            if(isValidPlaylistIndex(index, playlistLength))
            {
                blockedIndexes.add(index);
            }
        });
    });

    return blockedIndexes;
}

function rebuildRandomPlaylist(app, playlistLength)
{
    console.log("[JT][Navigation] rebuildRandomPlaylist()", { playlistLength });

    app.randomPlaylist = [];

    let blockedIndexes = getRandomPlaylistBlockedIndexes(app, playlistLength, true);

    for(let i = 0; i < playlistLength; i++)
    {
        if(!blockedIndexes.has(i))
        {
            app.randomPlaylist.push(i);
        }
    }

    if(app.randomPlaylist.length === 0)
    {
        blockedIndexes = getRandomPlaylistBlockedIndexes(app, playlistLength, false);

        for(let i = 0; i < playlistLength; i++)
        {
            if(!blockedIndexes.has(i))
            {
                app.randomPlaylist.push(i);
            }
        }
    }

    if(app.randomPlaylist.length === 0)
    {
        for(let i = 0; i < playlistLength; i++)
        {
            if(!app?.alreadyPlayedErrors?.includes(i))
            {
                app.randomPlaylist.push(i);
            }
        }
    }

    shuffleArray(app.randomPlaylist);

    console.log("[JT][Navigation] randomPlaylist rebuilt", {
        playlistLength,
        blockedIndexes: Array.from(blockedIndexes),
        randomPlaylist: structuredClone(app.randomPlaylist),
    });

    return app.randomPlaylist;
}

function playRandomVideoFromReadyPlaylist(app, player, reason)
{
    const ytPlaylist = getYTPlaylist(player);

    console.log("[JT][Navigation] YT playlist", ytPlaylist);

    if(!isPlaylistReady(app, player) && !recoverPlaylistReadyFromPlayer(app, player, reason))
    {
        console.warn("[JT][Navigation] next blocked: playlist not ready", {
            reason,
            playlistReady: app?.playlistReady,
            ytPlaylistLength: ytPlaylist.length,
        });
        return false;
    }

    if(ytPlaylist.length === 0)
    {
        console.warn("[JT][Navigation] next aborted: empty YouTube playlist", { reason });
        return false;
    }

    if(!Array.isArray(app.randomPlaylist) || app.randomPlaylist.length === 0)
    {
        rebuildRandomPlaylist(app, ytPlaylist.length);
    }

    const nextIndex = app.randomPlaylist.shift();

    console.log("[JT][Navigation] selected nextIndex", nextIndex);

    if(nextIndex === undefined)
    {
        console.warn("[JT][Navigation] next aborted: no next index available", { reason });
        return false;
    }

    app.currentVideoIndex = nextIndex;

    try
    {
        player.playVideoAt(nextIndex);

        setTimeout(function()
        {
            syncPlayerState(app, player, reason + " timeout");
        }, 800);
    }
    catch(e)
    {
        console.error("[JT][Navigation] next failed", e);
        return false;
    }

    return true;
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

function retryTransitionPlaylistLoad(app, player, reason, snapshot, validation, options = {})
{
    if(!app?.navigationTransition || !player || typeof player.loadPlaylist !== "function")
    {
        return false;
    }

    const expected = app.navigationTransitionExpected;
    const expectedState = getExpectedTransitionState(app);
    const expectedPlaylistVideos = expectedState.expectedPlaylistVideos;
    const playingState = window.YT?.PlayerState?.PLAYING ?? 1;
    const allowNonPlayingSnapshot = options.allowNonPlayingSnapshot === true;
    const force = options.force === true;

    if(!expected?.playlistId || (!allowNonPlayingSnapshot && snapshot.playerState !== playingState))
    {
        return false;
    }

    const retryCount = app.navigationTransitionRetryCount || 0;
    const maxRetries = expectedPlaylistVideos?.length > 0 ? 3 : 1;

    if(shouldHardResetTransitionPlayer(app, snapshot, validation, retryCount))
    {
        return recreateYouTubePlayerForTransition(
            app,
            player,
            reason,
            snapshot,
            validation
        );
    }

    if(!force && retryCount >= maxRetries)
    {
        abortNavigationTransition(app, reason + " / transition playlist reload limit", snapshot, {
            ...validation,
            retryCount,
            maxRetries,
        });
        return false;
    }

    app.navigationTransitionRetryCount = retryCount + 1;
    app.currentVideoIndex = null;
    app.videoYtId = null;
    getTransitionDiagnostics(app)?.retryReasons.push({
        reason,
        retryCount: app.navigationTransitionRetryCount,
        force,
        allowNonPlayingSnapshot,
        snapshot: cloneDiagnosticSnapshot(snapshot),
        detectedAt: Date.now(),
    });
    setPlaylistReady(app, false, reason + " / retrying incoherent player snapshot");

    console.warn("[JT][Navigation] retrying transition playlist load", {
        reason,
        retryCount: app.navigationTransitionRetryCount,
        expected,
        usingRememberedVideos: Boolean(expectedPlaylistVideos?.length),
        allowNonPlayingSnapshot,
        force,
        snapshot,
        validation,
    });

    try
    {
        const targetIndex = getExpectedTargetIndex(expected);

        player.loadPlaylist({
            listType: "playlist",
            list: expected.playlistId,
            index: targetIndex,
        });
    }
    catch(e)
    {
        console.warn("[JT][Navigation] transition playlist retry failed", e);
        abortNavigationTransition(app, reason + " / transition playlist retry failed", snapshot, {
            ...validation,
            error: e?.message || String(e),
        });
        return false;
    }

    return true;
}

function kickNavigationTransition(app, player, reason = "manual")
{
    if(!app?.navigationTransition || !player)
    {
        return false;
    }

    const snapshot = getPlayerSnapshot(player);
    const validation = getPlayingSnapshotValidation(snapshot, getExpectedTransitionState(app));

    return retryTransitionPlaylistLoad(app, player, reason, snapshot, validation, {
        allowNonPlayingSnapshot: true,
        force: true,
    });
}

function recoverAbortedHistoryTransition(app, player, snapshot, reason)
{
    const recovery = app?.navigationAbortedHistoryTransitionRecovery;

    if(!app || !player || !recovery)
    {
        return false;
    }

    const maxRecoveryAge = 5000;
    const recoveryAge = Date.now() - recovery.abortedAt;
    const expected = recovery.expected || {};
    const playlistMatches = !expected.playlistId
        || snapshot.playlistId === expected.playlistId
        || playlistMatchesVideos(snapshot.ytPlaylist, app.navigationPlaylistVideos?.[expected.playlistId]);

    if(
        recoveryAge > maxRecoveryAge
        || !playlistMatches
        || recovery.navigationCursor !== app.navigationCursor
        || recovery.historyLength !== app.navigationHistory.length
    )
    {
        app.navigationAbortedHistoryTransitionRecovery = null;
        return false;
    }

    const entry = getCurrentHistoryEntry(app, player, reason + " / recovered aborted history transition", snapshot);

    if(!entry)
    {
        return false;
    }

    replaceCurrentHistoryEntry(
        app,
        entry,
        reason + " / recovered aborted history transition"
    );
    app.navigationAbortedHistoryTransitionRecovery = null;

    console.warn("[JT][Navigation] recovered aborted history transition", {
        reason,
        expected,
        entry,
        snapshot,
    });

    return true;
}

function refreshDisplayedVideoTitle(reason)
{
    if(
        typeof window === "undefined"
        || typeof window.JoliTubeUpdateVideoTitle !== "function"
    )
    {
        return;
    }

    try
    {
        window.JoliTubeUpdateVideoTitle(reason);
    }
    catch(e)
    {
        console.warn("[JT][Navigation] video title refresh failed", { reason, error: e });
    }
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
        const snapshot = getPlayerSnapshot(player);
        const expectedState = getExpectedTransitionState(app);
        const validation = getPlayingSnapshotValidation(snapshot, expectedState);
        const cueValidation = app.navigationTransition
            ? getCueSnapshotValidation(snapshot, expectedState)
            : null;

        if(!validation.valid)
        {
            recordTransitionSnapshot(app, snapshot, validation, reason);

            if(cueValidation?.valid)
            {
                recordTransitionSnapshot(app, snapshot, cueValidation, reason, true);

                rememberYouTubeAutoplayResult(app, snapshot, {
                    beforeGesture: "blocked-before-gesture",
                    afterGesture: "ready-after-gesture",
                }, reason + " / stable YT READY snapshot");

                app.currentVideoIndex = snapshot.playlistIndex;
                app.videoYtId = snapshot.videoId;
                rememberPlaylistSnapshot(
                    app,
                    expectedState.playlistId || snapshot.playlistId || app.playlistID,
                    snapshot.ytPlaylist,
                    reason + " / stable YT READY snapshot"
                );
                setPlaylistReady(app, true, reason + " / stable YT READY snapshot");
                finalizeTransitionDiagnostics(
                    app,
                    reason + " / stable YT READY snapshot",
                    snapshot
                );
                finishNavigationTransition(app, reason + " / stable YT READY snapshot", snapshot);

                const entry = getCurrentHistoryEntry(app, player, reason + " / YT READY", snapshot);
                if(entry)
                {
                    pushHistoryEntry(app, entry, reason + " / YT READY");
                }

                refreshDisplayedVideoTitle(reason + " / stable YT READY snapshot");

                console.log("[JT][Navigation] synced ready state", {
                    reason,
                    currentVideoIndex: app.currentVideoIndex,
                    videoYtId: app.videoYtId,
                    playlistReady: app.playlistReady,
                    ytPlaylistLength: snapshot.ytPlaylist.length,
                    playerState: snapshot.playerState,
                    currentTime: snapshot.currentTime,
                    navigationCursor: app.navigationCursor,
                    historyLength: app.navigationHistory.length,
                });
                return;
            }

            const retryReadyTransition = shouldRetryReadyTransitionSnapshot(
                app,
                snapshot,
                validation,
                cueValidation,
                expectedState
            );
            const retryingTransition = retryTransitionPlaylistLoad(
                app,
                player,
                reason,
                snapshot,
                validation,
                {
                    allowNonPlayingSnapshot: retryReadyTransition,
                }
            );

            console.warn("[JT][Navigation] sync skipped: player snapshot not stable", {
                reason,
                navigationTransition: app.navigationTransition,
                transitionReason: app.navigationTransitionReason,
                retryReadyTransition,
                retryingTransition,
                snapshot,
                validation,
                cueValidation,
            });
            return;
        }

        app.currentVideoIndex = snapshot.playlistIndex;
        app.videoYtId = snapshot.videoId;
        recordTransitionSnapshot(app, snapshot, validation, reason, true);
        rememberYouTubeAutoplayResult(app, snapshot, {
            beforeGesture: "allowed-before-gesture",
            afterGesture: "started-after-gesture",
        }, reason + " / stable YT PLAYING snapshot");

        rememberPlaylistSnapshot(
            app,
            getExpectedTransitionState(app).playlistId || snapshot.playlistId || app.playlistID,
            snapshot.ytPlaylist,
            reason + " / stable YT PLAYING snapshot"
        );
        setPlaylistReady(app, true, reason + " / stable YT PLAYING snapshot");

        if(app.navigationTransition)
        {
            finalizeTransitionDiagnostics(
                app,
                reason + " / stable YT PLAYING snapshot",
                snapshot
            );
            finishNavigationTransition(app, reason + " / stable YT PLAYING snapshot", snapshot);
        }

        if(!recoverAbortedHistoryTransition(app, player, snapshot, reason))
        {
            pushCurrentPlaybackToHistory(app, player, reason + " / YT PLAYING");
        }

        refreshDisplayedVideoTitle(reason + " / stable YT PLAYING snapshot");

        console.log("[JT][Navigation] synced state", {
            reason,
            currentVideoIndex: app.currentVideoIndex,
            videoYtId: app.videoYtId,
            playlistReady: app.playlistReady,
            ytPlaylistLength: snapshot.ytPlaylist.length,
            playerState: snapshot.playerState,
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

        if(!entryBelongsToActiveChannel(app, forwardEntry))
        {
            console.warn("[JT][Navigation] forward history blocked: entry belongs to another channel", {
                navigationCursor: app.navigationCursor,
                forwardEntry,
                activeChannelNum: app.channelNum,
                activePlaylistId: app.playlistID,
            });
            pruneForwardHistoryFromCursor(app, "nextVideo / cross-channel forward history blocked");
            console.groupEnd();
            return;
        }

        app.navigationCursor++;
        syncLegacyAlreadyPlayedForControls(app);
        loadHistoryEntry(app, player, forwardEntry, "nextVideo / forward history");
        console.groupEnd();
        return;
    }

    playRandomVideoFromReadyPlaylist(app, player, "nextVideo");

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

    if(!entryBelongsToActiveChannel(app, previousEntry))
    {
        app.navigationCursor++;
        syncLegacyAlreadyPlayedForControls(app);

        console.warn("[JT][Navigation] previous blocked: entry belongs to another channel", {
            navigationCursor: app.navigationCursor,
            previousEntry,
            activeChannelNum: app.channelNum,
            activePlaylistId: app.playlistID,
        });
        console.groupEnd();
        return;
    }

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

    const markGesture = function(event)
    {
        const app = getRuntimeApp();

        if(app?.autoplayStatus?.userGestureSeen)
        {
            return;
        }

        markAutoplayUserGesture(
            app,
            "first user gesture / " + event.type
        );
        detectAutoplayPolicy(
            app,
            getRuntimePlayer(),
            "first user gesture / policy refresh"
        );
    };

    document.addEventListener("pointerdown", markGesture, { capture: true, passive: true });
    document.addEventListener("keydown", markGesture, { capture: true });
    document.addEventListener("touchstart", markGesture, { capture: true, passive: true });

    const legacyOnPlayerStateChange = window.onPlayerStateChange;

    if(typeof legacyOnPlayerStateChange === "function")
    {
        window.onPlayerStateChange = function(event)
        {
            const result = legacyOnPlayerStateChange.apply(this, arguments);
            const playingState = window.YT?.PlayerState?.PLAYING ?? 1;
            const readyWithoutAutoplayStates = new Set([
                window.YT?.PlayerState?.UNSTARTED ?? -1,
                window.YT?.PlayerState?.PAUSED ?? 2,
                window.YT?.PlayerState?.CUED ?? 5,
            ]);

            if(event && event.data === playingState)
            {
                syncPlayerState(getRuntimeApp(), getRuntimePlayer(), "YT PLAYING event");
            }
            else if(event && readyWithoutAutoplayStates.has(event.data) && getRuntimeApp()?.navigationTransition)
            {
                syncPlayerState(getRuntimeApp(), getRuntimePlayer(), "YT READY without autoplay event");
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
            const app = getRuntimeApp();
            const channel = getChannelFromNumber(channelNum);
            const requestedChannelNumber = Number.parseInt(channelNum, 10);
            const requestedPlaylistId = channel?.[3];

            if(!channel || !requestedPlaylistId)
            {
                if(app?.navigationTransition)
                {
                    abortNavigationTransition(
                        app,
                        "loadSelectedChannel(" + channelNum + ") has no resolvable playlist"
                    );
                }

                console.warn("[JT][Navigation] channel load has no resolvable playlist", {
                    channelNum: requestedChannelNumber,
                    channel,
                });

                return legacyLoadSelectedChannel.apply(this, arguments);
            }

            const pendingTransition = app?.navigationTransitionExpected;
            const samePendingTransition = Boolean(
                app?.navigationTransition
                && pendingTransition
                && pendingTransition.channelNumber === requestedChannelNumber
                && pendingTransition.playlistId === requestedPlaylistId
            );
            const sameStableChannel = Boolean(
                app
                && app.navigationTransition === false
                && app.playlistReady === true
                && app.channelNum === requestedChannelNumber
                && app.playlistID === requestedPlaylistId
            );

            if(samePendingTransition || sameStableChannel)
            {
                console.log("[JT][Navigation] duplicate channel load ignored", {
                    channelNum: requestedChannelNumber,
                    playlistId: requestedPlaylistId,
                    samePendingTransition,
                    sameStableChannel,
                    navigationTransition: app?.navigationTransition,
                    playlistReady: app?.playlistReady,
                });
                return;
            }

            if(app?.navigationTransition)
            {
                abortNavigationTransition(
                    app,
                    "loadSelectedChannel(" + channelNum + ") supersedes active transition"
                );
            }

            resetCurrentNavigationHistory(app, "before loadSelectedChannel(" + channelNum + ")");

            beginNavigationTransition(app, "before loadSelectedChannel(" + channelNum + ")", {
                channelNumber: requestedChannelNumber,
                playlistId: requestedPlaylistId,
                playlistIndex: 0,
            });
            app.playerIndexInitAttempt = 0;
            resetRuntimeVideoState(app, "before loadSelectedChannel(" + channelNum + ")");
            return legacyLoadSelectedChannel.apply(this, arguments);
        };

        console.log("[JT][Navigation] loadSelectedChannel reset bridge installed");
    }
    else
    {
        console.warn("[JT][Navigation] loadSelectedChannel bridge skipped: legacy handler unavailable");
    }

    const legacyOnPlayerError = window.onPlayerError;

    if(typeof legacyOnPlayerError === "function")
    {
        window.onPlayerError = function(event)
        {
            if(handleNavigationPlayerError(
                getRuntimeApp(),
                getRuntimePlayer(),
                event,
                "YT player error"
            ))
            {
                return;
            }

            if(handleReadyPlaylistPlayerError(
                getRuntimeApp(),
                getRuntimePlayer(),
                event,
                "YT player error"
            ))
            {
                return;
            }

            return legacyOnPlayerError.apply(this, arguments);
        };

        console.log("[JT][Navigation] onPlayerError transition bridge installed");
    }
    else
    {
        console.warn("[JT][Navigation] onPlayerError bridge skipped: legacy handler unavailable");
    }
}

window.JoliTubeNavigation = {
    nextVideo,
    previousVideo,
    rebuildRandomPlaylist,
    resetRuntimeVideoState,
    syncPlayerState,
    setPlaylistReady,
    detectAutoplayPolicy,
    markAutoplayUserGesture,
    beginNavigationTransition,
    finishNavigationTransition,
    handleNavigationPlayerError,
    kickNavigationTransition,
    isPlaylistReady,
    ensureNavigationHistory,
    pushHistoryEntry,
    pushCurrentPlaybackToHistory,
    loadHistoryEntry,
    installLegacySyncBridge,
};

installLegacySyncBridge();

console.log("[JT][Navigation] module loaded");
