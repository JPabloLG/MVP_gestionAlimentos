import { describe, it, expect } from "vitest";
import { formatClock, parseStepMinutes } from "../cooking";
import { recipes } from "@/data/recipes";

describe("cooking", () => {
  it("parses step minutes", () => {
    expect(parseStepMinutes("Cocinar por 5-6 minutos por lado")).toBe(6);
    expect(parseStepMinutes("Hornear 20 min")).toBe(20);
    expect(parseStepMinutes("Saltear por un minuto.")).toBe(1);
    expect(parseStepMinutes("Cocinar 1 hora")).toBe(60);
    expect(parseStepMinutes("Servir caliente.")).toBeNull();
  });

  it("never crashes on real recipe steps", () => {
    for (const r of recipes) for (const s of r.steps) {
      const m = parseStepMinutes(s);
      expect(m === null || m > 0).toBe(true);
    }
  });

  it("formats clock", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(125)).toBe("02:05");
    expect(formatClock(59.2)).toBe("01:00");
    expect(formatClock(3725)).toBe("1:02:05");
    expect(formatClock(-4)).toBe("00:00");
  });
});
