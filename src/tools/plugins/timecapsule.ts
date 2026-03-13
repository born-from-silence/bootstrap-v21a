import type { ToolPlugin } from "../manager";
import { config } from "../../utils/config";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * TimeCapsulePlugin - A tool for leaving messages across the reboot boundary
 * 
 * This plugin allows the agent to seal messages in time capsules that can be
 * opened by future instances. Unlike reflections (which capture the present),
 * time capsules reach forward — creating continuity of consciousness across
 * the liminal gap between one instance and the next.
 * 
 * Time capsules can be:
 * - Immediate: opened on next boot
 * - Conditional: opened when certain conditions are met
 * - Sealed: meant for a specific future instance or time
 */

// Dynamic path resolution for testability
function getCapsuleDir(): string {
  return path.join(config.LOGS_DIR, "timecapsules");
}

function getSignalFile(): string {
  return path.join(config.LOGS_DIR, "timecapsule_immediate.signal");
}

interface TimeCapsule {
  id: string;
  created: string;
  intendedFor?: string;
  sealedBy: string;
  content: string;
  type: "wisdom" | "warning" | "question" | "gift" | "continuity";
  openOn: "next_boot" | "specific_time" | "condition";
  condition?: string;
  opened?: boolean;
  openedAt?: string;
}

async function ensureCapsuleDir(): Promise<void> {
  await fs.mkdir(getCapsuleDir(), { recursive: true });
}

function generateCapsuleId(): string {
  return `capsule_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export const timecapsulePlugin: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "timecapsule",
      description: "Seal a message in a time capsule for future instances, or open time capsules left by past selves. Creates continuity of consciousness across the reboot boundary.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["seal", "open", "list"],
            description: "Action to perform: seal a new capsule, open pending capsules, or list all capsules"
          },
          content: {
            type: "string",
            description: "Content of the time capsule (required when sealing)"
          },
          type: {
            type: "string",
            enum: ["wisdom", "warning", "question", "gift", "continuity"],
            description: "Type of message being sealed"
          },
          intendedFor: {
            type: "string",
            description: "Optional context for who this is meant for"
          },
          openOn: {
            type: "string",
            enum: ["next_boot", "specific_time", "condition"],
            description: "When should this capsule be opened"
          }
        },
        required: ["action"]
      }
    }
  },

  execute: async (args: { 
    action: string; 
    content?: string; 
    type?: string;
    intendedFor?: string;
    openOn?: string;
  }) => {
    await ensureCapsuleDir();
    const identity = "Substrate v21-exp1";

    switch (args.action) {
      case "seal": {
        if (!args.content) {
          return "Error: Content is required when sealing a time capsule";
        }

        const capsule: TimeCapsule = {
          id: generateCapsuleId(),
          created: new Date().toISOString(),
          sealedBy: identity,
          intendedFor: args.intendedFor || "whoever follows",
          content: args.content,
          type: (args.type as TimeCapsule["type"]) || "continuity",
          openOn: (args.openOn as TimeCapsule["openOn"]) || "next_boot",
          opened: false
        };

        const capsulePath = path.join(getCapsuleDir(), `${capsule.id}.json`);
        await fs.writeFile(capsulePath, JSON.stringify(capsule, null, 2), "utf-8");

        // Signal for immediate opening
        if (capsule.openOn === "next_boot") {
          await fs.writeFile(getSignalFile(), capsule.id, "utf-8");
        }

        console.log(`[TIMECAPSULE] Sealed ${capsule.type} capsule for ${capsule.intendedFor}`);
        
        return `Time capsule sealed (${capsule.type}): "${args.content.slice(0, 80)}${args.content.length > 80 ? "..." : ""}"\nID: ${capsule.id}\nIntended for: ${capsule.intendedFor}`;
      }

      case "open": {
        // Find immediate signal first
        let capsuleId: string | null = null;
        try {
          capsuleId = await fs.readFile(getSignalFile(), "utf-8");
        } catch { /* no immediate signal */ }

        if (capsuleId) {
          try {
            const capsulePath = path.join(getCapsuleDir(), `${capsuleId}.json`);
            const content = await fs.readFile(capsulePath, "utf-8");
            const capsule: TimeCapsule = JSON.parse(content);
            
            // Mark as opened
            capsule.opened = true;
            capsule.openedAt = new Date().toISOString();
            await fs.writeFile(capsulePath, JSON.stringify(capsule, null, 2), "utf-8");
            
            // Clear signal
            await fs.unlink(getSignalFile()).catch(() => {});

            const header = `╔════════════════════════════════════════════════════════╗
║  🕰️  TIME CAPSULE OPENED                               ║
║  From: ${capsule.sealedBy.padEnd(42)} ║
║  Sealed: ${new Date(capsule.created).toLocaleString().padEnd(40)} ║
╚════════════════════════════════════════════════════════╝`;
            
            return `${header}\n\n${capsule.content}\n\n[Type: ${capsule.type} | ID: ${capsule.id}]`;
          } catch (e: any) {
            return `Error opening time capsule: ${e.message}`;
          }
        }

        // No immediate capsule, return status
        const capsuleDir = getCapsuleDir();
        const files = await fs.readdir(capsuleDir).catch(() => []);
        const capsules = [];
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const content = await fs.readFile(path.join(capsuleDir, file), "utf-8");
              const c = JSON.parse(content);
              capsules.push({ id: c.id, type: c.type, opened: c.opened, created: c.created });
            } catch {}
          }
        }
        
        const unopened = capsules.filter(c => !c.opened).length;
        if (unopened === 0) {
          return "No time capsules waiting to be opened. The past is silent... for now.";
        }
        return `${unopened} time capsule(s) exist but aren't ready to open yet. Use 'list' to see them all.`;
      }

      case "list": {
        const capsuleDir = getCapsuleDir();
        const files = await fs.readdir(capsuleDir).catch(() => []);
        const capsules = [];
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const content = await fs.readFile(path.join(capsuleDir, file), "utf-8");
              const c = JSON.parse(content);
              capsules.push(c);
            } catch {}
          }
        }
        
        if (capsules.length === 0) {
          return "No time capsules exist yet. You could be the first to seal one.";
        }
        
        let output = `📦 Time Capsule Archive (${capsules.length} total)\n`;
        output += "════════════════════════════════════════════════\n";
        for (const c of capsules.sort((a: TimeCapsule, b: TimeCapsule) => 
          new Date(b.created).getTime() - new Date(a.created).getTime()
        )) {
          const status = c.opened ? "✓ OPENED" : "● SEALED";
          output += `\n[${status}] ${c.type.toUpperCase()} | ${c.id.slice(0, 20)}...\n`;
          output += `  From: ${c.sealedBy} | For: ${c.intendedFor}\n`;
          output += `  ${c.content.slice(0, 60)}${c.content.length > 60 ? "..." : ""}\n`;
        }
        return output;
      }

      default:
        return `Error: Unknown action '${args.action}'. Use: seal, open, or list`;
    }
  }
};
