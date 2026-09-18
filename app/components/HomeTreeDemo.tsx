"use client";
import { useState } from "react";
import { simulateBPlusTree } from "@/lib/bPlusTreeSimulator";
import { nodePath } from "@/lib/bPlusTreeLesson";
import { TreeDiagram } from "./TreeDiagram";
import { Icon } from "./Icon";
export function HomeTreeDemo() {
  const [inserted, setInserted] = useState(false);
  const tree = simulateBPlusTree(
    inserted ? [10, 20, 30, 40, 50, 35] : [10, 20, 30, 40, 50],
    { maxLeafKeys: 3, maxInternalKeys: 3 },
  ).finalTree;
  return (
    <div className="hero-demo">
      <div className="demo-top">
        <span>
          <span className="tiny-dot blue" />
          LIVE PREVIEW
        </span>
        <span>B+ Tree / 插入与分裂</span>
      </div>
      <TreeDiagram
        tree={tree}
        compact
        focusIds={inserted ? nodePath(tree, 35).map((n) => n.id) : []}
        activeKey={inserted ? 35 : undefined}
      />
      <div className="demo-action">
        <code>
          <span>tree.</span>insert(<b>35</b>)
        </code>
        <button onClick={() => setInserted(!inserted)} className="demo-insert">
          {inserted ? "重置演示" : "试着插入 35"}
          <Icon name={inserted ? "reset" : "arrow"} size={16} />
        </button>
      </div>
      <div className="demo-caption" aria-live="polite">
        {inserted
          ? "叶节点溢出 → 分裂为两个节点 → 将 40 复制到父节点"
          : "如果一个叶节点已经满了，再插入一个键会怎样？"}
      </div>
    </div>
  );
}
