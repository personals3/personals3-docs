---
title: Versioning and trash
---

Two safety nets — they complement each other.

## Trash

Every "delete" goes to trash by default. Trashed files:

- Still count toward your quota (they're still on disk)
- Stay for **30 days** then disappear permanently
- Can be restored with one click

Three ways:

```bash
# Dashboard — sidebar → Trash → click "Restore" on a row
# CLI
ps3 trash list                       # see what's in trash
ps3 trash restore my-bucket/file.pdf
ps3 trash purge my-bucket/file.pdf   # permanent
# API
GET    /api/trash                              # list
POST   /api/trash/{bucket}/{key}?restore       # restore
DELETE /api/trash/{bucket}/{key}               # purge now
```

To skip trash entirely on delete: `?purge=true` on the delete call (CLI: `ps3 rm --purge`).

## Versioning

Off by default. Turn on per-bucket:

```bash
curl -X PATCH "$HOST/api/my-bucket" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"versioning": true}'
```

(Or in the dashboard: bucket page → settings.)

While versioning is on:

- Overwriting a key snapshots the old data into a `versions/{id}` slot
- Deleting writes a delete-marker but keeps the data
- You can browse + restore any previous version

```bash
# List versions for a key
curl "$HOST/api/my-bucket/file.pdf?versions" \
  -H "Authorization: Bearer $TOKEN"

# Restore a specific version into the "current" slot
curl -X POST "$HOST/api/my-bucket/file.pdf?restore&versionId=$VID" \
  -H "Authorization: Bearer $TOKEN"

# Delete one specific version forever
curl -X DELETE "$HOST/api/my-bucket/file.pdf?versionId=$VID" \
  -H "Authorization: Bearer $TOKEN"
```

In the dashboard, click a file → **Versions** to see the history with timestamps + sizes; one click per restore.

### Caveat

Versioning doubles (or more) your storage usage when files change often. Old versions count toward your quota. Use versioning where it matters (documents, source) and leave it off where it doesn't (transient logs, archives).
