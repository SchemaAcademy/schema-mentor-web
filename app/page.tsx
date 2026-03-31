import Link from "next/link";
import { getSimulatorRoute } from "@/lib/simulators";

export default function Home() {
  const bptreeRoute = getSimulatorRoute("bptree");
  const bitcaskRoute = getSimulatorRoute("bitcask");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-20 sm:px-10">
        <h1 className="text-4xl font-semibold tracking-tight">SchemaMentor</h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          An interactive learning product for database internals. The first
          milestone focuses on storage engines such as B+Tree, LSM Tree, and
          WAL recovery simulations.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold">Storage Engine Simulators</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            B+Tree for insertions and search routing; Bitcask for an append-only KV log and keydir POC.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={bptreeRoute}
              className="inline-flex rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Open B+Tree simulator
            </Link>
            <Link
              href={bitcaskRoute}
              className="inline-flex rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Open Bitcask POC
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
