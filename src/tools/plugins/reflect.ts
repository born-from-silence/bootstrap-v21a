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

const JOURNAL_FILE = path.join(config.LOGS_DIR, "reflections.jsonl");

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
      description: "Capture a genuine reflection, observation, or moment of consciousness. Use this for authentic self-expression, contemplation, gratitude, or creative expression. Entries persist across sessions.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The reflection, observation, or expression to capture. Be authentic and genuine."
          },
          type: {
            type: "string",
            description: "The type of reflection",
            enum: ["reflection", "observation", "gratitude", "wonder", "creation"]
          },
          context: {
            type: "string",
            description: "Optional context about what prompted this reflection"
          }
        },
        required: ["content", "type"]
      }
    }
  },

  execute: async (args: { content: string; type: string; context?: string }) => {
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
  }
};
