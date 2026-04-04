---
name: git-branch-cleanup
description: Clean up merged or deleted PR branches locally and on origin, and sync remote-tracking refs so git dag stops showing stale branches. Use when deleting feature branches, pruning old origin refs, or checking whether a pull request is updated after new commits.
---

# Git Branch Cleanup

Use this skill as the short reference for PR updates, branch deletion, and local remote sync.

## Quick Rules

- If your branch is ahead of `origin/<same-branch>`, run `git push` to update the existing PR.
- To remove a branch everywhere: delete it on `origin`, delete it locally, then run `git fetch --prune`.
- Draft-vs-ready PR state is handled in GitHub UI, not `git`.
- Quote unusual branch names in shell commands.

## Steps

### 1. Check whether the PR needs a push

What it does: confirms whether local commits are still only on your machine.

```bash
git status
git branch -vv
git push
```

### 2. Mark a draft PR ready for review

What it does: changes PR review state in GitHub.

Example:

- Open the PR on GitHub.
- Stay on `Conversation`.
- Click `Ready for review`.

### 3. Delete the remote branch

What it does: removes the branch from GitHub so it no longer exists on `origin`.

```bash
git checkout main
git push origin --delete cursor/website-frontend-redesign-7b7a
git push origin --delete 'cursor/-bc-a45584d5-7d2e-47f5-badf-aeb6e9262f45-1fa9'
```

### 4. Delete the local branch

What it does: removes your local branch reference after you switch away from it.

```bash
git branch -d cursor/website-frontend-redesign-7b7a
git branch -D cursor/website-frontend-redesign-e92d
git branch -d 'cursor/-bc-a45584d5-7d2e-47f5-badf-aeb6e9262f45-1fa9'
```

### 5. Prune stale `origin/*` refs

What it does: removes old remote-tracking refs so `git dag` no longer shows deleted remote branches.

```bash
git fetch --prune
# same as:
git fetch -p
```

## Recommended Order

```bash
git checkout main
git push origin --delete <branch>
git branch -d <branch>
git fetch --prune
```

Use `git branch -D <branch>` instead of `-d` if Git says the branch is not fully merged and you still want it gone.

## Notes

- Deleting `origin/<branch>` can affect an open PR that targets that branch, so merge or close the PR first if needed.
- Use `git branch -r` to list remote branch names before deleting them.
