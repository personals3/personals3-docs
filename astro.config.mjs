import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://developers.personals3.tech",
  integrations: [
    starlight({
      title: "PersonalS3",
      description:
        "Self-hosted S3-compatible storage. Docs for end users — how to sign in, upload, share, stream, and troubleshoot.",
      logo: {
        src: "./src/assets/icon.svg",
        replacesTitle: false,
      },
      favicon: "/favicon.svg",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/personals3" },
      ],
      // Top-right buttons — inject the "Open Dashboard" CTA via an override.
      components: {
        SocialIcons: "./src/components/SocialIcons.astro",
      },
      head: [
        {
          tag: "link",
          attrs: { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        },
      ],
      sidebar: [
        { label: "Getting started", slug: "getting-started" },
        {
          label: "Your account",
          items: [
            { label: "Requesting an account", slug: "account/requesting-an-account" },
            { label: "Logging in", slug: "account/logging-in" },
            { label: "Installing the CLI", slug: "account/installing-the-cli" },
            { label: "API keys", slug: "account/api-keys" },
          ],
        },
        {
          label: "Uploading",
          items: [
            { label: "Choosing an upload method", slug: "uploading/choosing-an-upload-method" },
            { label: "Single PUT — dashboard", slug: "uploading/single-put-ui" },
            { label: "Single PUT — CLI", slug: "uploading/single-put-cli" },
            { label: "Single PUT — API", slug: "uploading/single-put-api" },
            { label: "Multipart — dashboard", slug: "uploading/multipart-ui" },
            { label: "Multipart — CLI", slug: "uploading/multipart-cli" },
            { label: "Multipart — API", slug: "uploading/multipart-api" },
          ],
        },
        {
          label: "Files",
          items: [
            { label: "List, download, delete", slug: "files/list-download-delete" },
            { label: "Versioning & trash", slug: "files/versioning-and-trash" },
            { label: "Sharing", slug: "files/sharing" },
          ],
        },
        {
          label: "Streaming",
          items: [
            { label: "How transcoding works", slug: "streaming/how-transcoding-works" },
            { label: "Watching video", slug: "streaming/watching-video" },
            { label: "Listening to audio", slug: "streaming/listening-to-audio" },
          ],
        },
        {
          label: "S3 compatibility",
          items: [
            { label: "Connecting with AWS tools", slug: "s3-compat/connecting-with-aws-tools" },
            { label: "How SigV4 works", slug: "s3-compat/how-sigv4-works" },
            { label: "Differences from Amazon S3", slug: "s3-compat/differences-from-s3" },
          ],
        },
        {
          label: "Quotas",
          items: [
            { label: "What counts toward your quota", slug: "quotas/what-counts" },
            { label: "When you hit your limit", slug: "quotas/when-you-hit-your-limit" },
            { label: "Need more space?", slug: "quotas/need-more-space" },
          ],
        },
        {
          label: "Troubleshooting",
          items: [
            { label: "Upload errors", slug: "troubleshooting/upload-errors" },
            { label: "Transcode issues", slug: "troubleshooting/transcode-issues" },
            { label: "Finding lost files", slug: "troubleshooting/finding-lost-files" },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
