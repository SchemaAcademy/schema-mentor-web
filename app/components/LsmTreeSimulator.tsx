"use client";

import { useEffect, useMemo, useState } from "react";
import { buildLsmLesson, lsmStats, type LsmEntry } from "@/lib/lsmLesson";
import { Icon } from "./Icon";

const PRESETS = [
  {
    name: "一次 Flush",
    writes: [
      { key: "user", value: "Ada" },
      { key: "plan", value: "pro" },
      { key: "theme", value: "dark" },
    ],
  },
  {
    name: "更新后合并",
    writes: [
      { key: "user", value: "Ada" },
      { key: "plan", value: "free" },
      { key: "theme", value: "light" },
      { key: "plan", value: "pro" },
      { key: "lang", value: "zh" },
      { key: "region", value: "cn" },
    ],
  },
  {
    name: "乱序写入",
    writes: [
      { key: "delta", value: "4" },
      { key: "alpha", value: "1" },
      { key: "beta", value: "2" },
      { key: "delta", value: "5" },
      { key: "gamma", value: "3" },
      { key: "alpha", value: "6" },
    ],
  },
];

const PHASES = [
  { id: "write", label: "写入内存" },
  { id: "freeze", label: "冻结" },
  { id: "flush", label: "刷盘" },
  { id: "compact", label: "合并" },
];

function validField(value: string) {
  return /^[a-z][a-z0-9]{0,7}$/i.test(value);
}

function Entries({ entries, empty }: { entries: LsmEntry[]; empty: string }) {
  if (entries.length === 0) return <div className="engine-empty">{empty}</div>;
  return (
    <div className="engine-entry-list">
      {entries.map((entry) => (
        <div className="engine-entry" key={`${entry.key}-${entry.sequence}`}>
          <code>{entry.key}</code>
          <span>{entry.value}</span>
          <small>#{entry.sequence}</small>
        </div>
      ))}
    </div>
  );
}

export default function LsmTreeSimulator() {
  const [preset, setPreset] = useState(1);
  const [writes, setWrites] = useState(PRESETS[1].writes);
  const [limit, setLimit] = useState(3);
  const [key, setKey] = useState("cache");
  const [value, setValue] = useState("warm");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const frames = useMemo(() => buildLsmLesson(writes, limit), [writes, limit]);
  const active = frames[Math.min(step, frames.length - 1)];
  const stats = lsmStats(active.state);
  const phaseIndex = PHASES.findIndex((phase) => phase.id === active.phase);

  useEffect(() => {
    if (!playing || step >= frames.length - 1) return;
    const timer = window.setTimeout(() => {
      setStep((current) => {
        const next = Math.min(current + 1, frames.length - 1);
        if (next === frames.length - 1) setPlaying(false);
        return next;
      });
    }, 1400 / speed);
    return () => window.clearTimeout(timer);
  }, [frames.length, playing, speed, step]);

  function seek(next: number) {
    setStep(next);
    setPlaying(false);
  }
  function reset() {
    setWrites(PRESETS[preset].writes);
    setStep(0);
    setPlaying(false);
    setError("");
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!validField(key) || !validField(value)) {
      setError("键和值使用 1–8 个字母或数字，并以字母开头。");
      return;
    }
    if (writes.length >= 18) {
      setError("本次实验最多 18 次写入，请重置后继续。");
      return;
    }
    setStep(frames.length - 1);
    setWrites([...writes, { key, value }]);
    setPlaying(true);
    setError("");
  }
  return (
    <div className="engine-experiment">
      <div className="experiment-toolbar">
        <div className="mode-switch static-mode">
          <span>
            <Icon name="layers" size={16} />
            写入 → Flush → Compaction
          </span>
        </div>
        <label className="inline-select">
          预设场景
          <select
            value={preset}
            onChange={(event) => {
              const next = Number(event.target.value);
              setPreset(next);
              setWrites(PRESETS[next].writes);
              setStep(0);
              setPlaying(false);
              setError("");
            }}
          >
            <option value={0}>一次 Flush</option>
            <option value={1}>更新后合并</option>
            <option value={2}>乱序写入</option>
          </select>
        </label>
        <button className="text-link reset-button" onClick={reset}>
          <Icon name="reset" size={16} />
          重置实验
        </button>
      </div>
      <div className="engine-layout">
        <section className="engine-main">
          <div className="sequence-bar">
            <span>写入序列</span>
            <div className="sequence-keys">
              {writes.map((write, index) => (
                <button
                  key={`${index}-${write.key}-${write.value}`}
                  className={active.operation === index + 1 ? "current" : ""}
                  onClick={() =>
                    seek(
                      frames.findIndex(
                        (frame) =>
                          frame.operation === index + 1 &&
                          frame.phase === "done",
                      ),
                    )
                  }
                >
                  {write.key}
                </button>
              ))}
            </div>
          </div>
          <div className="engine-canvas lsm-canvas">
            <div className="canvas-header">
              <span>
                <span className="tiny-dot blue" />
                LSM TREE{" "}
                <span className="canvas-subtitle">/ 写入如何走向磁盘</span>
              </span>
              <span className="canvas-state">
                {active.phase === "compact" ? "正在合并版本" : "教学模型"}
              </span>
            </div>
            <div className="lsm-flow" aria-label="LSM Tree 状态图">
              <div
                className={`lsm-zone ${active.focus === "memtable" ? "focused" : ""}`}
              >
                <div className="engine-zone-heading">
                  <span className="zone-number">01</span>
                  <div>
                    <strong>MemTable</strong>
                    <small>内存 · 始终按 key 排序</small>
                  </div>
                </div>
                <Entries
                  entries={active.state.memtable}
                  empty="等待下一次写入"
                />
              </div>
              <div className="flow-arrow">
                <Icon name="arrow" size={18} />
                <small>
                  满 {limit} 条<br />
                  冻结
                </small>
              </div>
              <div
                className={`lsm-zone frozen ${active.focus === "frozen" ? "focused" : ""}`}
              >
                <div className="engine-zone-heading">
                  <span className="zone-number">02</span>
                  <div>
                    <strong>Frozen</strong>
                    <small>不可再修改</small>
                  </div>
                </div>
                <Entries entries={active.state.frozen ?? []} empty="尚未冻结" />
              </div>
              <div className="flow-arrow">
                <Icon name="arrow" size={18} />
                <small>
                  顺序
                  <br />
                  Flush
                </small>
              </div>
              <div
                className={`lsm-zone sstable-zone ${active.focus === "level0" || active.focus === "all" ? "focused" : ""}`}
              >
                <div className="engine-zone-heading">
                  <span className="zone-number">03</span>
                  <div>
                    <strong>Level 0</strong>
                    <small>不可变 SSTables · 新文件在前</small>
                  </div>
                </div>
                <div className="sstable-list">
                  {active.state.level0.length === 0 ? (
                    <div className="engine-empty">还没有磁盘文件</div>
                  ) : (
                    active.state.level0.map((table) => (
                      <div className="sstable-card" key={table.id}>
                        <div>
                          <Icon name="database" size={14} />
                          {table.id.toUpperCase()}
                        </div>
                        <Entries entries={table.entries} empty="" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="engine-legend">
              <span>
                <i className="legend-box" />
                可修改内存表
              </span>
              <span>
                <i className="legend-box frozen" />
                冻结表
              </span>
              <span>
                <i className="legend-box disk" />
                不可变磁盘文件
              </span>
            </div>
          </div>
          <Playback
            step={step}
            count={frames.length}
            playing={playing}
            speed={speed}
            onSeek={seek}
            onPlay={() => {
              if (step === frames.length - 1) setStep(0);
              setPlaying((current) => !current);
            }}
            onSpeed={setSpeed}
          />
          <div className="operation-panel engine-operation">
            <form onSubmit={submit}>
              <label htmlFor="lsm-key">自己写入一条记录</label>
              <div className="operation-fields">
                <code>put(</code>
                <input
                  id="lsm-key"
                  value={key}
                  aria-label="写入键"
                  onChange={(event) => setKey(event.target.value)}
                />
                <code>,</code>
                <input
                  value={value}
                  aria-label="写入值"
                  onChange={(event) => setValue(event.target.value)}
                />
                <code>)</code>
                <button className="button primary" type="submit">
                  写入并演示
                  <Icon name="arrow" size={16} />
                </button>
              </div>
              <p className="field-hint">
                新写入追加到完整序列末尾；相同 key 在 MemTable 内会覆盖旧版本。
              </p>
              {error && (
                <p className="field-error" role="alert">
                  {error}
                </p>
              )}
            </form>
            <label className="capacity-control">
              MemTable 阈值
              <select
                value={limit}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setStep(0);
                  setPlaying(false);
                }}
              >
                <option value={2}>2 条记录</option>
                <option value={3}>3 条记录</option>
                <option value={4}>4 条记录</option>
              </select>
              <span>改变后从头演示</span>
            </label>
          </div>
        </section>
        <aside className="explanation-panel">
          <div className="explanation-label">
            <Icon name="book" size={17} />
            这一步发生了什么
          </div>
          <div className="phase-list">
            {PHASES.map((phase, index) => (
              <span
                className={`${active.phase === phase.id ? "active" : ""} ${phaseIndex > index ? "passed" : ""}`}
                key={phase.id}
              >
                <b>{index + 1}</b>
                {phase.label}
              </span>
            ))}
          </div>
          <div
            className="explanation-copy"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="explanation-kicker">
              {active.phase.toUpperCase()}
            </span>
            <h2>{active.title}</h2>
            <p>{active.explanation}</p>
          </div>
          <div className="tree-metrics">
            <div>
              <span>MemTable</span>
              <strong>
                {stats.memtable}
                <small>条</small>
              </strong>
            </div>
            <div>
              <span>L0 文件</span>
              <strong>
                {stats.files}
                <small>个</small>
              </strong>
            </div>
            <div>
              <span>磁盘记录</span>
              <strong>
                {stats.diskRecords}
                <small>条</small>
              </strong>
            </div>
          </div>
          <div className="think-box">
            <span>想一想</span>
            <p>同一个 key 连续写入多次，为什么 compaction 只保留一个版本？</p>
          </div>
        </aside>
      </div>
      <div className="model-note">
        <Icon name="book" size={17} />
        <p>
          <strong>模型边界</strong> 本实验只表现内存排序、冻结、顺序 Flush 与
          Level 0 合并；不模拟 WAL、布隆过滤器、层级策略、并发读写、磁盘 I/O 或
          tombstone。合并在单一教学帧中原子完成。
        </p>
      </div>
    </div>
  );
}

export function Playback({
  step,
  count,
  playing,
  speed,
  onSeek,
  onPlay,
  onSpeed,
}: {
  step: number;
  count: number;
  playing: boolean;
  speed: number;
  onSeek: (step: number) => void;
  onPlay: () => void;
  onSpeed: (speed: number) => void;
}) {
  return (
    <div className="playback">
      <div className="playback-buttons">
        <button
          className="icon-button"
          aria-label="上一步"
          disabled={step === 0}
          onClick={() => onSeek(step - 1)}
        >
          <Icon name="back" size={18} />
        </button>
        <button
          className="play-button"
          aria-label={
            playing ? "暂停" : step === count - 1 ? "重新播放" : "播放"
          }
          onClick={onPlay}
        >
          <Icon name={playing ? "pause" : "play"} size={18} />
          {playing ? "暂停" : step === count - 1 ? "重播" : "播放"}
        </button>
        <button
          className="icon-button"
          aria-label="下一步"
          disabled={step === count - 1}
          onClick={() => onSeek(step + 1)}
        >
          <Icon name="next" size={18} />
        </button>
      </div>
      <input
        className="timeline"
        type="range"
        aria-label="演示进度"
        min={0}
        max={count - 1}
        value={step}
        onChange={(event) => onSeek(Number(event.target.value))}
      />
      <span className="step-count">
        {String(step + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      <select
        aria-label="播放速度"
        className="speed-select"
        value={speed}
        onChange={(event) => onSpeed(Number(event.target.value))}
      >
        <option value={0.5}>0.5×</option>
        <option value={1}>1×</option>
        <option value={2}>2×</option>
      </select>
    </div>
  );
}
