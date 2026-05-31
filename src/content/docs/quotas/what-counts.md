---
title: What counts toward your quota
---

Your quota covers **everything PersonalS3 holds for you**. Specifically:

| | What it is |
|---|---|
| **Original file size** | Whatever you uploaded |
| **Transcoded segments** | HLS playlists + thumbnails + WebP/AVIF/MP3/OGG variants for media files |
| **In-flight transcode reservations** | The pre-flight estimate we hold while a transcode is encoding (refunded if it ends up smaller) |
| **Older versions** | Snapshots in a versioned bucket |
| **Trash** | Files still in your trash, until purged or 30-day expiry |
| **In-progress multipart uploads** | Parts you've uploaded but not yet completed (or aborted) |

Free your quota by:

1. **Emptying trash** (Sidebar → Trash → Empty)
2. **Deleting old versions** (file → Versions → Delete) when the bucket is versioned
3. **Removing transcoded variants** for files you don't need streaming on (`DELETE /api/{bucket}/{key}?transcodes`)
4. **Permanently deleting** files (`ps3 rm --purge`, or `DELETE ?purge=true`)
5. **Aborting stuck uploads** — `GET /api/{bucket}?uploads` to find leftovers, `DELETE ?uploadId=…` to clean them up

## Where to see the breakdown

The **Overview** page in the dashboard shows a stacked bar:

- A coloured slice per bucket (live files + transcoded variants)
- A separate slice for in-flight transcode reservations
- A separate slice for trash
- Free space takes up the rest

Each slice tells you exactly what's eating your quota. Hover any slice for a precise byte count.

## I think the numbers are wrong

Tell your administrator. They can run a one-shot reconcile that recomputes from the authoritative source and reports any drift. It's a five-second command.
