export type BPlusTreeNode = BPlusTreeLeafNode | BPlusTreeInternalNode;

export type BPlusTreeLeafNode = {
  id: string;
  kind: "leaf";
  keys: number[];
};

export type BPlusTreeInternalNode = {
  id: string;
  kind: "internal";
  keys: number[];
  children: BPlusTreeNode[];
};

export type BPlusTreeConfig = {
  maxLeafKeys: number;
  maxInternalKeys: number;
};

export type SimulationStep = {
  label: string;
  explanation: string;
  tree: BPlusTreeNode;
};

export type BPlusTreeSimulationResult = {
  finalTree: BPlusTreeNode;
  steps: SimulationStep[];
  uniqueKeys: number[];
};

type SplitResult = {
  promotedKey: number;
  rightNode: BPlusTreeNode;
};

type InsertResult = {
  node: BPlusTreeNode;
  split?: SplitResult;
  inserted: boolean;
};

let nodeIdCounter = 0;

function createLeaf(keys: number[]): BPlusTreeLeafNode {
  nodeIdCounter += 1;
  return {
    id: `leaf-${nodeIdCounter}`,
    kind: "leaf",
    keys: [...keys],
  };
}

function createInternal(
  keys: number[],
  children: BPlusTreeNode[],
): BPlusTreeInternalNode {
  nodeIdCounter += 1;
  return {
    id: `internal-${nodeIdCounter}`,
    kind: "internal",
    keys: [...keys],
    children: [...children],
  };
}

function cloneTree(node: BPlusTreeNode): BPlusTreeNode {
  if (node.kind === "leaf") {
    return {
      ...node,
      keys: [...node.keys],
    };
  }

  return {
    ...node,
    keys: [...node.keys],
    children: node.children.map(cloneTree),
  };
}

function insertIntoLeaf(
  leaf: BPlusTreeLeafNode,
  key: number,
  config: BPlusTreeConfig,
): InsertResult {
  if (leaf.keys.includes(key)) {
    return { node: leaf, inserted: false };
  }

  const nextKeys = [...leaf.keys, key].sort((a, b) => a - b);
  if (nextKeys.length <= config.maxLeafKeys) {
    return {
      node: createLeaf(nextKeys),
      inserted: true,
    };
  }

  const splitIndex = Math.ceil(nextKeys.length / 2);
  const leftKeys = nextKeys.slice(0, splitIndex);
  const rightKeys = nextKeys.slice(splitIndex);
  const leftLeaf = createLeaf(leftKeys);
  const rightLeaf = createLeaf(rightKeys);

  return {
    node: leftLeaf,
    inserted: true,
    split: {
      promotedKey: rightKeys[0],
      rightNode: rightLeaf,
    },
  };
}

function findChildIndex(keys: number[], key: number): number {
  for (let index = 0; index < keys.length; index += 1) {
    if (key < keys[index]) {
      return index;
    }
  }

  return keys.length;
}

function insertIntoInternal(
  internal: BPlusTreeInternalNode,
  key: number,
  config: BPlusTreeConfig,
): InsertResult {
  const childIndex = findChildIndex(internal.keys, key);
  const targetChild = internal.children[childIndex];
  const childResult = insertNode(targetChild, key, config);

  if (!childResult.inserted) {
    return {
      node: internal,
      inserted: false,
    };
  }

  const nextChildren = [...internal.children];
  nextChildren[childIndex] = childResult.node;
  const nextKeys = [...internal.keys];

  if (childResult.split) {
    nextKeys.splice(childIndex, 0, childResult.split.promotedKey);
    nextChildren.splice(childIndex + 1, 0, childResult.split.rightNode);
  }

  if (nextKeys.length <= config.maxInternalKeys) {
    return {
      node: createInternal(nextKeys, nextChildren),
      inserted: true,
    };
  }

  const mid = Math.floor(nextKeys.length / 2);
  const promotedKey = nextKeys[mid];
  const leftKeys = nextKeys.slice(0, mid);
  const rightKeys = nextKeys.slice(mid + 1);
  const leftChildren = nextChildren.slice(0, mid + 1);
  const rightChildren = nextChildren.slice(mid + 1);

  const leftInternal = createInternal(leftKeys, leftChildren);
  const rightInternal = createInternal(rightKeys, rightChildren);

  return {
    node: leftInternal,
    inserted: true,
    split: {
      promotedKey,
      rightNode: rightInternal,
    },
  };
}

function insertNode(
  node: BPlusTreeNode,
  key: number,
  config: BPlusTreeConfig,
): InsertResult {
  if (node.kind === "leaf") {
    return insertIntoLeaf(node, key, config);
  }

  return insertIntoInternal(node, key, config);
}

function applyInsert(
  root: BPlusTreeNode,
  key: number,
  config: BPlusTreeConfig,
): { root: BPlusTreeNode; inserted: boolean } {
  const insertedRoot = insertNode(root, key, config);
  if (!insertedRoot.inserted) {
    return { root, inserted: false };
  }

  if (!insertedRoot.split) {
    return { root: insertedRoot.node, inserted: true };
  }

  const nextRoot = createInternal(
    [insertedRoot.split.promotedKey],
    [insertedRoot.node, insertedRoot.split.rightNode],
  );

  return { root: nextRoot, inserted: true };
}

export function simulateBPlusTree(
  inputKeys: number[],
  config: BPlusTreeConfig,
): BPlusTreeSimulationResult {
  nodeIdCounter = 0;
  let root: BPlusTreeNode = createLeaf([]);
  const uniqueKeys: number[] = [];
  const steps: SimulationStep[] = [
    {
      label: "Initial",
      explanation: "Start with an empty root leaf node.",
      tree: cloneTree(root),
    },
  ];

  inputKeys.forEach((key) => {
    const result = applyInsert(root, key, config);
    if (!result.inserted) {
      steps.push({
        label: `Insert ${key}`,
        explanation: `Key ${key} already exists, so insertion is skipped.`,
        tree: cloneTree(root),
      });
      return;
    }

    root = result.root;
    uniqueKeys.push(key);
    const rootKindText = root.kind === "leaf" ? "leaf" : "internal";
    steps.push({
      label: `Insert ${key}`,
      explanation: `Inserted ${key}. Current root is a ${rootKindText} node.`,
      tree: cloneTree(root),
    });
  });

  return {
    finalTree: cloneTree(root),
    steps,
    uniqueKeys,
  };
}

export function getSearchPath(root: BPlusTreeNode, key: number): number[][] {
  const path: number[][] = [];
  let currentNode: BPlusTreeNode = root;

  while (currentNode.kind === "internal") {
    path.push([...currentNode.keys]);
    const nextIndex = findChildIndex(currentNode.keys, key);
    currentNode = currentNode.children[nextIndex];
  }

  path.push([...currentNode.keys]);
  return path;
}

export function treeToLevels(root: BPlusTreeNode): number[][][] {
  const levels: number[][][] = [];
  let currentLevel: BPlusTreeNode[] = [root];

  while (currentLevel.length > 0) {
    levels.push(currentLevel.map((node) => [...node.keys]));
    const nextLevel: BPlusTreeNode[] = [];

    currentLevel.forEach((node) => {
      if (node.kind === "internal") {
        nextLevel.push(...node.children);
      }
    });

    currentLevel = nextLevel;
  }

  return levels;
}
