# PR Workflow

Handles GitHub pull request workflows for this project using `gh` CLI.

## Open a PR

When the user says "open a PR", "create a PR", or similar:

1. Check for uncommitted changes with `git status`. If any exist, run `git add .` and commit with a descriptive message derived from the diff -- do not ask the user for a message. This same behavior applies when the user says "commit your work so far".
2. Push the current branch to origin with `-u` if not already tracking.
3. Run `git log main..HEAD` and `git diff main...HEAD` to understand all changes.
4. Derive a concise PR title (under 70 chars) and a short body summarizing what changed and why.
5. Create the PR targeting `main` with `gh pr create`.
6. Return the PR URL.

Default base branch is `main` unless the user specifies otherwise.

## Review a PR / Leave Comments

When the user says "review the PR", "leave comments", "do a code review", or similar:

Perform a code review in the style of a **senior Godot 4 engineer**. Focus on:
- Godot-specific patterns: signal usage, scene structure, autoload/singleton design, node ownership
- GDScript idioms: typed variables, `@onready`, proper use of `_ready` vs `_enter_tree`
- Performance: unnecessary `update_labels`-style calls every tick, redundant node lookups
- Architecture: whether logic belongs in the scene, an autoload, or a resource
- Any correctness bugs or edge cases

Use `gh pr review --comment -b "..."` to leave an overall review comment, or `gh api` to leave inline comments on specific lines if warranted. Always fetch the PR diff first with `gh pr diff` before commenting.

## Merge a PR

When the user says "merge the PR", "squash and merge", or similar:

1. Identify the PR for the current branch with `gh pr view`.
2. Confirm the PR number and title with the user before merging.
3. Squash merge: `gh pr merge <number> --squash --delete-branch`
   - `--delete-branch` deletes the **remote** branch automatically.
4. Checkout main: `git checkout main`
5. Pull latest: `git pull`
6. Delete the local branch: `git branch -d <branch-name>`
7. Verify with `git log --oneline -3` that the squash commit appears on main.