import Link from "next/link";
import { getSimulatorIndexItems } from "@/lib/simulators";

export default function SimulatorsIndexPage() {
  const items = getSimulatorIndexItems();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 sm:px-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Simulators</h1>
          <Link
            href="/"
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            Back to home
          </Link>
        </div>
        <p className="max-w-3xl text-zinc-600 dark:text-zinc-300">
          Choose a simulator to explore storage engine internals.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.route}
              className="rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="text-lg font-semibold">{item.label}</div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Open simulator module and replay teaching steps.
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

