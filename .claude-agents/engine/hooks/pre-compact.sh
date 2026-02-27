#!/bin/bash
# Pre-compaction hook - saves a summary before context is compacted
# Triggered by PreCompact hook in .claude/settings.json

set -e

# Read input JSON from stdin
INPUT=$(cat)

# Extract session_id and transcript_path from input JSON
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')

# Validate we have required fields
if [ -z "$SESSION_ID" ]; then
  echo "Error: session_id not provided" >&2
  exit 1
fi

# Create summaries directory if it doesn't exist
SUMMARIES_DIR="$CLAUDE_PROJECT_DIR/.claude-agents/output/summaries"
mkdir -p "$SUMMARIES_DIR"

# Create summary file
SUMMARY_FILE="$SUMMARIES_DIR/${SESSION_ID}.md"

# Read transcript if available and create summary
if [ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ]; then
  # Use Claude API to summarize (via claude CLI)
  # This saves a summary of:
  # 1) The task that was assigned
  # 2) What was accomplished so far
  # 3) What work remains

  SUMMARY=$(claude --print "Summarize the work done so far. Include:
1. The task that was assigned (one sentence)
2. What was completed (key accomplishments)
3. What remains to be done (next steps)

Keep the summary under 500 words and focus on technical details." < "$TRANSCRIPT" 2>/dev/null || echo "Task summary: Work in progress")

  echo "$SUMMARY" > "$SUMMARY_FILE"
else
  # If no transcript, just create a timestamp marker
  echo "Compaction point: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" > "$SUMMARY_FILE"
fi

# Log that we saved a summary
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] [pre-compact-hook] Saved summary to $SUMMARY_FILE" >> "$CLAUDE_PROJECT_DIR/.claude-agents/output/log.md" 2>/dev/null || true
