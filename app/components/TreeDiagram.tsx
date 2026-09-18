"use client";
import { useId } from "react";
import type { BPlusTreeNode } from "@/lib/bPlusTreeSimulator";

type PositionedNode = {
  node: BPlusTreeNode;
  x: number;
  y: number;
  width: number;
};
export function TreeDiagram({
  tree,
  focusIds = [],
  activeKey,
  compact = false,
  animate = false,
}: {
  tree: BPlusTreeNode;
  focusIds?: string[];
  activeKey?: number;
  compact?: boolean;
  animate?: boolean;
}) {
  const markerId = useId().replaceAll(":", "");
  const nodes: PositionedNode[] = [];
  const edges: { from: PositionedNode; to: PositionedNode }[] = [];
  const leaves: PositionedNode[] = [];
  let cursor = 30;
  function position(node: BPlusTreeNode, depth: number): PositionedNode {
    const width = Math.max(72, node.keys.length * 43 + 20);
    let children: PositionedNode[] = [];
    let x: number;
    if (node.kind === "leaf") {
      x = cursor + width / 2;
      cursor += width + 44;
    } else {
      children = node.children.map((c) => position(c, depth + 1));
      x = (children[0].x + children[children.length - 1].x) / 2;
    }
    const placed = { node, x, y: depth * 122 + 52, width };
    nodes.push(placed);
    if (node.kind === "leaf") leaves.push(placed);
    children.forEach((child) => edges.push({ from: placed, to: child }));
    return placed;
  }
  position(tree, 0);
  const contentWidth = cursor - 14;
  const width = Math.max(320, contentWidth);
  const offset = (width - contentWidth) / 2;
  nodes.forEach((placed) => {
    placed.x += offset;
  });
  const height = Math.max(...nodes.map((n) => n.y)) + 78;
  return (
    <div
      className={`tree-scroll ${compact ? "compact" : ""}`}
      tabIndex={0}
      role="region"
      aria-label="B+ Tree 结构图，可横向滚动"
    >
      <svg
        className={`tree-svg ${animate ? "is-animating" : ""}`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`B+ Tree：${nodes.map((p) => `${p.node.kind === "leaf" ? "叶节点" : "内部节点"} [${p.node.keys.join(", ") || "空"}]`).join("；")}`}
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="7"
            markerHeight="7"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path
              d="M0 0 6 3 0 6"
              fill="none"
              stroke="#8eacc7"
              strokeWidth="1.2"
            />
          </marker>
        </defs>
        {edges.map(({ from, to }) => (
          <path
            key={`${from.node.id}-${to.node.id}`}
            className={`tree-edge ${focusIds.includes(to.node.id) ? "focused" : ""}`}
            d={`M${from.x},${from.y + 23} V${from.y + 58} H${to.x} V${to.y - 26}`}
            fill="none"
          />
        ))}
        {leaves.slice(0, -1).map((p, i) => (
          <path
            key={`leaf-${p.node.id}`}
            d={`M${p.x + p.width / 2 + 5},${p.y} H${leaves[i + 1].x - leaves[i + 1].width / 2 - 8}`}
            stroke="#8eacc7"
            strokeDasharray="3 3"
            markerEnd={`url(#${markerId})`}
          />
        ))}
        {nodes.map(({ node, x, y, width: w }) => (
          <g
            key={node.id}
            className={`tree-node ${node.kind} ${focusIds.includes(node.id) ? "focused" : ""}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <text className="node-caption" y="-35" textAnchor="middle">
              {node.kind === "leaf" ? "LEAF / 叶节点" : "INDEX / 索引节点"}
            </text>
            <rect x={-w / 2} y="-23" width={w} height="46" rx="7" />
            {node.keys.length === 0 ? (
              <text textAnchor="middle" y="5" className="node-empty">
                空节点
              </text>
            ) : (
              node.keys.map((key, i) => (
                <g key={key}>
                  {i > 0 && (
                    <line
                      x1={-w / 2 + 10 + i * 43}
                      y1="-12"
                      x2={-w / 2 + 10 + i * 43}
                      y2="12"
                    />
                  )}
                  {key === activeKey && (
                    <rect
                      className="key-highlight"
                      x={-w / 2 + 13 + i * 43}
                      y="-16"
                      width="37"
                      height="32"
                      rx="4"
                    />
                  )}
                  <text
                    className={key === activeKey ? "active-key" : ""}
                    x={-w / 2 + 31.5 + i * 43}
                    y="5"
                    textAnchor="middle"
                  >
                    {key}
                  </text>
                </g>
              ))
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
