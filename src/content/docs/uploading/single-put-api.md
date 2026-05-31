---
title: Single upload — over the HTTP API
---

```http
PUT /api/{bucket}/{key} HTTP/1.1
Host: personals3.tech
Authorization: Bearer psk_a4b2c8d1.f0e9d8c7…
Content-Type: image/jpeg
Content-Length: 1457221

<raw bytes of the file>
```

That's it. One request, file in.

## Full curl example

```bash
TOKEN="psk_a4b2c8d1.f0e9d8c7…"
HOST="https://personals3.tech"

curl -X PUT "$HOST/api/my-bucket/photos/photo.jpg" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@./photo.jpg"
```

## What every header does

| Header | Required? | What to put |
|---|---|---|
| **`Authorization`** | **Yes** | `Bearer <your-key>` — use either a `psk_…` [API key](../account/api-keys) or your dashboard JWT |
| **`Content-Type`** | Recommended | The file's MIME type. If you skip it we default to `application/octet-stream`. Browsers and the dashboard preview rely on this. |
| **`Content-Length`** | Recommended | Helps us quota-check before reading the body. With chunked transfer encoding we measure as we go and reject when we overflow. |
| **`If-None-Match: "*"`** | Optional | Refuse to overwrite if an object already exists at this key. Returns `412 Precondition Failed`. |

## What NOT to include

| Don't send | Why |
|---|---|
| `x-amz-acl`, `x-amz-tagging`, `x-amz-server-side-encryption` | We accept them silently for SDK compatibility, but they have no effect. Don't rely on their behaviour. |
| `Transfer-Encoding: chunked` *and* `Content-Length` together | One or the other. Chunked uses `Transfer-Encoding`, `--data-binary` in curl uses `Content-Length`. |
| `Expect: 100-continue` to push a quota check earlier | We don't speak `100-continue` yet — wastes a round trip. |

## Success response

```http
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "9d8f7e6c5b4a3210…"
X-Object-Size: 1457221

{ "bucket": "my-bucket", "key": "photos/photo.jpg",
  "size": 1457221, "etag": "9d8f7e6c5b4a3210…",
  "contentType": "image/jpeg" }
```

The `ETag` is the MD5 of the bytes — same format you'd get from real S3 for a single-part upload. Use it for integrity checks (`md5sum local-file | cut -c-32`) or as an opaque cache key.

## Error response shape

Every error uses the same envelope:

```json
{
  "code":    "QUOTA_EXCEEDED",
  "message": "this part would exceed your storage quota",
  "details": {
    "requestedBytes": 5242880,
    "usedBytes":      104857600,
    "quotaBytes":     104857600,
    "availableBytes": 0,
    "deficitBytes":   5242880
  }
}
```

`details` is populated for quota and capacity errors so your client can render exactly what's missing. Codes you'll see most:

| HTTP | `code` | Meaning |
|---|---|---|
| `400` | `INVALID_KEY` | The key is empty or has illegal characters |
| `401` | `NO_AUTH` / `BAD_TOKEN` | Missing or invalid `Authorization` |
| `403` | `FORBIDDEN` | Authenticated but you don't own this bucket |
| `404` | `NO_SUCH_BUCKET` | Bucket doesn't exist (yet) |
| `412` | `PRECONDITION_FAILED` | `If-None-Match: *` and the key already exists |
| `507` | `QUOTA_EXCEEDED` | You're out of space — see `details` |
| `507` | `DISK_FULL` | The host disk is full — admin problem |

## When to use multipart instead

If your file is over a few hundred MB **and** your connection is unreliable, single `PUT` makes a network hiccup wipe out the whole transfer. See [Multipart over the API](./multipart-api) for the resumable version.
