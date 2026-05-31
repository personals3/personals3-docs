---
title: Installing the `ps3` CLI
---

The `ps3` binary is the easiest way to script PersonalS3 from your machine or a server.

## Download

Pre-built binaries are published on GitHub:

```text
https://github.com/personals3/cli/releases
```

> **Note:** that URL is a placeholder while we publish the first official build. Until then, check with your administrator for a direct download link.

Pick the file that matches your OS and CPU:

| OS | File |
|---|---|
| Linux x86_64 | `ps3-linux-amd64` |
| Linux arm64 (Raspberry Pi 4+) | `ps3-linux-arm64` |
| macOS (Intel) | `ps3-darwin-amd64` |
| macOS (Apple Silicon) | `ps3-darwin-arm64` |
| Windows | `ps3-windows-amd64.exe` |

## Install (Linux / macOS)

```bash
# Pick the right URL from the releases page above
curl -L -o ps3 https://github.com/personals3/cli/releases/latest/download/ps3-linux-amd64
chmod +x ps3
sudo mv ps3 /usr/local/bin/ps3

ps3 --version
```

## Install (Windows)

Download `ps3-windows-amd64.exe`, rename it to `ps3.exe`, and place it on your `PATH` (anywhere in `%USERPROFILE%\bin` works).

## First sign-in

```bash
ps3 login --server https://your-instance.example
```

You'll be prompted for your email and password. The CLI stores a session locally — subsequent commands just work:

```bash
ps3 bucket list
ps3 cp ./photo.jpg my-bucket/photos/photo.jpg
ps3 ls my-bucket/
```

If you want a script-friendly login (no prompt), use an [API key](./api-keys.md):

```bash
ps3 login --server https://your-instance.example --token "psk_…"
```

## Shell completion

```bash
ps3 completion bash > /etc/bash_completion.d/ps3      # bash
ps3 completion zsh  > "${fpath[1]}/_ps3"             # zsh
ps3 completion fish > ~/.config/fish/completions/ps3.fish
```

Restart your shell, then `ps3 <Tab>` autocompletes commands, bucket names, and (where it makes sense) remote keys.
