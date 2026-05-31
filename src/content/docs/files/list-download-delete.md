---
title: Listing, downloading, deleting
---

The everyday operations, three ways.

## Listing

**Dashboard** — open **Buckets**, click a bucket. Folders are derived from keys with `/` in them; click into one to filter.

**CLI**

```bash
ps3 ls my-bucket/                  # top of the bucket
ps3 ls my-bucket/photos/2024/      # one level deep
ps3 ls -r my-bucket/               # recursive
```

**API**

```bash
curl "$HOST/api/my-bucket?prefix=photos/2024/&delimiter=/&max-keys=100" \
  -H "Authorization: Bearer $TOKEN"
```

Query parameters:

| | |
|---|---|
| `prefix` | Only keys starting with this string |
| `delimiter` | Usually `/` — groups deeper keys into "folder" entries (`commonPrefixes` in the response) |
| `max-keys` | 1–1000 (default 1000) |

Returns either a JSON object (`{ objects: [...], commonPrefixes: [...] }`) or S3 XML (`ListBucketResult`) depending on the client.

## Downloading

**Dashboard** — click a file → **Download**. Big files stream straight from the server; no need to wait for the whole thing to buffer.

**CLI**

```bash
ps3 cp my-bucket/photos/cat.jpg ./cat.jpg          # to a local path
ps3 cp my-bucket/photos/cat.jpg -                  # to stdout
```

**API**

```bash
curl "$HOST/api/my-bucket/photos/cat.jpg" \
  -H "Authorization: Bearer $TOKEN" \
  -o cat.jpg
```

The response is the raw bytes; `Content-Type` and `Content-Length` are set.

### Resumable downloads

```bash
curl -C - "$HOST/api/my-bucket/photos/cat.jpg" \
  -H "Authorization: Bearer $TOKEN" -o cat.jpg
```

We honor HTTP `Range:` headers — `curl -C -` uses them to continue from where it left off.

## Deleting

**Dashboard** — select the file, click **Delete**. By default the file goes to **Trash** for 30 days; "Empty trash" or `?purge` makes it permanent.

**CLI**

```bash
ps3 rm my-bucket/photos/cat.jpg            # → trash
ps3 rm --purge my-bucket/photos/cat.jpg    # skip trash, permanent
```

**API**

```bash
# Soft delete (to trash)
curl -X DELETE "$HOST/api/my-bucket/photos/cat.jpg" \
  -H "Authorization: Bearer $TOKEN"

# Hard delete (immediate, frees quota now)
curl -X DELETE "$HOST/api/my-bucket/photos/cat.jpg?purge=true" \
  -H "Authorization: Bearer $TOKEN"
```

Bulk delete — `POST /api/{bucket}?delete` with `{"keys":[...]}`:

```bash
curl -X POST "$HOST/api/my-bucket?delete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"keys":["a.txt","b.txt","photos/old.jpg"]}'
```

Returns `{ deleted: N, errors: [...], movedToTrash: N }`.

## Object metadata

```bash
curl "$HOST/api/my-bucket/photos/cat.jpg?info" \
  -H "Authorization: Bearer $TOKEN"
```

Returns size, ETag, content type, transcode status (for media), and other bookkeeping.
