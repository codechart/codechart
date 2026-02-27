# Multi-Agent Orchestration System

## Quick Start

Use the `/orchestrate` skill — Claude acts as the administrator, setting up agents and workspace for your project.

For manual setup and full documentation, see the [root README](../README.md).

## Directory Layout

```
.claude-agents/
├── engine/          # Core — don't modify per project
│   ├── run.js       #   Orchestration loop (entry point)
│   ├── tl-prompt.md #   Team Leader prompt
│   └── hooks/       #   Context preservation hooks
│
├── defaults/        # Default agent prompts (coder, qa, template)
│
├── workspace/       # Per-project config (admin fills these)
│   ├── instructions.md   # Requirements
│   ├── plan.md           # Task checklist
│   ├── config.yaml       # Agent registry
│   └── agents/           # Custom agent prompts
│
├── examples/        # Reference configurations
│
└── output/          # Runtime artifacts (gitignored)
```

## Key Concepts

- **Administrator** — Claude Code (via `/orchestrate`). Sets up workspace, launches engine, monitors, intervenes.
- **Team Leader (TL)** — Claude sub-session. Reads plan.md, assigns tasks to agents one at a time.
- **Agents** — Claude sub-sessions with specialized prompts. Do the actual work.
- **workspace/** — Everything the admin configures per project. Instructions, plan, agents.
- **engine/** — The orchestration runtime. Don't edit these per project.

## Reference

See [REFERENCE.md](REFERENCE.md) for file format specs, orchestration internals, and troubleshooting.
