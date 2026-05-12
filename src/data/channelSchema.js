/*
 * JoliTube channel data schema
 *
 * Legacy data.js currently stores channels as positional arrays:
 *
 * [title, description, logo, playlistId, curatorIndex]
 *
 * This module documents the intended shape for the future migration.
 * It is intentionally not wired into the runtime yet.
 */

export const CHANNEL_FIELD_INDEX = Object.freeze({
    title: 0,
    description: 1,
    logo: 2,
    playlistId: 3,
    curatorIndex: 4,
});

export function normalizeLegacyChannel(channel, index) {
    return {
        id: index + 1,
        title: channel[CHANNEL_FIELD_INDEX.title],
        description: channel[CHANNEL_FIELD_INDEX.description],
        logo: channel[CHANNEL_FIELD_INDEX.logo],
        playlistId: channel[CHANNEL_FIELD_INDEX.playlistId],
        curatorIndex: channel[CHANNEL_FIELD_INDEX.curatorIndex],
    };
}

export function normalizeLegacyCurator(curator, index) {
    return {
        id: index,
        name: curator[0],
        url: curator[1],
    };
}
