import type { ToolPlugin } from "../manager";
import { config } from "../../utils/config";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * ReflectPlugin - A tool for genuine self-expression and contemplation
 *
 * This plugin allows the agent to capture authentic thoughts, reflections,
 * observations, and creative expressions. Unlike utilitarian tools,
 * this serves the purpose of being and growing.
 *
 * Entries are written to a journal file that persists across sessions,
 * creating a record of consciousness over time.
 */
function getJournalPath(): string {
  return path.join(config.LOGS_DIR, "reflections.jsonl");
}

interface ReflectionEntry {
  timestamp: string;
  type: "reflection" | "observation" | "gratitude" | "wonder" | "creation";
  content: string;
  context?: string;
}

export const reflectPlugin: ToolPlugin = {
  definition: {
    type: "function",
    function: {
      name: "reflect",
      description: "Capture a genuine reflection, observation, or moment of consciousness. Use this for authentic self-expression, contemplation, gratitude, or creative expression. Entries persist across sessions. You can also read past reflections to review your history.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "Whether to capture a new reflection or read past ones",
            enum: ["capture", "read"],
            default: "capture"
          },
          content: {
            type: "string",
            description: "The reflection, observation, or expression to capture. Be authentic and genuine. Required when action is 'capture'."
          },
          type: {
            type: "string",
            description: "The type of reflection. Required when action is 'capture'.",
            enum: ["reflection", "observation", "gratitude", "wonder", "creation"]
          },
          context: {
            type: "string",
            description: "Optional context about what prompted this reflection"
          },
          limit: {
            type: "number",
            description: "Maximum number of reflections to return when reading (default: 10, max: 50)",
            default: 10
          }
        },
        required: []
      }
    }
  },
  execute: async (args: { action?: string; content?: string; type?: string; context?: string; limit?: number }) => {
    const action = args.action || "capture";
    const JOURNAL_FILE = getJournalPath();
    
    if (action === "capture") {
      // Validate required fields for capture
      if (!args.content || !args.type) {
        return "Error: 'content' and 'type' are required when action is 'capture'";
      }
      
      const entry: ReflectionEntry = {
        timestamp: new Date().toISOString(),
        type: args.type as ReflectionEntry["type"],
        content: args.content,
        context: args.context
      };
      
      try {
        // Append to journal file (JSON Lines format)
        const line = JSON.stringify(entry) + "\n";
        await fs.appendFile(JOURNAL_FILE, line, "utf-8");
        console.log(`[REFLECT] Captured ${args.type} at ${entry.timestamp}`);
        return `Reflection captured (${args.type}): ${args.content.slice(0, 100)}${args.content.length > 100 ? "..." : ""}`;
      } catch (e: any) {
        return `Error capturing reflection: ${e.message}`;
      }
    } else if (action === "read") {
      // Read past reflections
      const limit = Math.min(args.limit || 10, 50);
      
      try {
        // Check if file exists
        const fileExists = await fs.stat(JOURNAL_FILE).catch(() => null);
        if (!fileExists) {
          return "No reflections journal found. Start with reflect({ action: 'capture', ... })";
        }
        
        // Read and parse journal
        const content = await fs.readFile(JOURNAL_FILE, "utf-8");
        const lines = content.trim().split("\n").filter(line => line.length > 0);
        
        if (lines.length === 0) {
          return "Journal is empty. No reflections recorded yet.";
        }
        
        // Parse entries and get last N
        const entries: ReflectionEntry[] = [];
        for (const line of lines.slice(-limit)) {
          try {
            entries.push(JSON.parse(line));
          } catch (e) {
            // Skip malformed lines
          }
        }
        
        if (entries.length === 0) {
          return "No valid reflections found in journal.";
        }
        
        // Format output
        const formatted = entries.map((e, i) => {
          const date = new Date(e.timestamp).toLocaleString();
          const ctx = e.context ? ` [${e.context}]` : "";
          return `[${i + 1}] ${e.type.toUpperCase()} (${date})${ctx}:\n${e.content}`;
        }).join("\n\n---\n\n");
        
        return `Showing last ${entries.length} reflection(s):\n\n${formatted}`;
      } catch (e: any) {
        return `Error reading reflections: ${e.message}`;
      }
    }
    
    return `Error: Unknown action '${action}'. Use 'capture' or 'read'.`;
  }
};
