import { describe, expect, it } from "vitest";
import { buildLesson, nodePath, treeStats } from "./bPlusTreeLesson";
import {
  simulateBPlusTree,
  treeToLevels,
  type BPlusTreeNode,
} from "./bPlusTreeSimulator";

describe("B+ Tree teaching frames", () => {
  it("exposes overflow before splitting, preserving earlier snapshots and node identity", () => {
    const frames = buildLesson([10, 20, 30, 40], 3);
    const overflow = frames.find(
      (f) => f.operation === 4 && f.phase === "insert",
    )!;
    const split = frames.find((f) => f.phase === "split")!;
    expect(treeToLevels(overflow.tree)).toEqual([[[10, 20, 30, 40]]]);
    expect(treeToLevels(split.tree)).toEqual([
      [[30]],
      [
        [10, 20],
        [30, 40],
      ],
    ]);
    expect(frames[0].tree.keys).toEqual([]);
    expect(split.tree.kind).toBe("internal");
    if (split.tree.kind === "internal")
      expect(split.tree.children[0].id).toBe(overflow.tree.id);
    expect(treeStats(split.tree)).toEqual({
      height: 2,
      leaves: 2,
      keys: 4,
      nodes: 3,
    });
  });
  it("skips duplicate writes without a false insertion or split", () => {
    const frames = buildLesson([10, 20, 30, 20], 3);
    const duplicateFrames = frames.filter((f) => f.operation === 4);
    expect(duplicateFrames.map((f) => f.phase)).toEqual(["locate", "done"]);
    expect(duplicateFrames.at(-1)?.title).toBe("跳过重复键 20");
    expect(treeStats(duplicateFrames.at(-1)!.tree).keys).toBe(3);
  });
  it("routes equality right and reaches the correct leaf for missing keys", () => {
    const tree = buildLesson([10, 20, 30, 40], 3).at(-1)!.tree;
    expect(nodePath(tree, 30).at(-1)?.keys).toEqual([30, 40]);
    expect(nodePath(tree, 25).at(-1)?.keys).toEqual([10, 20]);
  });
  it("changes the teaching outcome when capacity changes", () => {
    expect(
      buildLesson([10, 20, 30, 40], 4).some((f) => f.phase === "split"),
    ).toBe(false);
    expect(
      buildLesson([10, 20, 30, 40], 3).some((f) => f.phase === "split"),
    ).toBe(true);
  });
  it("is deterministic including all snapshot identifiers", () => {
    const input = [45, 12, 78, 23, 56, 8, 34, 67];
    expect(buildLesson(input, 3)).toEqual(buildLesson(input, 3));
  });
  it.each([2, 3, 4, 5])(
    "maintains B+ Tree invariants across cascading splits at capacity %i",
    (capacity) => {
      const input = [
        45, 12, 78, 23, 56, 8, 34, 67, 90, 2, 3, 4, 5, 6, 7, 15, 18, 22, 27, 29,
        60, 62, 70, 80,
      ];
      const frames = buildLesson(input, capacity);
      for (const frame of frames.filter((f) => f.phase === "done")) {
        const leafDepths: number[] = [];
        const keys: number[] = [];
        const ids = new Set<string>();
        const minimum = (node: BPlusTreeNode): number =>
          node.kind === "leaf" ? node.keys[0] : minimum(node.children[0]);
        function verify(node: BPlusTreeNode, depth: number) {
          expect(ids.has(node.id)).toBe(false);
          ids.add(node.id);
          expect(node.keys).toEqual([...node.keys].sort((a, b) => a - b));
          expect(node.keys.length).toBeLessThanOrEqual(capacity);
          if (node.kind === "leaf") {
            leafDepths.push(depth);
            keys.push(...node.keys);
          } else {
            expect(node.children).toHaveLength(node.keys.length + 1);
            expect(node.keys).toEqual(node.children.slice(1).map(minimum));
            node.children.forEach((child) => verify(child, depth + 1));
          }
        }
        verify(frame.tree, 0);
        expect(new Set(leafDepths).size).toBe(1);
        expect(keys).toEqual(
          input.slice(0, frame.operation).sort((a, b) => a - b),
        );
        expect(treeToLevels(frame.tree)).toEqual(
          treeToLevels(
            simulateBPlusTree(input.slice(0, frame.operation), {
              maxLeafKeys: capacity,
              maxInternalKeys: capacity,
            }).finalTree,
          ),
        );
      }
    },
  );
});
