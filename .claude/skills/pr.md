# PR Workflow

Handles GitHub pull request workflows for this project using `gh` CLI.

## Authorship prefix

Always prefix all PR descriptions and review comments with `[Claude Agent]` on the first line so the author can distinguish your content from their own.

## Open a PR

When the user says "open a PR", "create a PR", or similar:

1. Check for uncommitted changes with `git status`. If any exist, run `git add .` and commit with a descriptive message derived from the diff -- do not ask the user for a message. This same behavior applies when the user says "commit your work so far".
2. Push the current branch to origin with `-u` if not already tracking.
3. Run `git log main..HEAD` and `git diff main...HEAD` to understand all changes.
4. Derive a concise PR title (under 70 chars) and a body using this template:

```
[Claude Agent]

### Description

<summary of changes in paragraph form>

### Key changes

- <bullet list of meaningful changes; omit trivial ones only for large PRs>

### Considerations (if relevant)

<tradeoffs and pros/cons of approaches taken -- omit section if nothing notable>

### Not in scope (if relevant)

- <related things that were intentionally left out -- omit section if nothing notable>
```

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

When writing GDScript, follow these conventions:
- **Never use inner enums as parameter type hints.** GDScript inner enums are not reliable as type hints in all Godot 4.x versions. Use `int` for enum-valued parameters (e.g. `func _earn(currency: int, amount: float)`, not `func _earn(currency: Currency, amount: float)`).
- **Never alias autoload singletons to local variables.** `var gs = GameState` adds noise without benefit since autoloads are already short global names. Use `GameState` directly.

Always fetch the PR diff first with `gh pr diff`. When re-reviewing a PR (a review has already been posted), first delete all your stale comments with `gh api --method DELETE repos/{owner}/{repo}/pulls/comments/{comment_id}` before posting the new review, unless the user says otherwise. Then post a review using `gh api` to submit inline comments alongside an overall summary body. Use this approach:

```bash
gh api repos/{owner}/{repo}/pulls/{pr}/reviews \
  --method POST \
  --field commit_id="{head_sha}" \
  --field body="[Claude Agent] <overall summary>" \
  --field event="COMMENT" \
  --field "comments[][path]"="src/foo.gd" \
  --field "comments[][position]"=<diff_position> \
  --field "comments[][body]"="<inline comment>"
```

`position` is the line number within the diff hunk (1-indexed from the first `@@` line of that file's diff). Get the head SHA from `gh pr view {pr} --json headRefOid -q .headRefOid`.

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