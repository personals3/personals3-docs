---
title: Listening to audio
---

Audio uploads (MP3, FLAC, WAV, OGG, M4A) get the same treatment as video — the worker transcodes them to:

- An **HLS audio playlist** (`master.m3u8`) for adaptive streaming
- An **MP3** for universal compatibility
- An **OGG Vorbis** as a free-codec fallback

Plus a per-file standalone listener page at `/listen/{bucket}/{key}`.

## URLs

| Resource | URL |
|---|---|
| HLS master | `https://personals3.tech/stream/{object-id}/master.m3u8` |
| MP3 | `https://personals3.tech/stream/{object-id}/audio.mp3` |
| OGG | `https://personals3.tech/stream/{object-id}/audio.ogg` |
| Standalone player page | `https://personals3.tech/listen/{bucket}/{key}` |

## Embedding

```html
<audio controls src="https://personals3.tech/stream/{object-id}/audio.mp3"></audio>
```

For HLS audio in browsers without native support, use the same `hls.js` snippet from the video page.

## Quota notes

Audio transcoding is way cheaper than video (the outputs are roughly the same size as the input). You're unlikely to hit `skipped_quota` on audio uploads unless you're right at the edge of your quota.
