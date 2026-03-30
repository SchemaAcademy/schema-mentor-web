"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSearchPath,
  simulateBPlusTree,
  treeToLevels,
} from "@/lib/bPlusTreeSimulator";

const DEFAULT_SEQUENCE = [10, 20, 5, 30, 40, 50];

function parseInteger(value: string): number | null {
  if (!/^-?\d+$/.test(value.trim())) {
    return null;
  }

  return Number.parseInt(value, 10);
}

export default function BPlusTreeSimulator() {
  const [insertSequence, setInsertSequence] = useState<number[]>(DEFAULT_SEQUENCE);
  const [pendingKey, setPendingKey] = useState("");
  const [searchKey, setSearchKey] = useState("30");
  const [maxLeafKeys, setMaxLeafKeys] = useState(3);
  const [maxInternalKeys, setMaxInternalKeys] = useState(3);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const simulation = useMemo(
    () =>
      simulateBPlusTree(insertSequence, {
        maxLeafKeys,
        maxInternalKeys,
      }),
    [insertSequence, maxInternalKeys, maxLeafKeys],
  );

  const safeStepIndex = Math.min(stepIndex, simulation.steps.length - 1);
  const activeStep = simulation.steps[safeStepIndex];
  const levels = treeToLevels(activeStep.tree);

  const searchPath = useMemo(() => {
    const parsed = parseInteger(searchKey);
    if (parsed === null) {
      return [];
    }
    return getSearchPath(activeStep.tree, parsed);
  }, [activeStep.tree, searchKey]);

  useEffect(() => {
    if (!isPlaying || safeStepIndex >= simulation.steps.length - 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setStepIndex((current) => {
        if (current >= simulation.steps.length - 1) {
          return current;
        }
        return current + 1;
      });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [isPlaying, safeStepIndex, simulation.steps.length]);

  const addKey = () => {
    const parsed = parseInteger(pendingKey);
    if (parsed === null) {
      return;
    }
    setInsertSequence((prev) => [...prev, parsed]);
    setPendingKey("");
  };

  const resetDemo = () => {
    setInsertSequence(DEFAULT_SEQUENCE);
    setStepIndex(0);
    setIsPlaying(false);
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-2xl font-semibold">B+Tree Simulator MVP</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
        Control fan-out parameters, add keys, and replay each insertion step.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          Max leaf keys
          <input
            className="rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            type="number"
            min={2}
            value={maxLeafKeys}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              if (!Number.isNaN(value) && value >= 2) {
                setMaxLeafKeys(value);
              }
            }}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Max internal keys
          <input
            className="rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            type="number"
            min={2}
            value={maxInternalKeys}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value, 10);
              if (!Number.isNaN(value) && value >= 2) {
                setMaxInternalKeys(value);
              }
            }}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          placeholder="Insert key"
          value={pendingKey}
          onChange={(event) => setPendingKey(event.target.value)}
        />
        <button
          className="rounded bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          type="button"
          onClick={addKey}
        >
          Add key
        </button>
        <button
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          type="button"
          onClick={resetDemo}
        >
          Reset demo
        </button>
      </div>

      <div className="mt-6 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
            type="button"
            onClick={() => setStepIndex(0)}
          >
            First
          </button>
          <button
            className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
            type="button"
            onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
          >
            Prev
          </button>
          <button
            className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
            type="button"
            onClick={() => setStepIndex((current) => Math.min(simulation.steps.length - 1, current + 1))}
          >
            Next
          </button>
          <button
            className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
            type="button"
            onClick={() => setIsPlaying((current) => !current)}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Step {safeStepIndex + 1}/{simulation.steps.length}: {activeStep.label}
          </span>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          {activeStep.explanation}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-medium">Tree visualization (by levels)</h3>
        {levels.map((nodes, level) => (
          <div key={`level-${level}`} className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Level {level}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {nodes.map((keys, index) => (
                <div
                  key={`node-${level}-${index}`}
                  className="rounded bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                >
                  [{keys.join(", ")}]
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-lg font-medium">Search path explanation</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="rounded border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            value={searchKey}
            onChange={(event) => setSearchKey(event.target.value)}
            placeholder="Search key"
          />
        </div>
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          {searchPath.length === 0 ? (
            <span>Enter an integer key to inspect route.</span>
          ) : (
            <span>{searchPath.map((keys) => `[${keys.join(", ")}]`).join(" -> ")}</span>
          )}
        </div>
      </div>
    </section>
  );
}
