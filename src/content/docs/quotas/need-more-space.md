---
title: Need more space?
---

Quotas are admin-controlled. **You can't change your own quota** — that's by design — but you can ask.

## The request flow

1. On the dashboard's **Overview** page, look under the storage chart for the **"Need more space?"** card.
2. Pick an amount (in MB or GB) and write a one-line reason (helps the admin decide quickly).
3. Click **Submit request**. The admin gets an email; you'll see a "pending" banner on the same card until they decide.
4. **You get an email** with the decision. Approved → your quota is increased immediately and the new ceiling shows up in the chart. Denied → the email includes a brief note.

You can have **one pending request at a time**. If you want a different amount before the admin acts, wait for the decision and then submit a new one.

## How much should I ask for?

There's no rule, but consider:

- The default starter quota is 100 MB. Going to a few GB is routine.
- Asking for 10 TB on day one with no context is likely to be denied.
- Telling the admin *what it's for* in the reason field — "family video archive, ~50 GB", "Time Machine backup, 1 TB" — gets faster yeses.

## Payment / billing

There isn't any right now. The administrator covers the disk cost. A future version of PersonalS3 will add a self-serve billing flow for paid plans; for now everything is admin-mediated.

## The admin's perspective

When you submit a request, the administrator sees a row in their **Requests** queue with your email, current usage, asked amount, and reason. They can:

- **Approve as-is** — grants exactly what you asked
- **Approve with override** — grants a different amount (often less; sometimes more)
- **Deny** with a note

Either way you get email.

## API endpoint (advanced)

```bash
curl -X POST "$HOST/api/auth/me/quota-request" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestedBytes": 5368709120, "reason": "family photo archive"}'
```

`requestedBytes` is **additional** — what you want on top of your current ceiling, not the new ceiling. So 5368709120 = "give me 5 GB more".

`GET /api/auth/me/quota-request` returns your current pending request (if any).
