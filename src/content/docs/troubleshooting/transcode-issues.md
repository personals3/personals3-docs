---
title: Transcode issues
---

A summary of the four less-than-happy states a transcode can end up in, with the fix for each.

| Status | What it means | What to do |
|---|---|---|
| `pending` for hours | Worker hasn't picked it up yet | Tell the admin — usually the worker container is down |
| `processing` for hours | FFmpeg is stuck or the file is genuinely huge | Click **Cancel & restart** — picks a fresh attempt |
| `failed` | FFmpeg crashed past the retry limit; segments reaped | Click **Retry**. If it fails repeatedly, the source file is probably corrupt |
| `skipped_quota` | Pre-flight estimated the transcode would push you over quota; no encoding ran | [Free space](../quotas/what-counts), then click **Retry (need more space)** |
| `failed_quota` | Actual output exceeded the reservation; segments reaped at publish | Same — free space + retry. Estimate may have been too low for this particular file |

Originals are preserved in every state. Only the streaming variants are at risk.

## I just want the original — can I disable transcoding?

Yes. On the bucket settings (dashboard or `PATCH /api/{bucket}`), set `autoTranscodeMode` to `off`. Future uploads in that bucket skip the worker entirely. You can still trigger a transcode manually per file later.

## Re-encoding a specific file

```bash
# Wipe existing variants + start fresh
curl -X DELETE "$HOST/api/my-bucket/movie.mp4?transcodes" \
  -H "Authorization: Bearer $TOKEN"
curl -X POST "$HOST/api/my-bucket/movie.mp4?transcode" \
  -H "Authorization: Bearer $TOKEN"
```

The dashboard's **Re-generate** button does the same in one click.

## Watching a transcode happen

The dashboard's preview card shows a per-rung progress bar. The **Logs → Transcodes** page (admin only) shows every job across the system with live status — useful when you've got several files in flight.

## The transcoded file is way bigger than I expected

That's normal for HLS. A 169 MB 4K MP4 can produce ~900 MB of variants because:

- HLS encodes each resolution rung independently (no shared base layer)
- Long-form content multiplies — 30 minutes at 1080p alone is several hundred MB

If your quota is tight, turn off auto-transcode on the bucket and only enable streaming per-file when you actually need it.
