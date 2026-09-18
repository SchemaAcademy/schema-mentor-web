export type BitcaskRecord = { offset: number; key: string; value: string };
export type KeydirEntry = { offset: number; value: string };
export type BitcaskState = {
  log: BitcaskRecord[];
  keydir: Record<string, KeydirEntry>;
};
export type BitcaskFrame = {
  state: BitcaskState;
  phase: "ready" | "append" | "index" | "read" | "compact" | "done";
  title: string;
  explanation: string;
  focus: "log" | "keydir" | "all" | null;
  operation: number;
  key?: string;
};

function cloneState(state: BitcaskState): BitcaskState {
  return {
    log: state.log.map((record) => ({ ...record })),
    keydir: Object.fromEntries(
      Object.entries(state.keydir).map(([key, entry]) => [key, { ...entry }]),
    ),
  };
}

export function buildBitcaskLesson(
  writes: Array<{ key: string; value: string }>,
  compactAtEnd = true,
): BitcaskFrame[] {
  let state: BitcaskState = { log: [], keydir: {} };
  const frames: BitcaskFrame[] = [
    {
      state: cloneState(state),
      phase: "ready",
      focus: null,
      operation: 0,
      title: "从一份空的数据日志开始",
      explanation:
        "Bitcask 把每次写入追加到活跃数据文件，并在内存中维护 keydir。keydir 只保存每个 key 的最新位置，因此读取不必扫描整份日志。",
    },
  ];
  writes.forEach(({ key, value }, index) => {
    const offset = state.log.length;
    const previous = state.keydir[key];
    state = { ...state, log: [...state.log, { offset, key, value }] };
    frames.push({
      state: cloneState(state),
      phase: "append",
      focus: "log",
      operation: index + 1,
      key,
      title: `追加记录：${key} = ${value}`,
      explanation: `记录直接追加在 offset ${offset}，不在原位置修改任何字节。${previous ? `${key} 原来的记录仍在日志中，但即将不再是最新值。` : "这是该 key 的第一条记录。"}`,
    });
    state = { ...state, keydir: { ...state.keydir, [key]: { offset, value } } };
    frames.push({
      state: cloneState(state),
      phase: "index",
      focus: "keydir",
      operation: index + 1,
      key,
      title: `Keydir 指向 ${key} 的最新 offset`,
      explanation: `内存索引把 ${key} 映射到 offset ${offset}。读取时先查 keydir，再直接定位日志记录；旧 offset ${previous?.offset ?? "不存在"} 不再被索引引用。`,
    });
    frames.push({
      state: cloneState(state),
      phase: "done",
      focus: "all",
      operation: index + 1,
      key,
      title: "一次追加写入完成",
      explanation:
        "写入路径只追加和更新内存索引，没有原地覆盖。代价是同一个 key 的旧记录会留下来，需要在之后的合并中回收。",
    });
  });
  if (compactAtEnd && state.log.length > Object.keys(state.keydir).length) {
    const stale = state.log.length - Object.keys(state.keydir).length;
    frames.push({
      state: cloneState(state),
      phase: "compact",
      focus: "all",
      operation: writes.length,
      title: `发现 ${stale} 条过期记录，开始合并`,
      explanation:
        "合并会遍历旧日志，只复制仍被 keydir 指向的最新记录到新文件。这样读取语义不变，但旧值占用的空间可以回收。",
    });
    const liveRecords = Object.entries(state.keydir)
      .sort(([, a], [, b]) => a.offset - b.offset)
      .map(([key, entry], offset) => ({ offset, key, value: entry.value }));
    state = {
      log: liveRecords,
      keydir: Object.fromEntries(
        liveRecords.map((record) => [
          record.key,
          { offset: record.offset, value: record.value },
        ]),
      ),
    };
    frames.push({
      state: cloneState(state),
      phase: "done",
      focus: "all",
      operation: writes.length,
      title: "合并完成：只留下每个 key 的最新记录",
      explanation: `日志从 ${writes.length} 条记录缩减到 ${liveRecords.length} 条。真实 Bitcask 会在安全切换文件后才回收旧文件，本模型把切换视为原子完成。`,
    });
  }
  return frames;
}

export function bitcaskStats(state: BitcaskState) {
  return {
    records: state.log.length,
    keys: Object.keys(state.keydir).length,
    stale: state.log.length - Object.keys(state.keydir).length,
  };
}
