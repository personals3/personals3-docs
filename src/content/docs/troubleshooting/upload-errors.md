---
title: Upload errors
---

The most common ones, with the fix on the same line.

| You see | What's happening | Fix |
|---|---|---|
| `507 QUOTA_EXCEEDED` | You don't have enough quota for this file (or part) | [Free space](../quotas/what-counts.md) or [request more](../quotas/need-more-space.md) |
| `507 DISK_FULL` | The host machine's disk is past the admin's safety threshold | Nothing you can do client-side. Tell the administrator. |
| `400 INVALID_KEY` | The key has illegal characters or is empty | Use printable UTF-8; no leading slashes; non-empty |
| `400 BUCKET_MISMATCH` | (multipart only) The bucket in the part URL doesn't match the one used to initiate | Use the same bucket throughout the upload's lifecycle |
| `400 PART_TOO_SMALL` | (multipart) A part other than the last was under 5 MiB | Re-upload with parts ≥ 5 MiB |
| `400 ETAG_MISMATCH` | (multipart Complete) An ETag you sent doesn't match the server's record | Re-list parts (`GET /api/{bucket}/{key}?uploadId=X`), use those ETags |
| `404 NO_SUCH_BUCKET` | Destination bucket doesn't exist (yet) | Create it first |
| `404 NO_SUCH_UPLOAD` | uploadId expired (7 days), aborted, or never existed | Start a new multipart upload |
| `401 NO_AUTH` / `BAD_TOKEN` | Missing or invalid `Authorization` | Re-login (CLI: `ps3 login`) or refresh your API key |
| `403 FORBIDDEN` | You don't own the bucket you're targeting | Use a bucket you do own |
| `connection reset` mid-upload | Network blip, or proxy timed out | For files > 100 MB use multipart so you only resend the failing part |

## A successful upload but the dashboard doesn't show it

Refresh the page. If it still doesn't show:

- Was it a soft-delete that's still in trash? Check **Trash**.
- Was the bucket recently created? The list cache might lag by a few seconds.

If it really seems missing, file with the admin — they can run a one-shot DB lookup to confirm whether the object row exists.

## Upload appears to finish at 100% but no file lands

Almost always a multipart **Complete** that failed. Two ways it shows up:

1. The CLI / dashboard exits with an error mentioning `MISSING_PART`, `ETAG_MISMATCH`, or similar — fix that and retry.
2. Silent — the client crashed before sending Complete. Use `GET /api/{bucket}?uploads` to find the orphan, then either Complete it (if you still have the part ETags) or `DELETE ?uploadId=…` to abort and start fresh.

## Quota error during multipart, partial parts left over

If you `Abort` (`DELETE ?uploadId=…`), the reserved bytes refund immediately. If you don't, the server's cleaner reaps the parts within ~60s and the multipart row expires after 7 days.

Bottom line: a half-finished multipart upload never permanently eats your quota — at worst it sits for 7 days.
