# Reference — Multi-Agent Orchestration System

Detailed specifications for file formats, orchestration internals, and troubleshooting. For usage instructions, see `README.md`.

## File Format Specifications

### workspace/instructions.md

Natural language description of the project. Can be freeform — TL decomposes it intelligently.

**Example:**
```markdown
# Calculator Module

Build a Node.js calculator with:
- Arithmetic functions (add, subtract, multiply, divide)
- Error handling for division by zero
- Comprehensive Jest tests covering edge cases
```

### workspace/plan.md

Checklist of tasks. Initially empty or minimal; TL populates it with structured tasks.

**Format:**
```markdown
- [ ] [coder] Initialize Node.js project
- [ ] [qa] Create test suite
- [ ] [coder] Fix bugs (if any)
--- PHASE GATE ---
- [ ] [coder] Next phase task
```

**Syntax:**
- `- [ ]` = uncompleted task
- `- [x]` = completed task
- `[agent-name]` = which agent should do this (must match config.yaml)
- `--- PHASE GATE ---` = pause execution for user approval

Agents automatically mark tasks `[x]` when they finish.

### workspace/config.yaml

Registry of available agents. Maps agent names to prompt file paths (relative to `.claude-agents/`).

**Example:**
```yaml
agents:
  coder:
    prompt: defaults/coder.md
    description: Implements features
  qa:
    prompt: defaults/qa.md
    description: Tests and validates
  custom-agent:
    prompt: workspace/agents/custom-agent.md
    description: Specialized role
```

### Agent Prompts (defaults/*.md, workspace/agents/*.md)

System prompts that define agent behavior. Each agent has rules for:
- Working directory (real codebase or `output/project/`)
- File I/O and code creation
- Logging format (e.g., `[agent-name] DONE: message`)
- Error handling and validation

**Key Rules for All Agents:**
1. Log progress to `output/log.md` with format: `[agent-name] message`
2. Signal completion with: `[agent-name] DONE: summary`
3. Do NOT modify `output/status.json` or `output/sessions.json` (TL handles these)
4. Receive tasks as `NEW TASK: description`. Complete, log DONE, then stop.

### output/log.md

Timestamped execution log. Automatically appended by agents and run.js.

**Format:**
```
[2026-02-05T12:20:16Z] [coder] Initialized Node.js project
[2026-02-05T12:21:10Z] [tl] coder finished 'Initialize project'
[2026-02-05T12:22:00Z] [tl] Assigning 'Create calculator.js' to coder
```

### output/status.json & sessions.json

**status.json:** Tracks current agent state (running/done, current task, timestamp)

**sessions.json:** Persists Claude session IDs so agents can resume work:
```json
{
  "tl": "9438f19d-4603-495a-b423-b9fcde07dbc8",
  "coder": "9a130436-37ee-480b-bd42-e67360f23e6b",
  "qa": "c4dcf0f1-b854-4437-9a82-ac7f0b2f89df"
}
```

## How It Works

### Orchestration Loop

1. **Startup:** `engine/run.js` creates a TL session, passes system prompt + initial message
2. **TL Initialization:** TL reads `workspace/instructions.md` and `workspace/plan.md`
   - If plan.md is empty/unstructured, TL decomposes it
   - Saves structured checklist back to plan.md
3. **Task Assignment:** TL reads plan.md for incomplete tasks
   - Finds next uncompleted task
   - Extracts `[agent-name]` to route it
   - Updates status.json with assignment
   - Creates new agent session if needed
   - Assigns task via agent's system prompt
4. **Agent Execution:** Agent session receives task
   - Works in designated directory
   - Creates/modifies files
   - Logs progress to output/log.md
   - Marks task `[x]` in workspace/plan.md
   - Outputs `DONE: summary` message
5. **TL Monitoring:** Every 5 seconds (TICK_INTERVAL)
   - run.js resumes TL session
   - TL checks agent status, reads log.md, updates status.json
   - Decides next action (assign more tasks or wait)
6. **Completion Detection:**
   - run.js checks if log.md contains "COMPLETE"
   - OR checks if plan.md has no remaining `- [ ]` tasks
   - Exits orchestration loop

### Context Preservation During Compaction

When a Claude Code session reaches token limits and you trigger `/compact`:

1. **PreCompact Hook** (`.claude/settings.json`):
   - Calls `engine/hooks/pre-compact.sh`
   - Reads session_id from input JSON
   - Summarizes transcript via `claude --print`
   - Saves summary to `output/summaries/{session_id}.md`

2. **Compaction:** Claude Code compacts context internally

3. **PostCompact Hook** (SessionStart matcher):
   - Calls `engine/hooks/post-compact.sh`
   - Retrieves saved summary
   - Returns summary as `additionalContext` for agent resumption
   - Agent resumes with full context

This ensures agents can continue long-running tasks without duplicating work.

## Testing History

| Phase | Tasks | Tests | What It Proved |
|-------|-------|-------|----------------|
| Phase 2 | 9 | 24 | Basic orchestration, happy-path development |
| Phase 4 | 21 | 164 | Extended task lists, 20+ functions, edge cases |
| Phase 6 | 17 | 114 | Bug discovery: QA finds bug, Coder fixes, zero regressions |

## Troubleshooting

### Agent Session Times Out
- Check `.claude/settings.json` hooks configuration
- Verify `$CLAUDE_PROJECT_DIR` is set correctly
- run.js may timeout if agent tasks are very long (>10 min)

### Tasks Not Being Marked Complete
- Ensure agent outputs `[agent-name] DONE: message` format
- Check output/log.md for agent completion messages
- TL detects completion via these logs

### Compaction Doesn't Restore Context
- Verify pre/post-compact hooks are configured in `.claude/settings.json`
- Check that `/compact` was actually triggered
- Summaries should appear in `output/summaries/`

### Orchestration Doesn't Exit
- Check workspace/plan.md has all tasks marked `[x]`
- Verify log.md contains TL's final "COMPLETE" message
- run.js checks both conditions; if either fails, loop continues

## Architecture Decisions

**Why File-Based?**
- No external database needed
- Git-trackable for transparency
- Humans can read/edit plan.md, log.md, status.json
- Easy to debug by inspecting output/

**Why 5-Second Ticks?**
- Balances responsiveness with API rate limits
- Allows agents time to complete and log
- Prevents busy-looping on empty tasks

**Why Separate Agent Sessions?**
- Agents maintain independent context
- TL can coordinate without merging contexts
- Easier to swap agents or debug individual failures
- Each agent has full transcript of their work

**Why Pre/Post Compact Hooks?**
- Context compaction is Claude Code's feature
- Hooks preserve key information (task list, decisions, progress)
- Agents resume without re-running completed work
- Enables arbitrary-length task sequences

## Integration Guide

### Using This System in Another Repo

1. Copy `.claude-agents/` to your repo
2. Copy `.claude/commands/orchestrate.md` to your repo's `.claude/commands/`
3. Merge `.claude-agents/claude_settings.json` into your `.claude/settings.json`:
   - Add the **permissions** (`Bash(claude *)`, `Bash(node *)`, `Bash(npm *)`) to your existing `permissions.allow` array
   - Add the **hooks** (`PreCompact`, `SessionStart` with compact matcher) to your existing `hooks` object
   - Hooks are optional but recommended for long task lists (~50+ items)
4. Add `.claude-agents/output/` to your `.gitignore`
5. Use `/orchestrate` to have Claude set up workspace for your project
6. Or manually edit `workspace/instructions.md` and run: `node .claude-agents/engine/run.js`

**Version:** 2.0
**Last Updated:** 2026-02-25
