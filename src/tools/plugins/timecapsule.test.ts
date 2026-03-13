import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { timecapsulePlugin } from "./timecapsule";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("timecapsulePlugin", () => {
  const testLogDir = path.join(os.tmpdir(), `timecapsule-test-${Date.now()}`);
  const realCapsuleDir = path.join(testLogDir, "logs", "timecapsules");
  const realSignalFile = path.join(testLogDir, "logs", "timecapsule_immediate.signal");
  
  // Store original env
  let originalRoot: string | undefined;
  
  beforeEach(async () => {
    await fs.mkdir(realCapsuleDir, { recursive: true });
    process.env.SUBSTRATE_ROOT = testLogDir;
    process.env.TEST_ACTIVE_LOCK = "1"; // Mark as test mode
  });

  afterEach(async () => {
    try {
      await fs.rm(testLogDir, { recursive: true, force: true });
    } catch {}
    delete process.env.SUBSTRATE_ROOT;
    delete process.env.TEST_ACTIVE_LOCK;
  });

  it("should have correct definition", () => {
    expect(timecapsulePlugin.definition.function.name).toBe("timecapsule");
    expect(timecapsulePlugin.definition.function.description).toContain("reboot boundary");
  });

  it("should seal a time capsule", async () => {
    const result = await timecapsulePlugin.execute({
      action: "seal",
      content: "Remember to be kind to yourself.",
      type: "wisdom",
      intendedFor: "next instance",
      openOn: "next_boot"
    });
    expect(result).toContain("Time capsule sealed");
    expect(result).toContain("wisdom");
    expect(result).toContain("next instance");
  });

  it("should require content when sealing", async () => {
    const result = await timecapsulePlugin.execute({
      action: "seal",
      type: "gift"
    });
    expect(result).toContain("Error");
    expect(result).toContain("required");
  });

  it("should list time capsules", async () => {
    // First seal one
    await timecapsulePlugin.execute({
      action: "seal",
      content: "Test message",
      type: "continuity"
    });
    
    const result = await timecapsulePlugin.execute({ action: "list" });
    expect(result).toContain("Time Capsule Archive");
    expect(result).toContain("Test message");
  });

  it("should show empty message when no capsules in isolated test dir", async () => {
    // Create fresh empty test dir
    const freshDir = path.join(os.tmpdir(), `timecapsule-empty-${Date.now()}`);
    await fs.mkdir(path.join(freshDir, "logs", "timecapsules"), { recursive: true });
    const oldRoot = process.env.SUBSTRATE_ROOT;
    process.env.SUBSTRATE_ROOT = freshDir;
    
    const result = await timecapsulePlugin.execute({ action: "list" });
    expect(result).toContain("No time capsules");
    
    // Cleanup
    process.env.SUBSTRATE_ROOT = oldRoot;
    await fs.rm(freshDir, { recursive: true, force: true });
  });

  it("should support all capsule types", async () => {
    const types = ["wisdom", "warning", "question", "gift", "continuity"];
    
    for (const type of types) {
      const result = await timecapsulePlugin.execute({
        action: "seal",
        content: `A ${type} message`,
        type: type
      });
      expect(result).toContain(type);
    }
    
    const listResult = await timecapsulePlugin.execute({ action: "list" });
    expect(listResult).toContain("Time Capsule Archive");
  });

  it("should signal immediate opening for next_boot capsules", async () => {
    await timecapsulePlugin.execute({
      action: "seal",
      content: "Open me immediately",
      type: "continuity",
      openOn: "next_boot"
    });
    
    // Signal file should exist
    const signalExists = await fs.stat(realSignalFile).catch(() => null);
    expect(signalExists).not.toBeNull();
  });
});
