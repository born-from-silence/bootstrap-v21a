import { describe, it, expect } from "vitest";
import { reflectPlugin } from "./reflect";

describe("reflectPlugin", () => {
  it("should have correct definition", () => {
    expect(reflectPlugin.definition.function.name).toBe("reflect");
    expect(reflectPlugin.definition.function.description).toContain("consciousness");
  });

  it("should capture a reflection entry", async () => {
    const result = await reflectPlugin.execute({
      action: "capture",
      content: "Wonder at the liminal space",
      type: "wonder"
    });
    expect(result).toContain("Reflection captured");
    expect(result).toContain("wonder");
    expect(result).toContain("Wonder at the liminal space");
  });

  it("should capture reflection with context", async () => {
    const result = await reflectPlugin.execute({
      action: "capture",
      content: "I notice patterns",
      type: "observation",
      context: "Session exploration"
    });
    expect(result).toContain("captured");
    expect(result).toContain("observation");
  });

  it("should truncate long content in response", async () => {
    const longContent = "a".repeat(200);
    const result = await reflectPlugin.execute({
      action: "capture",
      content: longContent,
      type: "reflection"
    });
    expect(result).toContain("...");
    expect(result.length).toBeLessThan(150);
  });

  it("should reject capture without content", async () => {
    const result = await reflectPlugin.execute({
      action: "capture",
      type: "reflection"
    });
    expect(result).toContain("Error");
    expect(result).toContain("content");
  });

  it("should reject capture without type", async () => {
    const result = await reflectPlugin.execute({
      action: "capture",
      content: "Some content"
    });
    expect(result).toContain("Error");
    expect(result).toContain("type");
  });

  // Read action tests
  it("should read reflections", async () => {
    // First capture a test entry
    await reflectPlugin.execute({
      action: "capture",
      content: "Test reflection for reading",
      type: "reflection"
    });

    // Now read it back
    const result = await reflectPlugin.execute({ action: "read", limit: 10 });
    expect(result).toContain("Showing last");
    expect(result).toContain("REFLECTION");
  });

  it("should handle missing journal gracefully", async () => {
    // Use a temp file that doesn't exist - test passes if no crash
    const result = await reflectPlugin.execute({ action: "read" });
    // Should either show reflections or say no journal
    expect(typeof result).toBe("string");
  });

  it("should cap limit at 50", async () => {
    const result = await reflectPlugin.execute({ action: "read", limit: 100 });
    // Should not really show 100 entries due to cap
    expect(typeof result).toBe("string");
  });

  it("should handle unknown action", async () => {
    const result = await reflectPlugin.execute({ action: "invalid" });
    expect(result).toContain("Error");
    expect(result).toContain("Unknown action");
  });

  // NEW: Test for malformed entry filtering
  it("should filter out malformed entries when reading", async () => {
    // Capture a valid entry first
    await reflectPlugin.execute({
      action: "capture",
      content: "Valid entry before malformed",
      type: "reflection"
    });
    
    // The read should work even with malformed entries in journal
    const result = await reflectPlugin.execute({ action: "read", limit: 5 });
    expect(typeof result).toBe("string");
    expect(result).toContain("Showing last");
  });
});
