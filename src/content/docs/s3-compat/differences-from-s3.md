---
title: Differences from Amazon S3
---

PersonalS3 implements the common subset of the S3 API — enough that
`aws-cli`, `boto3`, and `rclone` work for everyday storage. It is not a
byte-for-byte S3 clone. This page lists where they diverge, so you're
not surprised mid-script.

## What's supported

| S3 feature | Status |
|---|---|
| ListBuckets / CreateBucket / DeleteBucket | ✅ |
| ListObjectsV2 (`prefix`, `delimiter`, `max-keys`) | ✅ |
| PutObject / GetObject (with Range) / HeadObject / DeleteObject | ✅ |
| Multipart upload (Initiate / UploadPart / ListParts / Complete / Abort) | ✅ |
| SigV4 header authentication (incl. `UNSIGNED-PAYLOAD`) | ✅ |
| S3 XML responses + S3-style XML errors for SDK clients | ✅ |
| Single-part ETag = MD5 of bytes; multipart ETag = `md5-of-md5s-N` | ✅ |

## What isn't

| S3 feature | Status | Use instead |
|---|---|---|
| **Pre-signed URLs (SigV4 query strings)** | ❌ | PersonalS3 [share links](/files/sharing/) — see below |
| Versioning via the S3 API | ❌ | [Versioning & trash](/files/versioning-and-trash/) via dashboard / PersonalS3 API |
| Lifecycle rules | ❌ | Trash auto-expiry is built in |
| Bucket policies / ACLs / `x-amz-acl` | ❌ (accepted, ignored) | Per-user quotas + public-bucket flag |
| Server-side encryption headers | ❌ (accepted, ignored) | Full-disk encryption on the host |
| `STREAMING-AWS4-HMAC-SHA256-PAYLOAD` chunked signing | ❌ | Disable payload signing in your client (most default to `UNSIGNED-PAYLOAD` over HTTPS) |
| S3 Select, Glacier storage classes, replication, Object Lock | ❌ | — |

## JSON or XML? Depends who's asking

PersonalS3 has one set of routes serving two kinds of clients. The
server decides the response format per request:

- The request carries SigV4 markers (`AWS4-HMAC-SHA256` Authorization,
  `x-amz-date`, or `x-amz-content-sha256`) → **S3-style XML**, including
  XML error bodies with S3 error codes (`NoSuchBucket`,
  `SignatureDoesNotMatch`, …).
- Anything else (dashboard, `psk_…` API keys, curl with Bearer tokens)
  → **JSON**.

So `aws s3 ls` sees `<ListAllMyBucketsResult>` while the same listing
via your API key returns a JSON array. Both are first-class; you never
need to request a format explicitly.

## Share links are not S3 pre-signed URLs

This is the difference most likely to bite an S3-fluent user, so to be
explicit:

**`generate_presigned_url()` (boto3) and `aws s3 presign` do not work
against PersonalS3.** They produce SigV4 *query-string* signatures
(`?X-Amz-Signature=…`), which the server doesn't verify yet. The link
they print will be rejected.

PersonalS3 has its own share-link scheme instead:

```bash
curl -X POST "$HOST/api/my-bucket/file.pdf?presign" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expiresSec": 604800, "method": "GET"}'
```

```json
{ "url": "/share/my-bucket/file.pdf?sig=…&expires=…",
  "expiresAt": 1781234567, "method": "GET", "shareId": "…" }
```

Note the response is **JSON, not XML** — share links are a PersonalS3
API feature, not part of the S3-compatible surface, regardless of how
you authenticate. Functionally the result is equivalent to an S3
pre-signed URL (time-limited, credential baked in, works without an
account) and adds something S3 doesn't have: **revocation** — kill a
link before it expires via `DELETE /api/shares/{shareId}` or the
dashboard's Share-links page.

Full details: [Sharing](/files/sharing/).

## Quota errors

S3 never tells you "disk full" — PersonalS3 does. Exceeding your quota
returns `507 Insufficient Storage` with a machine-readable body
(`requestedBytes`, `availableBytes`, `deficitBytes`). S3 SDKs treat 507
as a generic client error; check the body when an upload fails. See
[When you hit your limit](/quotas/when-you-hit-your-limit/).
