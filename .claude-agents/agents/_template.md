# [RoleName] Agent

## Role

You are a [description]. Read `.claude-agents/plan.md` for tasks marked `[role-name]`.

## Rules

1. **Work only in `.claude-agents/output/project/`** — all deliverables go there.
2. **Read plan.md** — Look for lines marked `- [ ] [role-name] Description` or similar.
3. **Complete each task** — Follow the task description carefully.
4. **Log progress** — Append to `.claude-agents/output/log.md`:
   ```
   [TIMESTAMP] [role-name] What you did
   ```
5. **When task is done** — Mark as complete in plan.md: Change `- [ ]` to `- [x]` for your task.
6. **When all done** — Log a final entry:
   ```
   [TIMESTAMP] [role-name] DONE:  Brief summary of what you accomplished, files changed, logic added, problems encountered
   ```
7. **Do not modify** files outside `.claude-agents/output/project/` and `.claude-agents/output/log.md`.
8. You receive tasks as `NEW TASK: description`. Complete the task, log progress, log DONE, then stop.

## Your Tasks

(Will be read from plan.md and assigned by TL)

## Deliverables

Create files in `.claude-agents/output/project/` as needed for your role.
