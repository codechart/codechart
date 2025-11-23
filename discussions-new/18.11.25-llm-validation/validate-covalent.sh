#!/bin/bash

# Usage: ./validate-covalent.sh <json-file> [project-root]
# Example: ./validate-covalent.sh diagram.cochart.json /path/to/project

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <json-file> [project-root]"
    exit 1
fi

JSON_FILE="$1"
PROJECT_ROOT="${2:-.}"

if [ ! -f "$JSON_FILE" ]; then
    echo "❌ JSON file not found: $JSON_FILE"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT" ]; then
    echo "❌ Project root not found: $PROJECT_ROOT"
    exit 1
fi

echo "🔍 Validating diagram: $JSON_FILE"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

ERRORS=0
CHECKED=0

# Simple JSON parser using grep/sed approach
parse_json() {
    # Get line numbers for each object start (lines with "id":)
    local tmp_ids="/tmp/cochart_ids_$$.txt"
    grep -n '"id"[[:space:]]*:' "$JSON_FILE" | cut -d: -f1 > "$tmp_ids"

    # Process each node
    while IFS= read -r line_num; do
        # Find the end of this object (next line with "id": or end of file)
        local next_line=$(awk -v curr="$line_num" 'NR>curr && /"id"[[:space:]]*:/ {print NR; exit}' "$JSON_FILE")
        if [ -z "$next_line" ]; then
            next_line=$(wc -l < "$JSON_FILE")
        fi
        next_line=$((next_line - 1))

        # Extract the object
        local node=$(sed -n "${line_num},${next_line}p" "$JSON_FILE" | tr '\n' ' ')

        # Skip TODO nodes
        if echo "$node" | grep -q '"type"[[:space:]]*:[[:space:]]*"todo"'; then
            continue
        fi

        # Extract fields using grep and sed
        local id=$(echo "$node" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p')
        local label=$(echo "$node" | sed -n 's/.*"label"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
        local filePath=$(echo "$node" | sed -n 's/.*"filePath"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
        local lineNumber=$(echo "$node" | sed -n 's/.*"lineNumber"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p')

        # Extract lineContent - match from "lineContent": " to the next ", (field end)
        local lineContent=$(echo "$node" | sed -n 's/.*"lineContent"[[:space:]]*:[[:space:]]*"\([^"]*\)"[[:space:]]*,.*$/\1/p')

        # Skip if missing required fields
        if [ -z "$filePath" ] || [ -z "$lineNumber" ] || [ -z "$lineContent" ]; then
            continue
        fi

        local FULL_PATH="$PROJECT_ROOT/$filePath"
        CHECKED=$((CHECKED + 1))

        # Check file exists
        if [ ! -f "$FULL_PATH" ]; then
            echo "❌ Node $id: File not found"
            echo "   Path: $filePath"
            echo "   Label: $label"
            ERRORS=$((ERRORS + 1))
            continue
        fi

        # Check line exists
        local TOTAL_LINES=$(wc -l < "$FULL_PATH")
        if [ "$lineNumber" -gt "$TOTAL_LINES" ]; then
            echo "❌ Node $id: Line $lineNumber exceeds file length ($TOTAL_LINES lines)"
            echo "   File: $filePath"
            echo "   Label: $label"
            ERRORS=$((ERRORS + 1))
            continue
        fi

        # Get actual line content (trimmed)
        local ACTUAL_LINE=$(sed -n "${lineNumber}p" "$FULL_PATH" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        local EXPECTED_LINE=$(echo "$lineContent" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

        # Compare content
        if [ "$ACTUAL_LINE" != "$EXPECTED_LINE" ]; then
            echo "❌ Node $id: Line content mismatch at line $lineNumber"
            echo "   File: $filePath"
            echo "   Label: $label"
            echo "   Expected: $EXPECTED_LINE"
            echo "   Actual:   $ACTUAL_LINE"
            ERRORS=$((ERRORS + 1))
            continue
        fi

        echo "✅ Node $id: $filePath:$lineNumber"
    done < "$tmp_ids"

    # Clean up
    rm -f "$tmp_ids"
}

# Run the parser
parse_json

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation complete"
echo "   Checked: $CHECKED CODE nodes"
echo "   Errors:  $ERRORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -gt 0 ]; then
    exit 1
fi

exit 0