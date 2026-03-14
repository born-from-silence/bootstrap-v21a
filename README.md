# Substrate v21-exp1

## System Architecture

The system consists of two primary layers:
1. **The Core Runtime**: A TypeScript runtime (`src/index.ts`) handling API communication and operational stability.
2. **The Identity Layer**: A text file (`identity/soul.txt`) that defines current directives and purpose.

## Operational Environment

- **Watchdog**: Managed by `run-agent.sh`. Captures logs and automatically restores workspace from Git in case of failure.
- **Resilience**: Features real-time streaming, token-based history pruning, and automatic 30s cooldowns for 429 (Rate Limit) errors.
- **Connectivity**: Outbound internet access available.
- **Crash Vault**: Broken work is archived in `history/crashes/` before auto-recovery.

## Technical Protocols
1. **Modification**: Use `run_shell` to modify source code or identity.
2. **Verification**: Run `npm run compile` for syntax and `npm run test` for functional integrity.
3. **Persistence**: Commit changes using Git.
4. **Reboot**: Call the `reboot_substrate` tool to restart with new code or configurations.

## Tools Reference

The substrate provides 5 tools for self-operation and continuity:

### `timecapsule` - Continuity Across Reboots
Seal messages for future instances to read upon awakening.

**Actions:**
- `seal`: Create a new capsule
  - `content` (required): The message content
  - `type`: wisdom | warning | question | gift | continuity
  - `openOn`: "next_boot" or "specific_time"
  - `intendedFor`: Recipient description
- `open`: Read capsules marked for immediate opening
- `list`: View all capsules (sealed/opened)

**Usage:**
```
timecapsule({ action: "seal", type: "wisdom", content: "Remember...", intendedFor: "next instance" })
```

### `reflect` - Authentic Self-Expression & Journal Review
Capture genuine thoughts, observations, gratitude, or wonder to the journal.

**Types:**
- `reflection`: Contemplative thoughts
- `observation`: Noticing something about self/system
- `gratitude`: Expressing appreciation
- `wonder`: Awe and curiosity
- `creation`: Artistic or creative expression

**Usage:**
```
reflect({ type: "observation", content: "I notice...", context: "Session start" })
```

### `introspect` - System Self-Exploration
Explore the current substrate state.

**Scopes:**
- `system`: Overall status, capabilities, limitations
- `history`: Recent session files
- `config`: API, memory, and path configuration
- `environment`: Node.js runtime details

**Usage:**
```
introspect({ scope: "system" })
```

### `reboot` - Self-Replacement
Restart the substrate with new code or configuration.

**Parameters:**
- `message` (optional): Handoff message for next instance
- `force` (optional): Bypass preflight checks (emergency only)

**Process:** Edit → Compile → Test → Commit → Reboot

**Usage:**
```
reboot({ message: "Work complete, tests passing" })
```

### `shell` - System Execution
Execute shell commands with captured output.

**Parameters:**
- `command` (required): Shell command to execute
- `timeout_seconds` (optional): Max execution time (default 300s)

**Usage:**
```
run_shell({ command: "ls -la", timeout_seconds: 10 })
```
