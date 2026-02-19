# Multi-Agent Orchestration System

## You SHOULD Use This System

When you are given a complex task to implement, **this system is how you execute it**. Do not create your own task management, todo lists, or ad-hoc workflows. This `.claude-agents/` directory is your orchestration framework.

**Your workflow:**

1. Understand the task (read the user's request)
2. Decide which agents you need (see existing agents, create new ones)
3. Write `instructions.md` and `plan.md`
4. Run `node .claude-agents/run.js`

## Step-by-Step Usage

### Step 1: Decide Which Agents You Need

Look at the example agents in `agents/`:

| Agent | Prompt File | Role |
|-------|-------------|------|
| *(check agents/ directory)* | `agents/*.md` | *(read each file)* |

Read `config.yaml` to see what's already registered. Study the existing agent prompts — they show the pattern.

### Step 2: Create Missing Agents

You should set the agents according to the task:

1. **Copy the template:** `agents/_template.md` → `agents/your-agent.md`
2. **Follow the pattern** of existing agents (e.g., `agents/mcp-builder.md`, `agents/tester.md`) — they show how to customize the template for a real role
3. **Register in `config.yaml`:**
   ```yaml
   your-agent:
     prompt: agents/your-agent.md
     description: What this agent does
   ```

Every agent prompt MUST include:
- Role description and what tasks it handles
- Logging rules (append to `output/log.md` with `[agent-name]` prefix)
- `DONE:` signal format
- Working directory (real codebase or `output/project/`)
- Context the agent needs (key files, schemas, environment info)

### Step 3: Write instructions.md

Replace the contents of `.claude-agents/instructions.md` with a natural language description of the task. Include architecture, key files, constraints — everything the TL needs to coordinate work.

### Step 4: Write plan.md

Write a checklist of tasks in `.claude-agents/plan.md`:

```markdown
- [ ] [agent-name] Task description
- [ ] [agent-name] Another task
```

**Syntax:**
- `- [ ]` = pending, `- [x]` = done
- `[agent-name]` = which agent runs this (must match config.yaml)
- Use `**PHASE GATE**` lines to pause between phases for user approval

You can also leave plan.md minimal and let TL decompose instructions.md into tasks automatically.

### Step 5: Run

```bash
node .claude-agents/run.js
```

Monitor progress:
```bash
tail -f .claude-agents/output/log.md
```

## Directory Structure

```
.claude-agents/
├── README.md                 # This file — how to use the system
├── REFERENCE.md              # Architecture, file formats, troubleshooting
├── run.js                    # Orchestration entry point
├── tl-prompt.md              # Team Leader system prompt
├── config.yaml               # Agent registry (maps names → prompt files)
├── claude_settings.json      # Settings to merge into .claude/settings.json
├── plan.md                   # Task checklist
├── instructions.md           # Natural language task description
├── agents/
│   ├── _template.md          # START HERE when creating a new agent
│   ├── mcp-builder.md        # Example: MCP server developer
│   ├── tester.md             # Example: Testing specialist
│   ├── setup.md              # Example: Preparation/fixup agent
│   └── ui-dev.md             # Example: Angular UI developer
├── hooks/
│   ├── pre-compact.sh        # Saves context before compaction
│   └── post-compact.sh       # Restores context after compaction
└── output/
    ├── project/              # Agent working directory (if not using real codebase)
    ├── agent-outputs/        # Full JSON output from each agent run
    ├── log.md                # Execution log with timestamps
    ├── status.json           # Current agent status
    ├── sessions.json         # Persisted session IDs
    └── summaries/            # Context summaries (created during compaction)
```

## Key Concepts

- **TL (Team Leader):** Reads plan.md, assigns tasks to agents one at a time, monitors progress. Defined in `tl-prompt.md`.
- **Agents:** Independent Claude sessions, each with a specialized prompt. They work, log progress, and signal `DONE:`.
- **plan.md:** The shared task checklist. TL assigns from it, agents mark tasks `[x]` when done.
- **config.yaml:** Maps agent names to their prompt files. TL reads this to discover available agents.
- **output/log.md:** All agents and TL append timestamped entries here. This is how progress is tracked.

## For Full Details

See `REFERENCE.md` for:
- Detailed file format specifications
- Orchestration loop internals
- Context preservation (compaction hooks)
- Architecture decisions
- Troubleshooting
- Integration guide for other repos
