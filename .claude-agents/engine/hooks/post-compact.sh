#!/bin/bash
# Post-compaction hook - restores session summary after context compaction
# Triggered by SessionStart hook with "compact" matcher in .claude/settings.json

set -e

# Read input JSON from stdin
INPUT=$(cat)

# Extract session_id from input JSON
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

# Validate we have session_id
if [ -z "$SESSION_ID" ]; then
  # No session_id provided, exit cleanly
  exit 0
fi

# Look for saved summary from pre-compact hook
SUMMARIES_DIR="$CLAUDE_PROJECT_DIR/.claude-agents/output/summaries"
SUMMARY_FILE="$SUMMARIES_DIR/${SESSION_ID}.md"

# If summary file exists, return it as additionalContext
if [ -f "$SUMMARY_FILE" ]; then
  SUMMARY=$(cat "$SUMMARY_FILE")

  # Escape the summary for JSON and return as additionalContext
  # This context will be prepended to the agent's session after compaction
  ESCAPED_SUMMARY=$(echo "$SUMMARY" | jq -Rs .)

  echo "{\"additionalContext\": $ESCAPED_SUMMARY}"

  # Log that we restored context
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [post-compact-hook] Restored context for session $SESSION_ID" >> "$CLAUDE_PROJECT_DIR/.claude-agents/output/log.md" 2>/dev/null || true
else
  # No summary file found, return empty result
  exit 0
fi
