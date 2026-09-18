"use client";
import { useEffect, useMemo, useState } from "react";
import {
  buildLesson,
  nodePath,
  treeStats,
  type LessonFrame,
} from "@/lib/bPlusTreeLesson";
import { TreeDiagram } from "./TreeDiagram";
import { Icon } from "./Icon";

const PRESETS = [
  { name: "第一次分裂", keys: [10, 20, 30, 40] },
  { name: "连续插入", keys: [10, 20, 5, 30, 40, 50, 60, 70, 80, 90] },
  { name: "乱序写入", keys: [45, 12, 78, 23, 56, 8, 34, 67] },
];
const PHASES = [
  { id: "locate", label: "定位" },
  { id: "insert", label: "写入" },
  { id: "split", label: "分裂（如需）" },
  { id: "done", label: "完成" },
];
function parseKey(value: string): number | null {
  if (!/^-?\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && Math.abs(parsed) <= 999
    ? parsed
    : null;
}
export default function BPlusTreeSimulator() {
  const [sequence, setSequence] = useState(PRESETS[0].keys);
  const [preset, setPreset] = useState(0);
  const [capacity, setCapacity] = useState(3);
  const [mode, setMode] = useState<"insert" | "search">("insert");
  const [input, setInput] = useState("35");
  const [target, setTarget] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const lesson = useMemo(
    () => buildLesson(sequence, capacity),
    [sequence, capacity],
  );
  const finalTree = lesson[lesson.length - 1].tree;
  const searchFrames = useMemo<LessonFrame[]>(() => {
    if (target === null)
      return [
        {
          tree: finalTree,
          phase: "ready",
          title: "输入一个键，看看查找会走哪条路",
          explanation:
            "查找使用完整插入序列的最终树。内部节点决定方向，只有到达叶节点后，才能确认键是否存在。",
          focusIds: [],
          operation: 0,
        },
      ];
    const path = nodePath(finalTree, target);
    const found = path[path.length - 1].keys.includes(target);
    return [
      ...path.map((node, i): LessonFrame => ({
        tree: finalTree,
        phase: "locate",
        title:
          node.kind === "leaf"
            ? "到达叶节点，检查目标键"
            : `访问第 ${i + 1} 层索引节点`,
        explanation:
          node.kind === "leaf"
            ? `在叶节点 [${node.keys.join(", ")}] 中检查 ${target}。`
            : `比较 ${target} 与分隔键 [${node.keys.join(", ")}]，选择对应的子节点。等于分隔键时向其右侧走。`,
        focusIds: path.slice(0, i + 1).map((n) => n.id),
        key: target,
        operation: 0,
      })),
      {
        tree: finalTree,
        phase: "done",
        title: found ? `找到了键 ${target}` : `键 ${target} 不存在`,
        explanation: `本次路径访问 ${path.length} 个节点。${found ? "目标键出现在叶节点中，查找成功。" : "已到达目标区间的叶节点，但其中没有这个键，查找结束。"}这是模型中的节点访问次数，不是实际磁盘 I/O 次数。`,
        focusIds: path.map((n) => n.id),
        key: target,
        operation: 0,
      },
    ];
  }, [finalTree, target]);
  const frames = mode === "insert" ? lesson : searchFrames;
  const safeStep = Math.min(step, frames.length - 1);
  const frame = frames[safeStep];
  const stats = treeStats(frame.tree);
  useEffect(() => {
    if (!playing || safeStep >= frames.length - 1) return;
    const timer = window.setTimeout(() => {
      const next = safeStep + 1;
      setStep(next);
      if (next === frames.length - 1) setPlaying(false);
    }, 1400 / speed);
    return () => window.clearTimeout(timer);
  }, [playing, safeStep, frames.length, speed]);
  function seek(next: number) {
    setStep(next);
    setPlaying(false);
  }
  function changeMode(next: "insert" | "search") {
    setMode(next);
    setPlaying(false);
    setStep(0);
    setError("");
    setTarget(null);
  }
  function reset() {
    setSequence(PRESETS[preset].keys);
    setStep(0);
    setPlaying(false);
    setTarget(null);
    setError("");
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const key = parseKey(input);
    if (key === null) {
      setError("请输入 -999 到 999 之间的整数。");
      return;
    }
    if (mode === "search") {
      setTarget(key);
      setStep(0);
      setPlaying(true);
      setError("");
      return;
    }
    if (sequence.length >= 24) {
      setError("本次实验最多 24 次插入，请重置后继续。");
      return;
    }
    setStep(lesson.length - 1);
    setSequence([...sequence, key]);
    setPlaying(true);
    setError("");
  }
  const currentPhase = PHASES.findIndex((p) => p.id === frame.phase);
  return (
    <div className="experiment">
      <div className="experiment-toolbar">
        <div className="mode-switch" role="group" aria-label="操作模式">
          <button
            aria-pressed={mode === "insert"}
            className={mode === "insert" ? "selected" : ""}
            onClick={() => changeMode("insert")}
          >
            <Icon name="tree" size={16} />
            插入实验
          </button>
          <button
            aria-pressed={mode === "search"}
            className={mode === "search" ? "selected" : ""}
            onClick={() => changeMode("search")}
          >
            <Icon name="search" size={16} />
            路径查找
          </button>
        </div>
        <label className="inline-select">
          预设场景
          <select
            value={preset}
            onChange={(e) => {
              const i = Number(e.target.value);
              setPreset(i);
              setSequence(PRESETS[i].keys);
              setStep(0);
              setPlaying(false);
              setTarget(null);
              setError("");
            }}
          >
            <option value={0}>第一次分裂</option>
            <option value={1}>连续插入</option>
            <option value={2}>乱序写入</option>
          </select>
        </label>
        <button className="text-link reset-button" onClick={reset}>
          <Icon name="reset" size={16} />
          重置实验
        </button>
      </div>
      <div className="experiment-grid">
        <div className="experiment-main">
          <div className="sequence-bar">
            <span>插入序列</span>
            <div className="sequence-keys">
              {sequence.map((key, i) => (
                <button
                  key={`${i}-${key}`}
                  aria-label={`跳到第 ${i + 1} 次插入 ${key} 完成`}
                  disabled={mode === "search"}
                  className={
                    mode === "insert" && i + 1 === frame.operation
                      ? "current"
                      : ""
                  }
                  onClick={() =>
                    seek(
                      lesson.findIndex(
                        (f) => f.operation === i + 1 && f.phase === "done",
                      ),
                    )
                  }
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <div className="canvas">
            <div className="canvas-header">
              <span>
                <span className="tiny-dot blue" />
                B+ TREE <span className="canvas-subtitle">/ 实时结构</span>
              </span>
              <span className="canvas-state">
                {frame.phase === "insert" && frame.title.includes("溢出")
                  ? "临时溢出状态"
                  : "教学模型"}
              </span>
            </div>
            <TreeDiagram
              tree={frame.tree}
              focusIds={frame.focusIds}
              activeKey={frame.key}
              animate={playing}
            />
            <div className="canvas-legend">
              <span>
                <i className="legend-box" />
                索引节点
              </span>
              <span>
                <i className="legend-box leaf" />
                叶节点
              </span>
              <span>
                <i className="legend-line" />
                叶节点有序关系
              </span>
            </div>
          </div>
          <div className="playback">
            <div className="playback-buttons">
              <button
                className="icon-button"
                aria-label="上一步"
                disabled={safeStep === 0}
                onClick={() => seek(safeStep - 1)}
              >
                <Icon name="back" size={18} />
              </button>
              <button
                className="play-button"
                aria-label={
                  playing
                    ? "暂停"
                    : safeStep === frames.length - 1
                      ? "重新播放"
                      : "播放"
                }
                disabled={frames.length <= 1}
                onClick={() => {
                  if (safeStep === frames.length - 1) setStep(0);
                  setPlaying(!playing);
                }}
              >
                <Icon name={playing ? "pause" : "play"} size={18} />
                {playing
                  ? "暂停"
                  : safeStep === frames.length - 1
                    ? "重播"
                    : "播放"}
              </button>
              <button
                className="icon-button"
                aria-label="下一步"
                disabled={safeStep === frames.length - 1}
                onClick={() => seek(safeStep + 1)}
              >
                <Icon name="next" size={18} />
              </button>
            </div>
            <input
              className="timeline"
              type="range"
              aria-label="演示进度"
              min={0}
              max={frames.length - 1}
              value={safeStep}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <span className="step-count">
              {String(safeStep + 1).padStart(2, "0")} /{" "}
              {String(frames.length).padStart(2, "0")}
            </span>
            <select
              aria-label="播放速度"
              className="speed-select"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
            </select>
          </div>
          <div className="operation-panel">
            <form onSubmit={submit}>
              <label htmlFor="key-input">
                {mode === "insert" ? "自己动手，插入一个键" : "输入想查找的键"}
              </label>
              <div className="operation-fields">
                <code>{mode === "insert" ? "insert" : "search"}(</code>
                <input
                  id="key-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  inputMode="text"
                  aria-invalid={!!error}
                  aria-describedby={error ? "key-error" : "input-hint"}
                  maxLength={8}
                />
                <code>)</code>
                <button className="button primary" type="submit">
                  {mode === "insert" ? "插入并演示" : "开始查找"}
                  <Icon name="arrow" size={16} />
                </button>
              </div>
              <p id="input-hint" className="field-hint">
                {mode === "insert"
                  ? "追加到完整序列末尾 · 支持 -999 ～ 999 的整数 · 重复键会跳过"
                  : "在完整序列的最终树中查找 · 也可以尝试一个不存在的键"}
              </p>
              {error && (
                <p className="field-error" id="key-error" role="alert">
                  {error}
                </p>
              )}
            </form>
            <label className="capacity-control">
              节点容量
              <select
                value={capacity}
                onChange={(e) => {
                  setCapacity(Number(e.target.value));
                  setStep(0);
                  setPlaying(false);
                  setTarget(null);
                }}
              >
                <option value={2}>最多 2 个键</option>
                <option value={3}>最多 3 个键</option>
                <option value={4}>最多 4 个键</option>
                <option value={5}>最多 5 个键</option>
              </select>
              <span>更改后重新开始回放</span>
            </label>
          </div>
        </div>
        <aside className="explanation-panel">
          <div className="explanation-label">
            <Icon name="book" size={17} />
            这一步发生了什么
          </div>
          <div className="phase-list">
            {(mode === "insert" ? PHASES : [PHASES[0], PHASES[3]]).map(
              (phase, i) => (
                <span
                  className={`${frame.phase === phase.id ? "active" : ""} ${mode === "insert" && currentPhase > PHASES.indexOf(phase) ? "passed" : ""}`}
                  key={phase.id}
                >
                  <b>{i + 1}</b>
                  {phase.label}
                </span>
              ),
            )}
          </div>
          <div
            className="explanation-copy"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="explanation-kicker">
              {frame.key === undefined
                ? "准备就绪"
                : `${mode === "insert" ? "INSERT" : "SEARCH"} ${frame.key}`}
            </span>
            <h2>{frame.title}</h2>
            <p>{frame.explanation}</p>
          </div>
          <div className="tree-metrics">
            <div>
              <span>树高</span>
              <strong>
                {stats.height}
                <small>层</small>
              </strong>
            </div>
            <div>
              <span>叶节点</span>
              <strong>
                {stats.leaves}
                <small>个</small>
              </strong>
            </div>
            <div>
              <span>存储键</span>
              <strong>
                {stats.keys}
                <small>个</small>
              </strong>
            </div>
          </div>
          <div className="think-box">
            <span>想一想</span>
            <p>如果增大节点容量，同一组数据还会在这一步发生分裂吗？</p>
          </div>
        </aside>
      </div>
      <div className="model-note">
        <Icon name="book" size={17} />
        <p>
          <strong>模型边界</strong>{" "}
          这个实验聚焦唯一键的插入、分裂与查找。容量代表键数，虚线表示叶节点顺序；暂不模拟真实数据页、磁盘
          I/O、删除或并发。分裂帧展示所有级联分裂完成后的结构。
        </p>
      </div>
    </div>
  );
}
