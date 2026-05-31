---
title: Choosing single vs multipart upload
---

There are two upload paths. The dashboard and the CLI pick the right one automatically — you only need to think about this if you're writing your own integration against the HTTP API.

## The rule

| File size | Use |
|---|---|
| **≤ 8 MiB** | A single `PUT` request |
| **> 8 MiB** | Multipart upload (initiate → upload parts → complete) |

The 8 MiB cutoff isn't a hard limit — single `PUT` works for files up to a few GB if your network is reliable. It's just the point past which multipart starts paying off:

- **Resumability** — if one part fails, you only resend that part, not the whole file.
- **Parallelism** — multiple parts upload concurrently and finish in a fraction of single-stream time.
- **Pre-flight quota check per part** — you get rejected at the first part that wouldn't fit, instead of after streaming 5 GB.

## What about huge files?

Multipart supports up to **10,000 parts** per upload. With the default 5 MiB part size that caps you at ~50 GB; the CLI auto-scales the part size for bigger files so the cap effectively doesn't matter for normal use.

## Picking by client

- **Dashboard** — automatic. Drag-drop and it just works.
- **`ps3 cp`** — automatic. Files > 8 MiB get split; the CLI uploads 4 parts in parallel.
- **Custom HTTP code** — your choice. See the next pages for both flows fully worked out.
