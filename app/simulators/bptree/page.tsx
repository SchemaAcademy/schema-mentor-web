import Link from "next/link";
import BPlusTreeSimulator from "@/app/components/BPlusTreeSimulator";

export default function BPlusTreePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 sm:px-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">B+Tree Interactive Simulator</h1>
          <Link
            href="/"
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Back to home
          </Link>
        </div>
        <p className="max-w-3xl text-zinc-600 dark:text-zinc-300">
          Explore insertion, split behavior, playback timeline, and search routing
          in an interactive B+Tree model.
        </p>
        <BPlusTreeSimulator />
      </main>
    </div>
  );
}
