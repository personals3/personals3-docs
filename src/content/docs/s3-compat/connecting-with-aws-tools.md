---
title: Connecting with AWS tools
---

PersonalS3 speaks **AWS Signature Version 4** — the same authentication
protocol Amazon S3 uses. That means standard S3 tooling (`aws` CLI,
`boto3`, `rclone`, most S3 SDKs) works against your PersonalS3 account
unchanged. You just point it at a different endpoint.

## 1. Create S3 credentials

S3 tools don't use your `psk_…` API key — they need an **Access Key ID +
Secret Access Key** pair.

**Dashboard** — **API keys** → **S3 Credentials** → **Create**. Copy
both values; the secret is shown **once**.

**API**

```bash
curl -X POST "$HOST/api/auth/s3-credentials" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-laptop"}'
```

Credentials are scoped to your account — anything uploaded with them
lands in your buckets and counts against your quota, same as the
dashboard.

## 2. The endpoint

Everything S3 goes through:

```
https://personals3.tech/api
```

Three things to know:

| | |
|---|---|
| **Region** | Use `us-east-1`. The signature must include *a* region; the server accepts what your client sends, so the conventional default is fine. |
| **Addressing** | Path-style only (`/api/my-bucket/key`). Virtual-host buckets (`my-bucket.personals3.tech`) are not supported. SDKs use path-style automatically when you set a custom `endpoint_url`. |
| **HTTPS** | Always, via Cloudflare. Plain HTTP only works on a LAN install (`http://localhost:8080/api`). |

## 3. aws CLI

```bash
aws configure --profile personals3
# AWS Access Key ID:     <your AKID>
# AWS Secret Access Key: <your secret>
# Default region name:   us-east-1
# Default output:        json

alias ps3aws='aws --profile personals3 --endpoint-url=https://personals3.tech/api'

ps3aws s3 ls
ps3aws s3 mb s3://my-bucket
ps3aws s3 cp ./photo.jpg s3://my-bucket/
ps3aws s3 sync ~/Documents s3://docs-backup/
```

`aws s3 sync` is the killer feature — incremental backups with
`--delete` and `--exclude` patterns, no extra software.

## 4. boto3 (Python)

```python
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="https://personals3.tech/api",
    aws_access_key_id="<your AKID>",
    aws_secret_access_key="<your secret>",
    region_name="us-east-1",
)

s3.upload_file("/tmp/big.zip", "my-bucket", "archives/big.zip")
print(s3.list_objects_v2(Bucket="my-bucket")["KeyCount"])
```

`upload_file` automatically switches to multipart for large files —
PersonalS3 supports the full multipart protocol, so this just works.

## 5. rclone

```ini
# ~/.config/rclone/rclone.conf
[personals3]
type = s3
provider = Other
access_key_id = <your AKID>
secret_access_key = <your secret>
endpoint = https://personals3.tech/api
region = us-east-1
```

```bash
rclone copy ~/photos personals3:photos/
rclone sync ~/important personals3:nightly/ --progress
```

## What to read next

- [How SigV4 works](/s3-compat/how-sigv4-works/) — what's actually in
  that `Authorization` header and how the server verifies it
- [Differences from Amazon S3](/s3-compat/differences-from-s3/) — what's
  supported, what isn't, and where responses differ
