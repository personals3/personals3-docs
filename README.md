# personals3-docs

User-facing docs for [PersonalS3](https://personals3.tech).

Deployed at **<https://developers.personals3.tech>** via Cloudflare Pages.

Built with [Astro Starlight](https://starlight.astro.build).

## Local development

```bash
npm install
npm run dev      # local preview at http://localhost:4321
```

## Content

All documentation lives under `src/content/docs/`. Each file is plain
markdown with Starlight frontmatter (just a `title:` is required).

Adding a new page:

1. Create `src/content/docs/<section>/<page>.md` with `--- title: My Page ---`
2. Reference it from the sidebar in `astro.config.mjs`
3. `git push` — Cloudflare Pages auto-deploys

## License

MIT — see [LICENSE](./LICENSE).
