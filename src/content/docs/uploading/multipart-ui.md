---
title: Multipart upload — in the dashboard
---

The dashboard does multipart for you. There's no checkbox to flip — files over 8 MiB are automatically split into 5 MiB parts and uploaded 4 at a time in parallel.

## What you see

- A progress bar that ticks smoothly because parts complete continuously.
- A note like `uploading parts 3 / 4 / 5 of 20` in the active-operations panel.

## What happens if a part fails

The browser retries that part. If the whole upload eventually gives up (network drops for a long time), the upload aborts cleanly — the parts that did make it through are reaped by the server's cleaner within a few minutes, so you're never charged for partial leftovers.

## What if I navigate away?

The active upload tries to continue while the tab is open. Closing the tab cancels it. The server reaps the in-flight parts shortly after.

## I want resumable uploads across tabs / page reloads

That's not in the browser yet. For very large uploads where this matters, use [the CLI](./multipart-cli) or roll your own [multipart over the API](./multipart-api) — both store the `uploadId` and resume cleanly.
