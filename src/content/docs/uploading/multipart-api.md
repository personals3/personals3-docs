---
title: Multipart upload — over the HTTP API
---

Three steps:

1. **Initiate** — server returns an `uploadId`.
2. **Upload parts** in any order, in parallel.
3. **Complete** — send the part list back, server assembles + returns the final ETag.

You can also **Abort** at any time to throw away in-progress parts and free your reservation.

## End-to-end

```bash
TOKEN="psk_a4b2c8d1.f0e9d8c7…"
HOST="https://your-instance.example"
BUCKET="my-bucket"
KEY="archives/big.tar"
FILE="./big.tar"
PART_SIZE=$((5 * 1024 * 1024))    # 5 MiB minimum (S3 rule)

# 1. Initiate
UPLOAD_ID=$(curl -fsS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$HOST/api/$BUCKET/$KEY?uploads" \
  | jq -r .uploadId)

# 2. Upload each part, capture ETag
SIZE=$(stat -c%s "$FILE")
NPARTS=$(( (SIZE + PART_SIZE - 1) / PART_SIZE ))
PARTS='['
for ((n=1; n<=NPARTS; n++)); do
  ETAG=$(dd if="$FILE" bs=$PART_SIZE skip=$((n-1)) count=1 2>/dev/null |
    curl -fsS -X PUT --data-binary @- \
      -H "Authorization: Bearer $TOKEN" \
      -D - "$HOST/api/$BUCKET/$KEY?partNumber=$n&uploadId=$UPLOAD_ID" \
      | grep -i '^ETag:' | sed -E 's/.*"([^"]+)".*/\1/' | tr -d '\r\n')
  PARTS+="{\"partNumber\":$n,\"etag\":\"$ETAG\"}"
  (( n < NPARTS )) && PARTS+=','
done
PARTS+=']'

# 3. Complete
curl -fsS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data "{\"parts\":$PARTS}" \
  "$HOST/api/$BUCKET/$KEY?uploadId=$UPLOAD_ID"
```

## Step 1 — Initiate

```http
POST /api/{bucket}/{key}?uploads HTTP/1.1
Authorization: Bearer ...
Content-Type: video/mp4
```

| Header | Required | Notes |
|---|---|---|
| `Authorization` | Yes | Bearer key or JWT |
| `Content-Type` | No, but recommended | Stored on the final object; defaults to `application/octet-stream` |

Response:

```json
{ "bucket": "videos", "key": "movie.mp4", "uploadId": "abc-123…" }
```

**Hold onto `uploadId`** — every later step needs it. Save it locally if you want to resume across runs.

## Step 2 — Upload one part

```http
PUT /api/{bucket}/{key}?partNumber={N}&uploadId={X} HTTP/1.1
Authorization: Bearer ...
Content-Length: 5242880

<raw bytes>
```

| Field | Constraint |
|---|---|
| `partNumber` | Integer `1` – `10000`. Order doesn't matter for transport; the final assembly uses this number. |
| Part size | **≥ 5 MiB** except the last (which can be smaller). Smaller parts are accepted by the server but `Complete` will reject the upload. |
| `Content-Length` | Recommended — lets us reject early on quota. |

Response:

```http
HTTP/1.1 200 OK
ETag: "9c4f9b1d…"
```

Capture the ETag for each part. You'll send the list back on Complete.

### Do parts have to upload in order?

No. Upload them in parallel — typical clients run 4 in flight at once. Re-uploading the same `partNumber` overwrites the previous attempt (handy for retries).

## Step 3 — Complete

```http
POST /api/{bucket}/{key}?uploadId={X} HTTP/1.1
Authorization: Bearer ...
Content-Type: application/json

{ "parts": [
    { "partNumber": 1, "etag": "9c4f9b1d…" },
    { "partNumber": 2, "etag": "7a2e1c4f…" },
    ...
]}
```

(For AWS-SDK clients, the same endpoint also accepts the standard `CompleteMultipartUpload` XML — we sniff the `Content-Type` and dispatch.)

The server:

1. Verifies every claimed part is present + ETags match
2. Enforces the 5 MiB minimum (except last)
3. Concatenates the parts into the final object
4. Returns the final ETag in S3 format (`md5(concat(md5s))-N`)

Response:

```json
{ "bucket": "videos", "key": "movie.mp4",
  "etag": "f7d4...e1-20", "size": 104857600 }
```

## Step 3' — Abort

```http
DELETE /api/{bucket}/{key}?uploadId={X} HTTP/1.1
Authorization: Bearer ...
```

Returns `204 No Content`. Reaps the uploaded parts on disk and refunds your reserved quota. Use this if your client decides to give up partway.

## Listing your in-progress uploads

```http
GET /api/{bucket}?uploads HTTP/1.1
Authorization: Bearer ...
```

```json
{ "bucket": "videos",
  "uploads": [
    { "uploadId": "abc-123…", "key": "movie.mp4",
      "totalBytes": 41943040, "numParts": 8,
      "createdAt": "2026-05-30T10:00:00Z",
      "expiresAt": "2026-06-06T10:00:00Z" } ] }
```

Useful when you've lost track of a `uploadId` and want to either resume or abort it. In-progress uploads auto-expire after **7 days** and are cleaned up automatically.

## Resuming a stalled upload

If your client crashed mid-upload:

1. Hit `GET /api/{bucket}?uploads` (above) to find the `uploadId`.
2. Hit `GET /api/{bucket}/{key}?uploadId={X}` to list which parts already landed.
3. Re-upload only the missing `partNumber`s.
4. Complete with the full list (received + freshly-uploaded).

## Quota errors during multipart

If a part `PUT` returns `507 QUOTA_EXCEEDED`, you've hit your cap. The reservation for **that** part is refunded automatically, but **earlier accepted parts stay reserved** until you either `Complete` (charges them as the final object) or `DELETE` (Abort, refunds them).

If you walk away without aborting, the server reaps abandoned multipart directories within ~60 seconds and the 7-day-old upload row eventually goes too.
