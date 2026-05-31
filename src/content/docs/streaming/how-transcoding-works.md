---
title: How transcoding works
---

When you upload a video, an audio file, or an image, PersonalS3 runs it through FFmpeg / Pillow in the background to produce streaming-ready versions:

- **Videos** → an HLS ladder (multiple resolutions stitched into a `master.m3u8`) + JPEG thumbnails
- **Audio** → HLS audio playlist + an MP3 + an OGG fallback
- **Images** → WebP + AVIF + thumbnails

Originals are always kept. Transcoded outputs are *additions*, not replacements.

## What that means for your quota

Transcoded segments count toward your quota too. A 169 MB 4K video can produce ~900 MB of HLS variants depending on duration. We do a pre-flight estimate before kicking off the transcode — if it wouldn't fit, the transcode is marked `skipped_quota` and the original stays available for plain download.

You'll see this in the dashboard:

| Status | What it means |
|---|---|
| `none` | Not a media file, or auto-transcode is off for this bucket |
| `pending` | Queued, reservation made against your quota |
| `processing` | Worker actively encoding |
| `done` | Ladder is ready — play in the dashboard or via HLS URL |
| `failed` | FFmpeg crashed; original is fine; click **Retry** |
| `skipped_quota` | Pre-flight saw "won't fit"; free space and click **Retry** |
| `failed_quota` | Output bigger than the reservation; reaped; original is fine |

## I don't want transcoding

Each bucket has an `auto_transcode_mode` flag. Set it to `off` in the dashboard's bucket settings (or `PATCH /api/{bucket}` with `{"autoTranscodeMode":"off"}`) and uploads skip the worker entirely.

You can still trigger a transcode manually per file (`POST /api/{bucket}/{key}?transcode`).

## I want to redo a transcode

Click **Re-generate** on the file's preview card, or:

```bash
# CLI
ps3 transcode my-bucket/movie.mp4 --restart
# API
DELETE /api/{bucket}/{key}?transcodes   # wipe existing
POST   /api/{bucket}/{key}?transcode    # enqueue fresh
```

The two-step form is useful when you've fixed the underlying file or just want a fresh pass.
