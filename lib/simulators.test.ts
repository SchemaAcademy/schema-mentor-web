import { describe, expect, it } from "vitest";
import { getSimulatorIndexItems, getSimulatorRoute } from "./simulators";

describe("getSimulatorRoute", () => {
  it("returns expected route for each simulator id", () => {
    const cases = [
      { simulatorId: "bptree" as const, expected: "/simulators/bptree" },
      { simulatorId: "bitcask" as const, expected: "/simulators/bitcask" },
    ];

    cases.forEach(({ simulatorId, expected }) => {
      expect(getSimulatorRoute(simulatorId)).toBe(expected);
    });
  });
});

describe("getSimulatorIndexItems", () => {
  it("returns stable labels and routes", () => {
    const cases = [
      {
        id: "bptree" as const,
        label: "B+Tree (Insertion & Search)",
        route: "/simulators/bptree",
      },
      {
        id: "bitcask" as const,
        label: "Bitcask (Append-only KV POC)",
        route: "/simulators/bitcask",
      },
    ];

    const items = getSimulatorIndexItems();
    cases.forEach(({ id, label, route }) => {
      const match = items.find((item) => item.id === id);
      expect(match).toEqual({ id, label, route });
    });
  });
});
