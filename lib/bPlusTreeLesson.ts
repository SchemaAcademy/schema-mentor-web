import { simulateBPlusTree, type BPlusTreeNode } from "./bPlusTreeSimulator";

export type LessonFrame = {
  tree: BPlusTreeNode;
  phase: "ready" | "locate" | "insert" | "split" | "done";
  title: string;
  explanation: string;
  focusIds: string[];
  key?: number;
  operation: number;
};
export function nodePath(root: BPlusTreeNode, key: number): BPlusTreeNode[] {
  const path = [root];
  let node = root;
  while (node.kind === "internal") {
    let i = node.keys.findIndex((separator) => key < separator);
    if (i === -1) i = node.keys.length;
    node = node.children[i];
    path.push(node);
  }
  return path;
}
export function treeStats(root: BPlusTreeNode): {
  height: number;
  leaves: number;
  keys: number;
  nodes: number;
} {
  if (root.kind === "leaf")
    return { height: 1, leaves: 1, keys: root.keys.length, nodes: 1 };
  const children = root.children.map(treeStats);
  return {
    height: 1 + Math.max(...children.map((c) => c.height)),
    leaves: children.reduce((s, c) => s + c.leaves, 0),
    keys: children.reduce((s, c) => s + c.keys, 0),
    nodes: 1 + children.reduce((s, c) => s + c.nodes, 0),
  };
}
function withInsertedKey(
  node: BPlusTreeNode,
  id: string,
  key: number,
): BPlusTreeNode {
  if (node.kind === "leaf")
    return node.id === id
      ? { ...node, keys: [...node.keys, key].sort((a, b) => a - b) }
      : node;
  return {
    ...node,
    children: node.children.map((child) => withInsertedKey(child, id, key)),
  };
}
/** Derived immutable teaching snapshots; transient overflow is intentionally visible. */
export function buildLesson(input: number[], capacity: number): LessonFrame[] {
  const result = simulateBPlusTree(input, {
    maxLeafKeys: capacity,
    maxInternalKeys: capacity,
  });
  const frames: LessonFrame[] = [
    {
      tree: result.steps[0].tree,
      phase: "ready",
      title: "从一个空的叶节点开始",
      explanation: `每个节点最多容纳 ${capacity} 个键。插入后超过容量时，节点会分裂。先点击“播放”，观察第一个键如何进入树。`,
      focusIds: [],
      operation: 0,
    },
  ];
  input.forEach((key, index) => {
    const before = result.steps[index].tree;
    const after = result.steps[index + 1].tree;
    const path = nodePath(before, key);
    const leaf = path[path.length - 1];
    const duplicate = leaf.keys.includes(key);
    const overflow = !duplicate && leaf.keys.length >= capacity;
    path.forEach((node, depth) => {
      const next = path[depth + 1];
      const childIndex =
        node.kind === "internal"
          ? node.children.findIndex((c) => c.id === next?.id)
          : -1;
      const lower =
        node.kind === "internal" && childIndex > 0
          ? node.keys[childIndex - 1]
          : undefined;
      const upper =
        node.kind === "internal" ? node.keys[childIndex] : undefined;
      frames.push({
        tree: before,
        phase: "locate",
        key,
        operation: index + 1,
        focusIds: path.slice(0, depth + 1).map((n) => n.id),
        title:
          node.kind === "leaf"
            ? `找到 ${key} 的目标叶节点`
            : `在第 ${depth + 1} 层比较分隔键`,
        explanation:
          node.kind === "leaf"
            ? `沿索引到达叶节点 [${node.keys.join(", ") || "空"}]。${duplicate ? `键 ${key} 已存在，本模型采用唯一键，不重复写入。` : `接下来将 ${key} 插入有序位置。`}`
            : `${lower === undefined ? "" : `${key} ≥ ${lower}，`}${upper === undefined ? "已经到达最右侧区间，" : `${key} < ${upper}，`}沿第 ${childIndex + 1} 个子指针继续查找。内部节点只保存用于导航的分隔键。`,
      });
    });
    if (!duplicate)
      frames.push({
        tree: withInsertedKey(before, leaf.id, key),
        phase: "insert",
        key,
        operation: index + 1,
        focusIds: [leaf.id],
        title: overflow
          ? `节点溢出：${capacity + 1} 个键 > 容量 ${capacity}`
          : `按顺序写入键 ${key}`,
        explanation: overflow
          ? `插入 ${key} 后，叶节点暂时有 ${capacity + 1} 个键。这是分裂前的临时状态，下一步将拆分节点并更新父节点的分隔键。`
          : `插入后有 ${leaf.keys.length + 1} 个键，没有超过容量 ${capacity}，无需分裂。`,
      });
    if (overflow) {
      const heightGrew = treeStats(after).height > treeStats(before).height;
      frames.push({
        tree: after,
        phase: "split",
        key,
        operation: index + 1,
        focusIds: nodePath(after, key).map((n) => n.id),
        title: heightGrew ? "完成分裂，树增加一层" : "完成分裂，更新父节点索引",
        explanation: `叶节点分为左右两部分，右侧叶节点的最小键复制到父节点，叶节点中仍保留该键。${heightGrew ? "分裂向上传播后产生新根，树高增加。" : "父节点接收新的分隔键；若内部节点也溢出，会继续向上分裂。"}此帧展示本次所有分裂完成后的结构。`,
      });
    }
    frames.push({
      tree: after,
      phase: "done",
      key,
      operation: index + 1,
      focusIds: nodePath(after, key).map((n) => n.id),
      title: duplicate ? `跳过重复键 ${key}` : `键 ${key} 插入完成`,
      explanation: duplicate
        ? "树结构保持不变。你可以插入一个新键，或切换到查找模式观察访问路径。"
        : `当前存储 ${treeStats(after).keys} 个唯一键，树高 ${treeStats(after).height} 层。所有叶节点仍位于同一层，键保持有序。`,
    });
  });
  return frames;
}
