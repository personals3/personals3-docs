---
title: Multipart upload — with the CLI
---

```bash
ps3 cp ./big-archive.tar my-bucket/archives/big-archive.tar
```

You don't pass any multipart flag. The CLI checks the file size; anything over 8 MiB is split into 5 MiB parts and pushed 4 in parallel. For very large files (50 GB+) the part size scales up automatically so we stay under the 10,000-part cap.

## What you see

```
uploading big-archive.tar:  43% (4.30 GB / 10.00 GB)
uploading big-archive.tar:  88% (8.80 GB / 10.00 GB)
uploaded ./big-archive.tar → my-bucket/archives/big-archive.tar (10.00 GB)
```

## If something fails mid-upload

The CLI aborts the multipart upload server-side before it exits, so you're not charged for orphan parts. Re-running the command starts fresh.

> **Resumability is on the roadmap.** Right now `ps3 cp` doesn't keep state across runs — a Ctrl-C means starting over on the next attempt. If you need true resume today, [drive the multipart flow via the API](/uploading/multipart-api/) and persist the `uploadId` yourself.

## Recursive uploads of folders

`ps3 cp -r ./photos my-bucket/photos/` and `ps3 sync ./photos my-bucket/photos --delete` both apply the same per-file multipart logic. Small files go single-`PUT`, large ones go multipart, no flag needed.

## Tuning parallelism / part size

Defaults are sensible for most networks. If you're on a very slow link and 4 parallel parts saturate it badly:

```bash
# (planned — not in current CLI; pass via API for now)
ps3 cp --multipart-concurrency 2 --multipart-chunk-size 16M ./big.tar my-bucket/big.tar
```

The flags above are reserved for the next CLI release. In the meantime, the defaults are 4 × 5 MiB which works well for 50 Mbps – 1 Gbps connections.
