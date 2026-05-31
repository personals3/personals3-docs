---
title: Single upload — with the CLI
---

```bash
ps3 cp ./photo.jpg my-bucket/photos/photo.jpg
```

That's the whole command. The CLI streams the file straight to the server — no temp files, no intermediate buffer.

## Common shapes

```bash
# Upload to a key derived from the local filename
ps3 cp ./photo.jpg my-bucket/photos/   # → my-bucket/photos/photo.jpg

# Upload from stdin (need --content-length so the server can quota-check)
cat report.pdf | ps3 cp - my-bucket/reports/2024.pdf --content-length $(stat -c%s report.pdf)

# Recursive upload of a directory tree
ps3 cp -r ./project my-bucket/project/   # honors .ps3ignore in the dir root

# Mirror a directory continuously (one-shot — re-run to sync changes)
ps3 sync ./project my-bucket/project --delete
```

## What happens under the hood

For files **≤ 8 MiB** the CLI sends a single `PUT`. For larger files it transparently switches to multipart with 4 parts in flight; you don't pass any flag for that. From the outside both look the same — a single `cp` command + one final line of output.

## Overriding the Content-Type

The CLI guesses from the extension. To override:

```bash
ps3 cp ./snapshot my-bucket/backups/snapshot.bin --content-type application/octet-stream
```

## Errors

If `ps3 cp` exits non-zero, it prints the server's error message. The most common ones:

| Error | What it means | Fix |
|---|---|---|
| `QUOTA_EXCEEDED` | You don't have enough space | [Free files](/files/list-download-delete/) or [request more](/quotas/need-more-space/) |
| `NO_SUCH_BUCKET` | The bucket name in the destination doesn't exist | Create it via the dashboard or `ps3 bucket create <name>` |
| `DISK_FULL` | The administrator's disk is past its safety threshold | Contact the administrator — there's nothing you can do client-side |
| `connection refused` | The CLI can't reach the server | Re-check `ps3 login --server …` URL |
