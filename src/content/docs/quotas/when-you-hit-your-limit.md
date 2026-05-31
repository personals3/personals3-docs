---
title: When you hit your limit
---

If a request would push your `used_bytes` past `quota_bytes`, you get back:

```http
HTTP/1.1 507 Insufficient Storage
Content-Type: application/json

{ "code":    "QUOTA_EXCEEDED",
  "message": "this part would exceed your storage quota",
  "details": {
    "requestedBytes": 5242880,
    "usedBytes":      104857600,
    "quotaBytes":     104857600,
    "availableBytes": 0,
    "deficitBytes":   5242880
  } }
```

Read the `details`:

- **`requestedBytes`** — how many bytes the rejected operation needed
- **`availableBytes`** — what you actually have free right now
- **`deficitBytes`** — how much you'd need to free up to make the request succeed

The dashboard renders this message as a friendly card with the same numbers.

## What to do

1. **Free space** — see [What counts toward your quota](./what-counts) for the quickest wins (empty trash, drop transcodes you don't need).
2. **Ask for more** — see [Need more space?](./need-more-space). A 100 MB starter account can grow as needed.

## Special case — transcoded media

A different status appears on the file:

| Status | What happened | What to do |
|---|---|---|
| `skipped_quota` | Pre-flight estimated the transcode would exceed your quota; no encoding was done. Original is fine. | Free space + click **Retry (need more space)** |
| `failed_quota` | Encoding ran but the actual output overshot the reservation; segments were reaped. Original is fine. | Same — free space + retry |

Both states keep the original file fully usable. Only the streaming variants are missing.

## The cleaner reaps stuff after you delete

When you delete a file, the bytes are reclaimed instantly. Trash items are reclaimed only when you **empty trash** or after their 30-day TTL — until then they still count.

## I deleted something and the bar didn't move

Wait 8 seconds — the dashboard polls the storage chart every 8s. Or refresh.
