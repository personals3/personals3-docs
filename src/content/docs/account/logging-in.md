---
title: Logging in
---

You sign in three ways depending on what you're doing:

| Where | Use this credential |
|---|---|
| **Dashboard** | Email + password (plus a 2FA code if you've turned that on) |
| **`ps3` CLI** | Email + password the first time → CLI stores a long-lived session token |
| **HTTP API / external tools** | An [API key](./api-keys) (recommended) or an AWS-style access key + secret |

## In the dashboard

Open the dashboard URL, click **Sign in**, enter your email and password, and you're in.

If you've turned on two-factor authentication, the page will prompt for the 6-digit code from your authenticator app right after your password is accepted.

## With the CLI

```bash
ps3 login --server https://personals3.tech
# you'll be prompted for email + password interactively
```

The CLI stores a session under `~/.ps3/config.json` and reuses it for every subsequent command. To switch accounts:

```bash
ps3 logout
ps3 login --server https://personals3.tech
```

## I forgot my password

From the sign-in page, click **Forgot?**. Enter your email — if it's on file, we email a one-time 6-digit code (valid 10 minutes). Use that code plus a new password on the "I have the code" page.

If the email never arrives, contact the administrator of this instance — they can issue a fresh code.

## Two-factor authentication (2FA)

We strongly recommend turning on 2FA from the **Security** page once you're signed in:

1. Scan the QR with your authenticator app (1Password, Aegis, Google Authenticator, etc.).
2. Confirm with a code.
3. **Save the recovery codes** somewhere safe — they're your only path back in if you lose your authenticator.
