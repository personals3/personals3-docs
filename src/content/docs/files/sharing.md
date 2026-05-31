---
title: Sharing
---

Two ways to give someone access to a file:

1. **Pre-signed URL** — time-limited link with the credential baked in. Anyone with the URL can fetch the file until it expires (or you revoke it). Works without an account.
2. **Public bucket** — every object becomes browsable at `/public/{bucket}/{key}`. Use only when you want *all* files in that bucket to be open.

## Pre-signed URLs

**Dashboard** — click a file → **Share link**. Pick how long it should live (1 hour to 30 days). The dashboard puts the URL on your clipboard. Manage / revoke under **Share links** in the sidebar.

**CLI**

```bash
ps3 share my-bucket/file.pdf --expires 7d
# → https://your-instance.example/share/my-bucket/file.pdf?sig=…&expires=…
```

**API**

```bash
curl -X POST "$HOST/api/my-bucket/file.pdf?presign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expiresSec": 604800, "method": "GET", "download": false}'
```

Body fields:

| | |
|---|---|
| `expiresSec` | Seconds from now until expiry. Cap is 30 days. |
| `method` | `"GET"` (default), `"HEAD"`, or `"PUT"`. PUT lets the recipient upload a file *at that key*. |
| `download` | If `true`, the link sets `Content-Disposition: attachment` — browsers download instead of inline-rendering. |

Response:

```json
{ "url":       "/share/my-bucket/file.pdf?sig=…&expires=…",
  "expiresAt": 1735689600,
  "method":    "GET",
  "shareId":   "..." }
```

The URL is relative — prepend your instance's origin to make it shareable.

### Revoking a share

`shareId` from the response is your handle. To kill the link before it expires:

```bash
curl -X DELETE "$HOST/api/shares/$SHARE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Or use the **Share links** page in the dashboard.

## Public buckets

Toggle a bucket's "public" flag — every object becomes readable at:

```
/public/{bucket}/{key}
```

No signature, no expiry, indexable by search engines if you publish the link. Use only for genuinely public content.

```bash
curl -X PATCH "$HOST/api/my-bucket" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isPublic": true}'
```

The dashboard shows a clear banner on public buckets so you can't forget.
