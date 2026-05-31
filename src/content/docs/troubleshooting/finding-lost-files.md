---
title: Finding lost files
---

You uploaded something and now you can't find it. Walk through these in order.

## 1. Is it in Trash?

Default deletes go to Trash for 30 days. Sidebar → **Trash** → look for the filename. Click **Restore** to put it back in its original bucket.

## 2. Is it an older version?

If the bucket has versioning enabled and someone overwrote the file, the older content lives as a version. Open the file in the dashboard → **Versions** tab → click **Restore** on the one you want.

## 3. Is it under a different prefix?

Keys with `/` in them look like folders in the dashboard. "Going up" with the breadcrumb sometimes hides files you put in the parent. Use **Search** (sidebar) — searches all your buckets at once.

## 4. Is the bucket itself missing?

If you (or an admin) deleted the bucket, everything in it is gone. There's no bucket-level trash. The only recoveries are from the admin's backups (if they keep them).

## 5. Did the upload actually succeed?

Check `?info` to see if the object row exists at all:

```bash
curl "$HOST/api/{bucket}/{key}?info" \
  -H "Authorization: Bearer $TOKEN"
```

A `404` means it was never created — re-upload. A `200` means the row exists; double-check the bucket name in the dashboard URL.

## 6. Was it an in-progress multipart that never completed?

Check `GET /api/{bucket}?uploads` — if you see a stale upload row for the key, your client died before sending `Complete`. You can either:

- Find the part ETags and finish the upload (if you saved them), or
- `DELETE ?uploadId=…` to abort and start over

## Still stuck

Send the bucket + key to the admin. They can run a one-line DB lookup to see exactly what state the row is in — it'll be one of:

- Doesn't exist at all → upload failed
- Exists, `is_deleted=true`, `deleted_at` recent → in trash (restore)
- Exists, on disk → it's there, you're looking in the wrong place
- Exists, *not* on disk → real problem, admin will dig from backups
