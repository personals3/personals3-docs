---
title: How SigV4 works
---

Every request an S3 client sends to PersonalS3 carries an
`Authorization` header that looks like this:

```
Authorization: AWS4-HMAC-SHA256
  Credential=AKIAXXXXXXXXXXXXXXXX/20260612/us-east-1/s3/aws4_request,
  SignedHeaders=host;x-amz-content-sha256;x-amz-date,
  Signature=5d672d79c15b13162d9279b0855cfba6789a8edb4c82c400e06b5924a6f2b5d7
```

Your secret key is **never sent over the wire**. Instead, the client
*proves it knows the secret* by computing an HMAC signature over the
request, and the server — which also knows the secret — recomputes the
same signature and compares. If even one signed byte of the request
changed in transit, the signatures won't match.

## What the client does (signing)

1. **Canonicalize the request.** Build a deterministic string from the
   HTTP method, the URL path, the (sorted) query parameters, the
   headers listed in `SignedHeaders`, and a SHA-256 hash of the body.
   Two requests that differ in any of these produce different strings.
2. **Build the string-to-sign.** Combine the canonical request's hash
   with a timestamp and the *credential scope* —
   `date/region/service/aws4_request`. The scope is why a signature for
   `us-east-1/s3` can't be replayed against a different region or
   service.
3. **Derive the signing key.** Starting from the secret key, chain four
   HMAC-SHA256 operations: secret → date → region → service →
   `aws4_request`. The result is a key that's only valid for that one
   day and scope — so even if a derived key leaked, it expires.
4. **Sign.** HMAC-SHA256 the string-to-sign with the derived key. The
   hex result is the `Signature=` field.

Your SDK does all of this invisibly on every request.

## What PersonalS3 does (verifying)

1. Parses the `Authorization` header into access key, scope, signed
   headers, and signature.
2. Looks up the **Access Key ID** → finds your account and the stored
   secret.
3. Recomputes steps 1–4 from the actual request it received, using its
   copy of the secret.
4. Compares signatures in constant time. Match → the request is
   authenticated as you. Mismatch → `403 SignatureDoesNotMatch`.
5. Checks `x-amz-date` is within the allowed clock skew, so a captured
   request can't be replayed later.

## The body hash

The `x-amz-content-sha256` header ties the signature to the request
body. Two modes are supported:

| Mode | When |
|---|---|
| `<hex SHA-256 of the body>` | Default. The body is hashed and that hash is signed — body tampering breaks the signature. |
| `UNSIGNED-PAYLOAD` | Streaming uploads where the client doesn't want to buffer the file to hash it first. The headers are still signed; the body is protected by TLS only. SDKs commonly use this over HTTPS. |

Not supported: `STREAMING-AWS4-HMAC-SHA256-PAYLOAD` (per-chunk signing
used by some SDK configurations). If a client insists on it, disable
payload signing or chunked encoding in that client's settings.

## Why this design is good

- **Secret never travels.** Unlike `Authorization: Bearer <token>`,
  intercepting one request doesn't yield a reusable credential — the
  signature is bound to that exact request and timestamp.
- **Integrity for free.** The signature covers method, path, query,
  key headers, and (by default) the body — a proxy or middlebox that
  rewrites any of it gets rejected.
- **Verification is pure CPU.** No session storage, no token table
  lookups beyond the access-key row. Each request stands alone.

## See also

- [Connecting with AWS tools](/s3-compat/connecting-with-aws-tools/) —
  practical setup for aws-cli / boto3 / rclone
- [Differences from Amazon S3](/s3-compat/differences-from-s3/) — the
  edges where PersonalS3 and S3 diverge
