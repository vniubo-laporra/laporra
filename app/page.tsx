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
        <div><b>Finalista:</b> 30 punts</div>
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

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Nickname</th>
                  <th className="p-3 text-center">Punts totals</th>
                  <th className="p-3 text-center">1X2 grups</th>
                  <th className="p-3 text-center">Gols equip grups</th>
                  <th className="p-3 text-center">Punts equip grup</th>
                  <th className="p-3 text-center">Gols totals equip grup</th>
                  <th className="p-3 text-center">Classificat 1r/2n</th>
                  <th className="p-3 text-center">Tercers classificats</th>
                  <th className="p-3 text-center">Gols setzens</th>
                  <th className="p-3 text-center">Classificat 8ens</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((row, index) => (
                  <tr key={row.nickname} className="border-t border-slate-800">
                    <td className="p-3 font-black text-slate-400">{index + 1}</td>

                    <td className="p-3 font-black text-yellow-300">
                      <a href={`/prediction/${encodeURIComponent(row.nickname)}`} className="hover:underline">
                        {row.nickname}
                      </a>
                    </td>

                    <td className="p-3 text-center text-xl font-black text-white">{row.total}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.punts1x2}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsExactesEquip}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsTotalsEquipGrup}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsTotalsEquipGrup}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsClassificatPrimerSegon}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsTercersClassificats}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsGolsSetzens}</td>
                    <td className="p-3 text-center font-bold text-slate-300">{row.puntsClassificatVuitens}</td>
                  </tr>
                ))}

                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-slate-400">
                      Encara no hi ha prediccions validades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16">
          <RulesBox />
        </div>
      </section>
    </main>
  );
}