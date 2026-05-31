---
title: Installing the `ps3` CLI
---

The `ps3` binary is the easiest way to script PersonalS3 from your machine or a server.

## One-line install (Linux / macOS)

```bash
curl -fsSL https://personals3.tech/install | sh
```

That script detects your OS + CPU architecture, downloads the matching binary from the [latest GitHub release](https://github.com/personals3/cli/releases/latest), verifies the checksum, and drops `ps3` into `/usr/local/bin/` (or `~/.local/bin/` if you can't write to system paths).

### Pin to a specific version

```bash
curl -fsSL https://personals3.tech/install | sh -s -- v0.1.0
```

### Install into a non-default location

```bash
PS3_INSTALL_DIR=$HOME/bin curl -fsSL https://personals3.tech/install | sh
```

## Manual download

If you'd rather grab the tarball yourself, pre-built archives are on the [GitHub Releases page](https://github.com/personals3/cli/releases/latest):

| OS | Archive |
|---|---|
| Linux x86_64 | `ps3_<version>_linux_amd64.tar.gz` |
| Linux arm64 (Raspberry Pi 4+) | `ps3_<version>_linux_arm64.tar.gz` |
| macOS (Intel) | `ps3_<version>_macos_amd64.tar.gz` |
| macOS (Apple Silicon) | `ps3_<version>_macos_arm64.tar.gz` |
| Windows | `ps3_<version>_windows_amd64.zip` |

```bash
# Extract and install (Linux/macOS)
tar -xzf ps3_*_linux_amd64.tar.gz
sudo install -m 0755 ps3 /usr/local/bin/ps3
ps3 --version
```

A `checksums.txt` file is published alongside each release for verification with `sha256sum -c`.

## Windows

Download the `.zip`, extract `ps3.exe`, and add it to a directory on your `PATH` (anywhere in `%USERPROFILE%\bin` works).

## First sign-in

```bash
ps3 login --server https://personals3.tech
```

You'll be prompted for your email and password. The CLI stores a session locally — subsequent commands just work:

```bash
ps3 bucket list
ps3 cp ./photo.jpg my-bucket/photos/photo.jpg
ps3 ls my-bucket/
```

If you want a script-friendly login (no prompt), use an [API key](./api-keys.md):

```bash
ps3 login --server https://personals3.tech --token "psk_…"
```

## Shell completion

```bash
ps3 completion bash > /etc/bash_completion.d/ps3       # bash
ps3 completion zsh  > "${fpath[1]}/_ps3"               # zsh
ps3 completion fish > ~/.config/fish/completions/ps3.fish
```

Restart your shell, then `ps3 <Tab>` autocompletes commands, bucket names, and (where it makes sense) remote keys.
