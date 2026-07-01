"use client";

import { useEffect, useState } from "react";
import { WORLD_CUP_GROUP_MATCHES } from "@/lib/worldCupSchedule";

function CountdownBox() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextMatch = WORLD_CUP_GROUP_MATCHES
    .map((match) => ({ ...match, date: new Date(match.kickoff) }))
    .filter((match) => match.date.getTime() > now.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  if (!nextMatch) return null;

  const diff = Math.max(0, nextMatch.date.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-4">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
        Proper partit
      </p>

      <h2 className="text-lg font-black text-white">
        Grup {nextMatch.group}
      </h2>

      <p className="mt-1 text-sm font-bold text-slate-200">
        {nextMatch.home} - {nextMatch.away}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {nextMatch.date.toLocaleString("ca-AD")}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-slate-950 p-3">
          <div className="text-xl font-black text-yellow-300">{days}</div>
          <div className="text-[10px] font-bold text-slate-400">dies</div>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3">
          <div className="text-xl font-black text-yellow-300">{hours}</div>
          <div className="text-[10px] font-bold text-slate-400">hores</div>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3">
          <div className="text-xl font-black text-yellow-300">{minutes}</div>
          <div className="text-[10px] font-bold text-slate-400">min</div>
        </div>
        <div className="rounded-2xl bg-slate-950 p-3">
          <div className="text-xl font-black text-yellow-300">{seconds}</div>
          <div className="text-[10px] font-bold text-slate-400">seg</div>
        </div>
      </div>
    </div>
  );
}

function RulesBox() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-3xl font-black text-yellow-300">
        Normativa de puntuacions
      </h2>

      <div className="grid gap-2 text-sm text-slate-300 md:grid-cols-2">
        <div><b>1X2 fase de grups:</b> 3 punts</div>
        <div><b>Gols un equip fase grups:</b> 2 punts</div>
        <div><b>Resultat exacte fase grups:</b> 7 punts totals</div>
        <div><b>Primer de grup:</b> 6 punts</div>
        <div><b>Segon de grup:</b> 6 punts</div>
        <div><b>Tercer de grup:</b> 3 punts</div>
        <div><b>Tercer en posicio correcta del quadre:</b> 3 punts extra</div>
        <div><b>Total punts equip fase grups:</b> 4 punts</div>
        <div><b>Total gols equip fase grups:</b> 4 punts</div>
        <div><b>Gols un equip a setzens:</b> 4 punts</div>
        <div><b>Classificat a vuitens:</b> 6 punts</div>
        <div><b>Classificat a vuitens en posicio correcta:</b> 6 punts</div>
        <div><b>Gols d'un equip a vuitens:</b> 6 punts</div>
        <div><b>Classificat a quarts:</b> 9 punts</div>
        <div><b>Classificat a quarts en posicio correcta:</b> 9 punts</div>
        <div><b>Gols d'un equip a quarts:</b> 8 punts</div>
        <div><b>Semifinalista:</b> 12 punts</div>
        <div><b>Semifinalista en posicio correcta:</b> 12 punts</div>
        <div><b>Gols d'un equip a semifinal / 3r i 4t lloc:</b> 12 punts</div>
        <div><b>Finalista:</b> 16 punts + 16 punts si és en posició correcta</div>
        <div><b>Gols d'un equip a la final:</b> 25 punts</div>
        <div><b>4t classificat:</b> 25 punts</div>
        <div><b>3r classificat:</b> 30 punts</div>
        <div><b>Subcampio:</b> 40 punts</div>
        <div><b>Campio:</b> 60 punts</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then(setLeaderboard);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
              <style>{`
          .leaderboard-table {
            width: max-content;
            min-width: 0;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
            font-size: 11px;
          }

          .leaderboard-table th,
          .leaderboard-table td {
            width: 42px;
            min-width: 42px;
            max-width: 42px;
            padding: 6px 4px;
            text-align: center;
            line-height: 1.1;
            white-space: normal;
          }

          .leaderboard-table th:nth-child(1),
          .leaderboard-table td:nth-child(1) {
            position: sticky;
            left: 0;
            z-index: 30;
            width: 38px;
            min-width: 38px;
            max-width: 38px;
            background: rgb(2 6 23);
          }

          .leaderboard-table th:nth-child(2),
          .leaderboard-table td:nth-child(2) {
            position: sticky;
            left: 38px;
            z-index: 25;
            width: max-content;
            min-width: max-content;
            max-width: none;
            white-space: nowrap;
            text-align: left;
            background: rgb(2 6 23);
            box-shadow: 8px 0 12px -10px rgba(0,0,0,.8);
          }

          .leaderboard-table th:nth-child(3),
          .leaderboard-table td:nth-child(3) {
            width: 50px;
            min-width: 50px;
            max-width: 50px;
            font-weight: 900;
          }

          .leaderboard-table th {
            font-size: 10px;
            vertical-align: bottom;
          }

          .leaderboard-table td {
            font-size: 12px;
          }
        `}</style>
        <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <a href="/identify" className="block overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
            <img
              src="/hero-laporra.png"
              alt="laporra.ad"
              className="w-full cursor-pointer"
            />
          </a>

          <aside className="h-fit lg:sticky lg:top-6">
            <CountdownBox />
          </aside>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-2 text-3xl font-black text-yellow-300">
            Classificacio
          </h2>

          <p className="mb-6 text-slate-300">
            Nomes compten les prediccions validades per l'administrador.
          </p>

          <div className="overflow-x-auto [&_table]:border-separate [&_table]:border-spacing-0 rounded-2xl border border-slate-800">
            <div className="overflow-x-auto [&_table]:border-separate [&_table]:border-spacing-0 rounded-3xl border border-slate-800">
              <table className="min-w-[1900px] w-full min-w-[1100px] text-sm leaderboard-table">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="sticky left-0 z-20 bg-slate-900 shadow-[8px_0_12px_-8px_rgba(0,0,0,.6)] p-3 text-left">#</th>
                  <th className="sticky left-12 z-30 whitespace-nowrap px-3 bg-slate-900 shadow-[8px_0_12px_-8px_rgba(0,0,0,.6)] p-3 text-left">Nickname</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Punts totals</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">1X2 grups</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Gols equip grups</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Punts equip grup</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Gols totals equip grup</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Classificat 1r/2n</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Tercers classificats</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Gols setzens</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Classificat 8ens</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Gols vuitens</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Classificat 4ts</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Gols quarts</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Classificat semis</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Gols semis</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Finalista</th>
                  <th className="w-10 min-w-10 p-1 text-center whitespace-nowrap">Gols 3r lloc</th>
                                  <th className="p-3 text-center">Gols final</th>
</tr>
              </thead>

              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={row.nickname} className="border-t border-slate-800">
                    <td className="sticky left-0 z-30 w-12 min-w-12 bg-slate-950 p-3 font-black text-slate-400">{index + 1}</td>

                    <td className="sticky left-12 z-20 whitespace-nowrap px-3 bg-slate-950 shadow-[8px_0_12px_-8px_rgba(0,0,0,.6)] p-3 font-black text-yellow-300">
                      <a href={`/prediction/${encodeURIComponent(row.nickname)}`} className="hover:underline">
                        {row.nickname}
                      </a>
                    </td>

                    <td className="w-12 min-w-12 p-1 text-center font-black text-white">{row.total}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.punts1x2}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsExactesEquip}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsTotalsEquipGrup}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsTotalsEquipGrup}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsClassificatPrimerSegon}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsTercersClassificats}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsSetzens}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsClassificatVuitens}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsVuitens}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsClassificatQuarts}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsQuarts}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsClassificatSemis}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsSemis}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsFinalistes}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGols3rLloc}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsFinal}</td>
                  </tr>
                ))}

                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={19} className="p-6 text-center text-slate-400">
                      Encara no hi ha prediccions validades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <RulesBox />
        </div>
      </section>
    </main>
  );
}