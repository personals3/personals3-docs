---
title: Installing the `ps3` CLI
---

## Do you need the CLI?

**Most people don't.** If you just want to upload, share, and stream files,
the [dashboard at personals3.tech](https://personals3.tech) does everything
in your browser — sign in, drag-and-drop, listen to music, watch videos.

**Install the CLI if** you want to:

- Automate uploads or downloads from a script
- Move large folders in one command
- Use PersonalS3 as a backend from your own app or another tool

If none of that applies, you can skip this page entirely.

---

## Install (macOS / Linux)

Copy this into your terminal:

```bash
curl -fsSL https://personals3.tech/install | sh
```

That's it. The installer figures out your OS + CPU, downloads the right
binary, and puts it where it needs to go. When it finishes, run:

```bash
ps3 --version
```

You should see something like `ps3 v0.1.0`.

> Don't have a terminal? On macOS press `⌘ + Space` and type "Terminal".
> On Linux, search the apps menu for "Terminal" or "Konsole".

## Install (Windows)

1. Open the [latest release](https://github.com/personals3/cli/releases/latest)
2. Download `ps3_<version>_windows_amd64.zip`
3. Extract it — you'll get a file called `ps3.exe`
4. Move `ps3.exe` to a folder on your `PATH` (or just to your Desktop and run it from there)
5. Open a Command Prompt or PowerShell and run `ps3 --version`

## Sign in

Once `ps3` is installed:

```bash
ps3 login --server https://personals3.tech
```

It'll ask for your email and password — same ones you use on the website.
After that, `ps3` remembers you on this machine for 24 hours.

## A first command to try

```bash
ps3 bucket list             # see your buckets
ps3 cp ./photo.jpg my-bucket/photos/photo.jpg
ps3 ls my-bucket/
```

If you hit any errors, the [Troubleshooting](../troubleshooting/upload-errors)
page covers the common ones.

---

## Advanced installs

<details>
<summary>Pin to a specific version</summary>

```bash
curl -fsSL https://personals3.tech/install | sh -s -- v0.1.0
```

</details>

<details>
<summary>Install into a folder you can write to (no sudo)</summary>

```bash
PS3_INSTALL_DIR=$HOME/bin curl -fsSL https://personals3.tech/install | sh
```

Then make sure `$HOME/bin` is on your `PATH`.

</details>

<details>
<summary>Manual tarball download</summary>

Pre-built archives are on the [GitHub Releases page](https://github.com/personals3/cli/releases/latest):

| OS | Archive |
|---|---|
| Linux x86_64 | `ps3_<version>_linux_amd64.tar.gz` |
| Linux arm64 (Raspberry Pi 4+) | `ps3_<version>_linux_arm64.tar.gz` |
| macOS (Intel) | `ps3_<version>_macos_amd64.tar.gz` |
| macOS (Apple Silicon) | `ps3_<version>_macos_arm64.tar.gz` |
| Windows | `ps3_<version>_windows_amd64.zip` |

```bash
tar -xzf ps3_*_linux_amd64.tar.gz
sudo install -m 0755 ps3 /usr/local/bin/ps3
```

A `checksums.txt` is published alongside each release for verification with `sha256sum -c`.

</details>

<details>
<summary>Use an API key instead of a password (for scripts)</summary>

Create an [API key](./api-keys) in the dashboard, then:

```bash
ps3 login --server https://personals3.tech --token "psk_…"
```

</details>

<details>
<summary>Shell tab-completion</summary>

```bash
ps3 completion bash > /etc/bash_completion.d/ps3
ps3 completion zsh  > "${fpath[1]}/_ps3"
ps3 completion fish > ~/.config/fish/completions/ps3.fish
```

Restart your shell — then `ps3 <Tab>` autocompletes commands and bucket names.

</details>
