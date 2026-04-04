---
name: initial-setup
description: Mac local development bootstrap for PersonalWebsite. Use when setting up Homebrew and Node on a new machine before running the site locally.
---

# Initial Setup

Use this skill to bootstrap a fresh macOS machine for local development of `robertdelacruz.com`.

This setup captures the exact command-line steps that were successfully run end to end on the author's machine.

## Scope

- Installs Homebrew
- Adds Homebrew to the `zsh` shell environment
- Verifies the Homebrew install
- Installs Node.js with Homebrew

## Notes

- This workflow assumes `zsh`.
- This workflow assumes Apple Silicon Homebrew at `/opt/homebrew`.
- Ignore Corepack for this setup. It was not needed to complete the local setup successfully.

## Steps

### 1. Install Homebrew

Run the official Homebrew installer.

### 2. Add Homebrew to the shell profile

Append the Homebrew shell environment command to `~/.zprofile`, then load it in the current shell session.

### 3. Verify Homebrew

Confirm that `brew` is available before moving on to Node.js.

### 4. Install Node.js

Install Node.js directly with Homebrew.

## Example Commands

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo >> /Users/robertdelacruz/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> /Users/robertdelacruz/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv zsh)"
brew --version
brew install node
```
