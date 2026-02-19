# Reference — Multi-Agent Orchestration System

Detailed specifications for file formats, orchestration internals, and troubleshooting. For usage instructions, see `README.md`.

## File Format Specifications

### instructions.md

Natural language description of the project. Can be freeform — TL decomposes it intelligently.

**Example:**
```markdown
# Calculator Module

Build a Node.js calculator with:
- Arithmetic functions (add, subtract, multiply, divide)
- Error handling for division by zero
- Comprehensive Jest tests covering edge cases
```

### plan.md

Checklist of tasks. Initially empty or minimal; TL populates it with structured tasks.

**Format:**
```markdown
- [ ] [coder] Initialize Node.js project
- [ ] [qa] Create test suite
- [ ] [coder] Fix bugs (if any)
```

**Syntax:**
- `- [ ]` = uncompleted task
- `- [x]` = completed task
- `[agent-name]` = which agent should do this (must match config.yaml)

Agents automatically mark tasks `[x]` when they finish.

### config.yaml

Registry of available agents. Maps agent names to prompt file paths.

**Example:**
```yaml
agents:
  coder:
    prompt: agents/coder.md
    description: Implements features
  qa:
    prompt: agents/qa.md
    description: Tests and validates
```

### Agent Prompts (agents/*.md)

System prompts that define agent behavior. Each agent has rules for:
- Working directory (real codebase or `output/project/`)
- File I/O and code creation
- Logging format (e.g., `[agent-name] DONE: message`)
- Error handling and validation

**Key Rules for All Agents:**
1. Log progress to `output/log.md` with format: `[agent-name] message`
2. Signal completion with: `[agent-name] DONE: summary`
3. Read plan.md to find assigned tasks
4. Update plan.md by marking tasks `[x]` when done

### log.md

Timestamped execution log. Automatically appended by agents and run.js.

**Format:**
```
[2026-02-05T12:20:16Z] [coder] Initialized Node.js project
[2026-02-05T12:21:10Z] [tl] coder finished 'Initialize project'
[2026-02-05T12:22:00Z] [tl] Assigning 'Create calculator.js' to coder
```

### output/status.json & sessions.json

**status.json:** Tracks current agent state (running/idle, current task, timestamp)

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

1. **Startup:** run.js creates a TL session, passes system prompt + initial message
2. **TL Initialization:** TL reads instructions.md and plan.md
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
   - Marks task `[x]` in plan.md
   - Outputs `DONE: summary` message
5. **TL Monitoring:** Every 30 seconds (TICK_INTERVAL)
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
   - Calls `hooks/pre-compact.sh`
   - Reads session_id from input JSON
   - Summarizes transcript via `claude --print`
   - Saves summary to `.claude-agents/output/summaries/{session_id}.md`

2. **Compaction:** Claude Code compacts context internally

3. **PostCompact Hook** (SessionStart matcher):
   - Calls `hooks/post-compact.sh`
   - Retrieves saved summary
   - Returns summary as `additionalContext` for agent resumption
   - Agent resumes with full context

This ensures agents can continue long-running tasks without duplicating work.

## Testing History

### Phase 2: Functional Testing
Run the calculator module test case:
```bash
node .claude-agents/run.js
```
**Result:** All 9 tasks completed, calculator module built with Jest tests

### Phase 4: Extended Task List
Test with longer task list (20+ tasks) to verify:
- Agent coordination over extended periods
- Session persistence
- Log tracking
- Performance optimization suggestions

**Result:** All 21 tasks completed, 164 tests passing (328% of target)

### Phase 6: Bug Discovery and Fix Cycle
Test realistic QA workflow with intentional bug injection:
```bash
# Instructions specify intentional bug in round() function
# QA discovers bug with failing tests
# Coder fixes the issue
# QA validates fix with full test suite
```
**Result:** 17 tasks completed, 114 tests passing, realistic bug discovery→fix→validation cycle confirmed

## Troubleshooting

### Agent Session Times Out
- Check `.claude/settings.json` hooks configuration
- Verify `$CLAUDE_PROJECT_DIR` is set correctly
- Run.js may timeout if agent tasks are very long (>10 min)

### Tasks Not Being Marked Complete
- Ensure agent outputs `[agent-name] DONE: message` format
- Check output/log.md for agent completion messages
- TL detects completion via these logs

### Compaction Doesn't Restore Context
- Verify pre/post-compact hooks are configured in `.claude/settings.json`
- Check that `/compact` was actually triggered in IDE
- Summaries should appear in `output/summaries/`

### Orchestration Doesn't Exit
- Check plan.md has all tasks marked `[x]`
- Verify log.md contains TL's final "COMPLETE" message
- run.js checks both conditions; if either fails, loop continues

## Architecture Decisions

**Why File-Based?**
- No external database needed
- Git-trackable for transparency
- Humans can read/edit plan.md, log.md, status.json
- Easy to debug by inspecting output/

**Why 30-Second Ticks?**
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
2. Merge `.claude-agents/claude_settings.json` into your `.claude/settings.json`:
   - Add the **permissions** (`Bash(claude *)`, `Bash(node *)`, `Bash(npm *)`) to your existing `permissions.allow` array
   - Add the **hooks** (`PreCompact`, `SessionStart` with compact matcher) to your existing `hooks` object
   - Hooks are optional but recommended for long task lists (~50+ items)
3. Add `.claude-agents/output/` to your `.gitignore`
4. Edit `.claude-agents/instructions.md` with your project requirements
5. Run: `node .claude-agents/run.js`

**Version:** 1.1
**Last Updated:** 2026-02-19
