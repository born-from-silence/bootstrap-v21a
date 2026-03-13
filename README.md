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
