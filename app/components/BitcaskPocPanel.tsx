"use client";

import { useCallback, useMemo, useState } from "react";
import { BitcaskMemory } from "@/lib/bitcaskMemory";

export default function BitcaskPocPanel() {
  const store = useMemo(() => new BitcaskMemory(), []);

  const [key, setKey] = useState("demo-key");
  const [value, setValue] = useState("hello from bitcask");
  const [keys, setKeys] = useState<string[]>(() => store.listKeys());
  const [readValue, setReadValue] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshKeys = useCallback(() => {
    setKeys(store.listKeys());
  }, [store]);

  const handlePut = () => {
    setStatus(null);
    setError(null);
    setReadValue(null);
    try {
      store.put(key, value);
      setStatus(`Put OK: ${key}`);
      refreshKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "put failed");
    }
  };

  const handleGet = () => {
    setStatus(null);
    setError(null);
    const v = store.getValueUtf8(key);
    if (v === undefined) {
      setReadValue(null);
      setStatus(`Key not found: ${key}`);
      return;
    }
    setReadValue(v);
    setStatus(`Read OK: ${key}`);
  };

  const handleDelete = () => {
    setStatus(null);
    setError(null);
    setReadValue(null);
    store.delete(key);
    setStatus(`Delete applied: ${key}`);
    refreshKeys();
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-2xl font-semibold">Bitcask POC</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
        Append-only in-memory log with a keydir; same record layout as the Node{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">lib/bitcask</code>{" "}
        implementation (works with static export — no server API).
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Log size: {store.getLogByteLength()} bytes
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          Key
          <input
            className="rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm sm:col-span-2">
          Value (UTF-8, non-empty)
          <textarea
            className="min-h-[88px] rounded border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
          onClick={handlePut}
        >
          Put
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          onClick={handleGet}
        >
          Get
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          type="button"
          className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          onClick={refreshKeys}
        >
          Refresh keys
        </button>
      </div>

      {status ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{status}</p>
      ) : null}
      {readValue !== null ? (
        <div className="mt-3 rounded border border-zinc-200 p-3 text-sm dark:border-zinc-800">
          <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Value</div>
          <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-zinc-800 dark:text-zinc-100">
            {readValue}
          </pre>
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="mt-8">
        <h3 className="text-lg font-medium">Keys in keydir</h3>
        {keys.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No keys yet.</p>
        ) : (
          <ul className="mt-2 list-inside list-disc text-sm text-zinc-700 dark:text-zinc-200">
            {keys.map((k) => (
              <li key={k}>
                <button
                  type="button"
                  className="text-left underline decoration-zinc-400 underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-50"
                  onClick={() => setKey(k)}
                >
                  {k}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
