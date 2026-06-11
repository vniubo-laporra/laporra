"use client";

import { useEffect, useState } from "react";

export default function AdminStatsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        Carregant estadistiques...
      </main>
    );
  }

  const inaugural = stats.inaugural;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <a
          href="/admin/submissions"
          className="mb-6 inline-block rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 hover:bg-slate-900"
        >
          Tornar a admin
        </a>

        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
            Estadistiques
          </p>
          <h1 className="text-4xl font-black">Prediccions validades</h1>
          <p className="mt-2 text-slate-300">
            Total validades: <b>{stats.total}</b>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-2 text-2xl font-black text-yellow-300">
              Partit inaugural
            </h2>

            <p className="mb-6 text-slate-300">
              {inaugural.home} - {inaugural.away}
            </p>

            <div className="space-y-4">
              {[
                { key: "1", label: `1 - Guanya ${inaugural.home}` },
                { key: "X", label: "X - Empat" },
                { key: "2", label: `2 - Guanya ${inaugural.away}` },
              ].map((row) => (
                <div key={row.key}>
                  <div className="mb-1 flex justify-between text-sm font-bold">
                    <span>{row.label}</span>
                    <span>
                      {inaugural.counts[row.key]} vots · {inaugural.percentages[row.key]}%
                    </span>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${inaugural.percentages[row.key]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-red-950/40 border border-red-800 p-4">
              <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-red-300">
                Apostes valentes al 2
              </p>

              {stats.awayWinUsers.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Ningú ha apostat per Sud-àfrica.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {stats.awayWinUsers.map((name: string) => (
                    <span
                      key={name}
                      className="rounded-xl bg-red-900/60 px-3 py-2 text-sm font-black text-red-200"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-4 font-mono text-sm text-slate-300">
              1: {inaugural.percentages["1"]}% · X: {inaugural.percentages["X"]}% · 2: {inaugural.percentages["2"]}%
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-black text-yellow-300">
              Campions pronosticats
            </h2>

            {stats.champions.length === 0 ? (
              <p className="text-slate-400">
                Encara no hi ha campions detectables amb advancer a la final.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.champions.map((row: any, index: number) => (
                  <div
                    key={row.team}
                    className="flex items-center justify-between rounded-2xl bg-slate-950 p-4"
                  >
                    <div>
                      <span className="mr-3 font-black text-slate-500">
                        #{index + 1}
                      </span>
                      <span className="font-black">{row.team}</span>
                    </div>

                    <div className="font-black text-yellow-300">
                      {row.count} · {row.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-black text-yellow-300">
            Prediccions Espanya
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(stats.spainStats).map(([round, count]: any) => (
              <div
                key={round}
                className="flex items-center justify-between rounded-2xl bg-slate-950 p-4"
              >
                <span className="font-bold text-slate-300">
                  {round}
                </span>

                <span className="font-black text-yellow-300">
                  {count} usuaris
                </span>
              </div>
            ))}
          </div>
        </div>
</div>
      </section>
    </main>
  );
}