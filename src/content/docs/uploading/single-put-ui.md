---
title: Single upload — in the dashboard
---

The fastest way to put a file in a bucket: drag it onto the page.

## Steps

1. Go to **Buckets** and either pick a bucket or create one.
2. The bucket page has an **Upload** zone at the top — drag your file onto it. (You can also click the zone and pick from a file dialog.)
3. The upload runs in the browser. A progress bar shows percentage; if you navigate away during a small upload it may cancel.

The dashboard chooses between single-`PUT` and multipart automatically — files past 8 MiB go multipart with 4-way parallel parts. Either way, when the bar finishes the file shows up in the list.

## Uploading into a sub-folder

PersonalS3 doesn't have real folders — what looks like one is just a key with `/` in it (`photos/2024/holiday.jpg`). When you're "inside" a folder in the dashboard, dropped files get that prefix automatically.

## Replacing an existing file

Drop a file with the same name and it replaces the previous content. The old version goes to **Trash** if the bucket has versioning enabled; otherwise it's overwritten outright.

## Got a 507 / "Insufficient Storage"

You've hit your quota. See [When you hit your limit](../quotas/when-you-hit-your-limit) for what to do.

## Got a different error

See [Upload errors](../troubleshooting/upload-errors).
