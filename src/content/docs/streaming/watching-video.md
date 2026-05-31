---
title: Watching video
---

Once a video's `transcode` status hits `done`, three places give you playback:

1. **Dashboard preview** — click the file, the inline player auto-loads the HLS master.
2. **Standalone watch page** — `https://personals3.tech/watch/{bucket}/{key}` opens just the player, no chrome. Shareable to anyone who has access to the file.
3. **Embed in your own page** — the HLS master URL is a standard `.m3u8`; drop it into video.js, Shaka Player, or any HTML5 player.

## The URLs

| Resource | URL |
|---|---|
| HLS master | `https://personals3.tech/stream/{object-id}/master.m3u8` |
| Per-quality playlist | `https://personals3.tech/stream/{object-id}/720p/playlist.m3u8` |
| Thumbnails | `https://personals3.tech/stream/{object-id}/thumb_0.jpg` (and `_1`, `_2`, `_3` at 0/25/50/75% of duration) |
| Standalone player page | `https://personals3.tech/watch/{bucket}/{key}` |

`{object-id}` comes from `GET /api/{bucket}/{key}?info` → `objectId`.

## Embedding (video.js)

```html
<link href="https://vjs.zencdn.net/8.0.4/video-js.css" rel="stylesheet">
<video id="player" class="video-js" controls preload="auto" width="800" height="450"></video>
<script src="https://vjs.zencdn.net/8.0.4/video.min.js"></script>
<script>
  videojs('player').src({
    src:  'https://personals3.tech/stream/{object-id}/master.m3u8',
    type: 'application/x-mpegURL'
  });
</script>
```

Other players that natively understand HLS:

- **Safari** (mobile + desktop) — works directly with `<video src="master.m3u8">`
- **hls.js** — for Chrome / Firefox
- **VLC** — Open Network Stream → paste the URL

## Adaptive bitrate

The master manifest lists every rendition (1080p / 720p / 480p / 360p — whichever the source's resolution actually allows). Players pick a rendition based on the viewer's bandwidth and switch on the fly.

## Sharing a video with someone who isn't signed in

Either:

- Make the bucket public — every file becomes accessible at `/public/{bucket}/{key}`
- Create a [pre-signed URL](../files/sharing) for the playable file — the watch page works with the same URL pattern under `/watch/share/...` (planned in next release; for now share the public URL or a download link)

## Common playback issues

- **"This video can't be played"** in the dashboard, while `?info` says `done`: hit refresh once — the playlists are cached for a minute after publish.
- **Plays but stays at 240p**: your bandwidth estimate is conservative. Most players ramp up after 10–20 seconds.
- **Master 200s but per-quality 404s**: transcode partially failed. Click **Retry** on the file.
