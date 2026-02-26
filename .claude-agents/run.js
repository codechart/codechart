const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TICK_INTERVAL = 5000;
const SCRIPT_DIR = __dirname;
const ROOT = path.join(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(SCRIPT_DIR, 'output');
const SESSIONS_PATH = path.join(OUTPUT_DIR, 'sessions.json');
const LOG_PATH = path.join(OUTPUT_DIR, 'log.md');
const STATUS_PATH = path.join(OUTPUT_DIR, 'status.json');
const PLAN_PATH = path.join(SCRIPT_DIR, 'plan.md');
const CONFIG_PATH = path.join(SCRIPT_DIR, 'config.yaml');
const TL_PROMPT_PATH = path.join(SCRIPT_DIR, 'tl-prompt.md');

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  console.log(logEntry);
  fs.appendFileSync(LOG_PATH, logEntry + '\n');
}

function readJSON(filePath, defaultValue = {}) {
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return defaultValue;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function readSessions() {
  return readJSON(SESSIONS_PATH, {});
}

function writeSessions(sessions) {
  writeJSON(SESSIONS_PATH, sessions);
}

function readStatus() {
  return readJSON(STATUS_PATH, {});
}

function writeStatus(status) {
  writeJSON(STATUS_PATH, status);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runClaude(args) {
  try {
    const output = execSync(`claude ${args}`, {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 600000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return output;
  } catch (error) {
    console.error(`[run.js] Claude error: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('[run.js] Starting orchestration...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Initialize log file
  if (!fs.existsSync(LOG_PATH)) {
    fs.writeFileSync(LOG_PATH, '');
  }

  log('[run.js] Orchestration started');

  let sessions = readSessions();

  // Create TL session on first run
  if (!sessions.tl) {
    log('[run.js] Creating TL session...');

    if (!fs.existsSync(TL_PROMPT_PATH)) {
      console.error('[run.js] Error: tl-prompt.md not found');
      process.exit(1);
    }

    const systemPrompt = fs.readFileSync(TL_PROMPT_PATH, 'utf8')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');

    try {
      const output = runClaude(
        `--print --output-format json --system-prompt "${systemPrompt}" "You are the Team Leader. Read .claude-agents/plan.md. If it has no checklist, decompose it into tasks first. Then begin orchestration."`
      );
      const result = JSON.parse(output);
      sessions.tl = result.session_id;
      writeSessions(sessions);
      log(`[run.js] TL session created: ${sessions.tl}`);
    } catch (e) {
      log(`[run.js] Failed to create TL session: ${e.message}`);
      process.exit(1);
    }
  }

  const tlSessionId = sessions.tl;

  // Main orchestration loop
  while (true) {
    await sleep(TICK_INTERVAL);

    // Preserve TL session ID
    const current = readSessions();
    if (!current.tl || current.tl !== tlSessionId) {
      current.tl = tlSessionId;
      writeSessions(current);
    }

    log('[run.js] Tick: resuming TL...');
    try {
      const output = runClaude(
        `--print --output-format json --resume "${tlSessionId}" "tick: check agent status and decide next action"`
      );
      try {
        const result = JSON.parse(output);
        log(`[run.js] TL response: ${result.result.substring(0, 100)}`);
      } catch {
        log(`[run.js] TL output: ${output.substring(0, 100)}`);
      }
    } catch (err) {
      log(`[run.js] Error during tick: ${err.message.substring(0, 100)}`);
    }

    // Check if TL wrote COMPLETE
    const logContent = fs.readFileSync(LOG_PATH, 'utf8');
    if (logContent.match(/\[tl\].*COMPLETE/i) || logContent.match(/ALL TASKS COMPLETE/i)) {
      log('[run.js] COMPLETE detected. Orchestration finished.');
      break;
    }

    // Check if all PLAN.md tasks are done
    const plan = fs.readFileSync(PLAN_PATH, 'utf8');
    if (plan.includes('- [ ]') === false && plan.includes('- [x]')) {
      log('[run.js] All PLAN.md tasks checked. Orchestration finished.');
      break;
    }
  }

  log('[run.js] Orchestration complete');
}

main().catch(err => {
  console.error('[run.js] Fatal error:', err);
  process.exit(1);
});
