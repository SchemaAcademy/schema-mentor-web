export type LsmEntry = { key: string; value: string; sequence: number };
export type SStable = { id: string; entries: LsmEntry[] };
export type LsmState = {
  memtable: LsmEntry[];
  frozen: LsmEntry[] | null;
  level0: SStable[];
};
export type LsmFrame = {
  state: LsmState;
  phase: "ready" | "write" | "freeze" | "flush" | "compact" | "done";
  title: string;
  explanation: string;
  focus: "memtable" | "frozen" | "level0" | "all" | null;
  operation: number;
};

const sortEntries = (entries: LsmEntry[]) =>
  [...entries].sort(
    (a, b) => a.key.localeCompare(b.key) || a.sequence - b.sequence,
  );

function cloneState(state: LsmState): LsmState {
  return {
    memtable: state.memtable.map((entry) => ({ ...entry })),
    frozen: state.frozen?.map((entry) => ({ ...entry })) ?? null,
    level0: state.level0.map((table) => ({
      ...table,
      entries: table.entries.map((entry) => ({ ...entry })),
    })),
  };
}

function latestEntries(tables: SStable[]): LsmEntry[] {
  const latest = new Map<string, LsmEntry>();
  tables
    .flatMap((table) => table.entries)
    .forEach((entry) => {
      const current = latest.get(entry.key);
      if (!current || current.sequence < entry.sequence)
        latest.set(entry.key, entry);
    });
  return sortEntries([...latest.values()]);
}

export function buildLsmLesson(
  writes: Array<{ key: string; value: string }>,
  memtableLimit = 3,
  compactAtEnd = true,
): LsmFrame[] {
  let sequence = 0;
  let tableId = 0;
  let state: LsmState = { memtable: [], frozen: null, level0: [] };
  const frames: LsmFrame[] = [
    {
      state: cloneState(state),
      phase: "ready",
      focus: null,
      operation: 0,
      title: "从一个空的 MemTable 开始",
      explanation: `写入先进入内存中的有序 MemTable。本实验设置 ${memtableLimit} 条记录为刷盘阈值，达到后会生成一个不可变 SSTable。`,
    },
  ];

  writes.forEach(({ key, value }, index) => {
    sequence += 1;
    const entry = { key, value, sequence };
    state = {
      ...state,
      memtable: sortEntries([
        ...state.memtable.filter((current) => current.key !== key),
        entry,
      ]),
    };
    frames.push({
      state: cloneState(state),
      phase: "write",
      focus: "memtable",
      operation: index + 1,
      title: `写入 ${key} = ${value} 到 MemTable`,
      explanation: `这条写入暂时只在内存中。MemTable 始终按 key 排序，所以后续 flush 能顺序生成 SSTable；相同 key 的新版本会有更大的序号。`,
    });
    if (state.memtable.length < memtableLimit) {
      frames.push({
        state: cloneState(state),
        phase: "done",
        focus: "memtable",
        operation: index + 1,
        title: "继续积累内存写入",
        explanation: `MemTable 目前有 ${state.memtable.length}/${memtableLimit} 条记录，还没有到达刷盘阈值。`,
      });
      return;
    }
    state = { ...state, frozen: state.memtable, memtable: [] };
    frames.push({
      state: cloneState(state),
      phase: "freeze",
      focus: "frozen",
      operation: index + 1,
      title: "冻结当前 MemTable，接收新写入的空间腾出来了",
      explanation:
        "冻结后的表不再修改，可以安全地写入磁盘；新的 MemTable 立即接管后续写入。真实系统通常还会通过 WAL 保证崩溃恢复，本模型不展示 WAL。",
    });
    tableId += 1;
    const nextTable = { id: `sst-${tableId}`, entries: state.frozen ?? [] };
    state = {
      memtable: state.memtable,
      frozen: null,
      level0: [nextTable, ...state.level0],
    };
    frames.push({
      state: cloneState(state),
      phase: "flush",
      focus: "level0",
      operation: index + 1,
      title: `Flush 完成：生成 ${nextTable.id.toUpperCase()}`,
      explanation: `冻结的有序记录写成不可变 SSTable，加入 Level 0。Level 0 的文件按时间新旧排列，彼此可能有重叠 key。`,
    });
    frames.push({
      state: cloneState(state),
      phase: "done",
      focus: "all",
      operation: index + 1,
      title: "写入路径回到内存",
      explanation:
        "这次写入已经有磁盘上的有序文件，新写入继续从新的 MemTable 开始。读取时需要优先检查内存和较新的文件。",
    });
  });

  if (compactAtEnd && state.level0.length >= 2) {
    const inputCount = state.level0.reduce(
      (sum, table) => sum + table.entries.length,
      0,
    );
    const merged = latestEntries(state.level0);
    frames.push({
      state: cloneState(state),
      phase: "compact",
      focus: "level0",
      operation: writes.length,
      title: `准备合并 ${state.level0.length} 个 Level 0 文件`,
      explanation: `这些文件共含 ${inputCount} 条版本记录。合并会按 key 排序，并为重复 key 保留序号最大的版本。`,
    });
    tableId += 1;
    state = { ...state, level0: [{ id: `sst-${tableId}`, entries: merged }] };
    frames.push({
      state: cloneState(state),
      phase: "done",
      focus: "level0",
      operation: writes.length,
      title: "Compaction 完成：重叠文件变成一个有序文件",
      explanation: `输出文件含 ${merged.length} 条最新记录。旧文件在真实系统中会等到读者不再引用后删除；本模型直接用新状态替换它们。`,
    });
  }
  return frames;
}

export function lsmStats(state: LsmState) {
  return {
    memtable: state.memtable.length,
    files: state.level0.length,
    diskRecords: state.level0.reduce(
      (sum, table) => sum + table.entries.length,
      0,
    ),
  };
}
