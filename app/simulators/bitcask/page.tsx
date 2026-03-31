import Link from "next/link";
import BitcaskPocPanel from "@/app/components/BitcaskPocPanel";

export default function BitcaskSimulatorPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 sm:px-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Bitcask POC</h1>
          <Link
            href="/simulators"
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            All simulators
          </Link>
        </div>
        <p className="max-w-3xl text-zinc-600 dark:text-zinc-300">
          Log-structured hash table: writes append to a byte log; reads use an in-memory keydir pointing at
          value offsets. Tombstones remove keys on replay. The on-disk variant lives in{" "}
          <code className="text-sm">lib/bitcask.ts</code> for Node tests.
        </p>
        <BitcaskPocPanel />
      </main>
    </div>
  );
}
