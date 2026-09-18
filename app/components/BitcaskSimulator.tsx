"use client";

import { useEffect, useMemo, useState } from "react";
import { bitcaskStats, buildBitcaskLesson } from "@/lib/bitcaskLesson";
import { Icon } from "./Icon";
import { Playback } from "./LsmTreeSimulator";

const PRESETS = [
  {
    name: "第一次追加写",
    writes: [
      { key: "theme", value: "light" },
      { key: "lang", value: "zh" },
    ],
  },
  {
    name: "更新与合并",
    writes: [
      { key: "theme", value: "light" },
      { key: "lang", value: "zh" },
      { key: "theme", value: "dark" },
      { key: "font", value: "mono" },
    ],
  },
  {
    name: "热点 key",
    writes: [
      { key: "cart", value: "1" },
      { key: "cart", value: "2" },
      { key: "cart", value: "3" },
      { key: "user", value: "ada" },
    ],
  },
];

const PHASES = [
  { id: "append", label: "追加" },
  { id: "index", label: "更新索引" },
  { id: "compact", label: "合并" },
  { id: "done", label: "完成" },
];

function valid(value: string) {
  return /^[a-z][a-z0-9]{0,7}$/i.test(value);
}

export default function BitcaskSimulator() {
  const [preset, setPreset] = useState(1);
  const [writes, setWrites] = useState(PRESETS[1].writes);
  const [key, setKey] = useState("session");
  const [value, setValue] = useState("new");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const frames = useMemo(() => buildBitcaskLesson(writes), [writes]);
  const active = frames[Math.min(step, frames.length - 1)];
  const stats = bitcaskStats(active.state);
  const phaseIndex = PHASES.findIndex((phase) => phase.id === active.phase);

  useEffect(() => {
    if (!playing || step >= frames.length - 1) return;
    const timer = window.setTimeout(
      () =>
        setStep((current) => {
          const next = Math.min(current + 1, frames.length - 1);
          if (next === frames.length - 1) setPlaying(false);
          return next;
        }),
      1400 / speed,
    );
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
    if (!valid(key) || !valid(value)) {
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
  const isLive = (offset: number, recordKey: string) =>
    active.state.keydir[recordKey]?.offset === offset;
  return (
    <div className="engine-experiment">
      <div className="experiment-toolbar">
        <div className="mode-switch static-mode">
          <span>
            <Icon name="database" size={16} />
            追加日志 + 内存索引
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
            <option value={0}>第一次追加写</option>
            <option value={1}>更新与合并</option>
            <option value={2}>热点 key</option>
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
          <div className="engine-canvas bitcask-canvas">
            <div className="canvas-header">
              <span>
                <span className="tiny-dot blue" />
                BITCASK{" "}
                <span className="canvas-subtitle">/ 日志与最新位置</span>
              </span>
              <span className="canvas-state">
                {active.phase === "compact" ? "正在回收旧版本" : "教学模型"}
              </span>
            </div>
            <div
              className="bitcask-flow"
              aria-label="Bitcask 日志和 Keydir 状态图"
            >
              <div
                className={`bitcask-zone log-zone ${active.focus === "log" || active.focus === "all" ? "focused" : ""}`}
              >
                <div className="engine-zone-heading">
                  <span className="zone-number">01</span>
                  <div>
                    <strong>Active data file</strong>
                    <small>磁盘 · 只追加</small>
                  </div>
                </div>
                <div className="log-list">
                  {active.state.log.length === 0 ? (
                    <div className="engine-empty">等待第一条记录</div>
                  ) : (
                    active.state.log.map((record) => (
                      <div
                        className={`log-record ${isLive(record.offset, record.key) ? "live" : "stale"} ${record.key === active.key ? "highlight" : ""}`}
                        key={`${record.offset}-${record.key}`}
                      >
                        <span>@{record.offset}</span>
                        <code>{record.key}</code>
                        <b>{record.value}</b>
                        <small>
                          {isLive(record.offset, record.key) ? "最新" : "旧值"}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flow-arrow keydir-arrow">
                <Icon name="arrow" size={18} />
                <small>
                  offset
                  <br />
                  定位
                </small>
              </div>
              <div
                className={`bitcask-zone keydir-zone ${active.focus === "keydir" || active.focus === "all" ? "focused" : ""}`}
              >
                <div className="engine-zone-heading">
                  <span className="zone-number">02</span>
                  <div>
                    <strong>Keydir</strong>
                    <small>内存 · key → 最新 offset</small>
                  </div>
                </div>
                <div className="keydir-list">
                  {Object.keys(active.state.keydir).length === 0 ? (
                    <div className="engine-empty">等待索引项</div>
                  ) : (
                    Object.entries(active.state.keydir)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([entryKey, entry]) => (
                        <div
                          className={`keydir-entry ${entryKey === active.key ? "highlight" : ""}`}
                          key={entryKey}
                        >
                          <code>{entryKey}</code>
                          <span>@{entry.offset}</span>
                          <b>{entry.value}</b>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
            <div className="engine-legend">
              <span>
                <i className="legend-box disk" />
                当前被 Keydir 指向
              </span>
              <span>
                <i className="legend-box stale" />
                过期记录，等待合并回收
              </span>
              <span>
                <i className="legend-line" />
                一次读取：索引 → offset
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
              <label htmlFor="bitcask-key">自己追加一条记录</label>
              <div className="operation-fields">
                <code>put(</code>
                <input
                  id="bitcask-key"
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
                  追加并演示
                  <Icon name="arrow" size={16} />
                </button>
              </div>
              <p className="field-hint">
                相同 key 不会覆盖日志中的旧记录，只会把 Keydir 改指向新的
                offset。
              </p>
              {error && (
                <p className="field-error" role="alert">
                  {error}
                </p>
              )}
            </form>
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
              <span>日志记录</span>
              <strong>
                {stats.records}
                <small>条</small>
              </strong>
            </div>
            <div>
              <span>Keydir</span>
              <strong>
                {stats.keys}
                <small>项</small>
              </strong>
            </div>
            <div>
              <span>过期记录</span>
              <strong>
                {stats.stale}
                <small>条</small>
              </strong>
            </div>
          </div>
          <div className="think-box">
            <span>想一想</span>
            <p>
              为什么 Keydir 足够让读取直接命中最新值，却不能让旧记录自动消失？
            </p>
          </div>
        </aside>
      </div>
      <div className="model-note">
        <Icon name="book" size={17} />
        <p>
          <strong>模型边界</strong> 本实验展示单一活跃日志文件、内存 Keydir
          与合并回收；不模拟文件轮转、启动时扫描重建索引、Hint
          文件、崩溃恢复、校验和或并发访问。offset
          是教学序号，不是实际字节位置。
        </p>
      </div>
    </div>
  );
}
