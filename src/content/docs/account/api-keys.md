---
title: API keys
---

API keys let scripts, services, and the CLI talk to your account without sharing your password. Treat them like passwords — anyone with the key has your access.

> **Future change:** today every key has full access to your account. A later version will let you scope keys (read-only, write-only, share-only, admin) so a leaked key has limited blast radius. The format is forward-compatible — keys you create now will continue to work.

## Creating a key

In the dashboard, go to **API Keys** → **Create new key**.

Fill in:

| Field | Notes |
|---|---|
| **Name** | A label for yourself — e.g. `home-server`, `github-actions`. Helps you spot which to revoke. |
| **Expires (optional)** | A future date. Leaving it blank means the key never expires. Short-lived keys are safer for one-off jobs. |

After clicking **Create**, you'll see the plaintext key **once**. Copy it to wherever you're going to use it — the dashboard never shows it again. (If you lose it, just revoke it and make a new one.)

A key looks like:

```
psk_a4b2c8d1.f0e9d8c7b6a59483726150…
```

The part before the dot is a public prefix we use to identify the key in the dashboard. The full string is the secret.

## Using a key

Send it as a `Bearer` token in the `Authorization` header:

```bash
curl https://personals3.tech/api/ \
  -H "Authorization: Bearer psk_a4b2c8d1.f0e9d8c7…"
```

You can also use a key as the CLI's session token:

```bash
ps3 login --server https://personals3.tech --token "psk_a4b2…"
```

That's useful in CI: bake the key into the environment, the CLI uses it directly, no interactive login.

## Listing & revoking

The **API Keys** page shows every key (prefix + name + last-used time + expiry). Click **Revoke** to invalidate one immediately — any in-flight requests using it will start returning `401` on the next call.

## AWS-style credentials (`AKIA...` + secret)

If you need to point an existing S3 tool at PersonalS3 (boto3, the `aws` CLI, rclone), use the **S3 credentials** section instead — that produces an `AKIA…` access key ID + a secret key, in the format S3 SDKs expect.

The two systems are independent: revoking a `psk_` key doesn't touch your `AKIA…` credentials, and vice versa.
