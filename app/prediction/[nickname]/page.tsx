"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GROUPS } from "@/lib/groupsData";

function getMatchInfo(group: string, matchId: string) {
  const teams = GROUPS[group];
  if (!teams) return null;

  const matches: any = {
    [`${group}1`]: { home: teams[0], away: teams[1] },
    [`${group}2`]: { home: teams[2], away: teams[3] },
    [`${group}3`]: { home: teams[0], away: teams[2] },
    [`${group}4`]: { home: teams[1], away: teams[3] },
    [`${group}5`]: { home: teams[0], away: teams[3] },
    [`${group}6`]: { home: teams[1], away: teams[2] },
  };

  return matches[matchId] || null;
}

function isCompleteScore(score: any) {
  return score && score.home !== undefined && score.away !== undefined && score.home !== "" && score.away !== "";
}

function isGroupComplete(real: any, group: string) {
  for (let i = 1; i <= 6; i++) {
    if (!isCompleteScore(real?.groups?.[group]?.[`${group}${i}`])) return false;
  }
  return true;
}

function resultStatus(predicted: any, realScore: any) {
  if (!isCompleteScore(realScore)) return "pending";
  if (!isCompleteScore(predicted)) return "wrong";

  const ph = Number(predicted.home);
  const pa = Number(predicted.away);
  const rh = Number(realScore.home);
  const ra = Number(realScore.away);

  const homeGoalOk = ph === rh;
  const awayGoalOk = pa === ra;
  const anyGoalOk = homeGoalOk || awayGoalOk;
  const bothGoalsOk = homeGoalOk && awayGoalOk;

  const po = ph > pa ? "1" : ph < pa ? "2" : "X";
  const ro = rh > ra ? "1" : rh < ra ? "2" : "X";
  const outcomeOk = po === ro;

  if (bothGoalsOk && outcomeOk) return "exact";
  if (outcomeOk && anyGoalOk) return "outcome_goal";
  if (outcomeOk && !anyGoalOk) return "outcome_only";
  if (!outcomeOk && anyGoalOk) return "goal_only";
  return "wrong";
}

function resultClass(status: string) {
  if (status === "exact") return "bg-emerald-800/80 text-emerald-100 border border-emerald-500";
  if (status === "outcome_goal") return "bg-lime-700/60 text-lime-100 border border-lime-500";
  if (status === "outcome_only") return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40";
  if (status === "goal_only") return "bg-red-400/20 text-red-200 border border-red-400/40";
  if (status === "wrong") return "bg-red-950/80 text-red-300 border border-red-800";
  return "bg-slate-900 text-slate-400 border border-slate-800";
}

function statClass(predictedValue: any, realValue: any, groupComplete: boolean) {
  if (!groupComplete) return "text-slate-300";
  return Number(predictedValue) === Number(realValue)
    ? "rounded-lg bg-emerald-500/20 px-2 py-1 font-black text-emerald-300"
    : "rounded-lg bg-red-500/20 px-2 py-1 font-black text-red-300";
}

function GroupsView({ item, real }: any) {
  const groups = item.groupTables || item.group_tables || {};
  const realTables = real.groupTables || real.group_tables || {};

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, table]: any) => {
          const groupComplete = isGroupComplete(real, group);
          const realTable = realTables[group] || [];

          return (
            <div key={group} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <h3 className="mb-3 text-lg font-black text-yellow-300">Grup {group}</h3>

              <table className="w-full text-xs">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-2 text-left">#</th>
                    <th className="pb-2 text-left">Equip</th>
                    <th className="pb-2 text-center">PTS</th>
                    <th className="pb-2 text-center">GF</th>
                    <th className="pb-2 text-center">DG</th>
                  </tr>
                </thead>

                <tbody>
                  {table.map((row: any, index: number) => {
                    const realRow = realTable.find((r: any) => r.team === row.team);

                    return (
                      <tr key={row.team} className="border-t border-slate-800">
                        <td className="py-2 font-bold text-slate-500">{index + 1}</td>
                        <td className="py-2 font-bold">{row.team}</td>

                        <td className="py-2 text-center">
                          <span className={statClass(row.points, realRow?.points, groupComplete)}>
                            {row.points}
                          </span>
                        </td>

                        <td className="py-2 text-center">
                          <span className={statClass(row.goalsFor, realRow?.goalsFor, groupComplete)}>
                            {row.goalsFor}
                          </span>
                        </td>

                        <td className="py-2 text-center text-slate-300">
                          {row.goalDiff > 0 ? "+" : ""}
                          {row.goalDiff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!groupComplete && (
                <p className="mt-3 text-xs text-slate-500">
                  PTS i GF es marcaran quan el grup real estigui complet.
                </p>
              )}
            </div>
          );
        })}
    </div>
  );
}

function GroupScoresView({ item, real }: any) {
  const groups = item.groups || {};

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, matches]: any) => (
          <div key={group} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <h3 className="mb-3 text-lg font-black text-yellow-300">Resultats Grup {group}</h3>

            <div className="space-y-2 text-sm">
              {Object.entries(matches)
                .sort(([a], [b]) => {
                  const na = parseInt(a.replace(group, ""));
                  const nb = parseInt(b.replace(group, ""));
                  return na - nb;
                })
                .map(([matchId, score]: any) => {
                  const info = getMatchInfo(group, matchId);
                  const realScore = real?.groups?.[group]?.[matchId];
                  const status = resultStatus(score, realScore);

                  return (
                    <div key={matchId} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-slate-800 pb-2 last:border-b-0">
                      <span className="text-right font-bold text-slate-300">{info?.home || matchId}</span>
                      <span className={`rounded-xl px-3 py-1 font-black ${resultClass(status)}`}>
                        {score.home ?? "-"} - {score.away ?? "-"}
                      </span>
                      <span className="font-bold text-slate-300">{info?.away || ""}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
    </div>
  );
}

function KnockoutView({ item }: any) {
  const knockout = item.knockout || {};
  const matches = Object.entries(knockout);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <table className="w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="pb-3 text-left">Partit</th>
            <th className="pb-3 text-center">Resultat</th>
            <th className="pb-3 text-left">Passa</th>
          </tr>
        </thead>

        <tbody>
          {matches.map(([matchId, score]: any) => (
            <tr key={matchId} className="border-t border-slate-800">
              <td className="py-3 font-bold text-yellow-300">{matchId}</td>
              <td className="py-3 text-center font-black">{score.home ?? "-"} - {score.away ?? "-"}</td>
              <td className="py-3 font-bold text-emerald-300">{score.advancer || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PublicPredictionPage() {
  const params = useParams();
  const nickname = decodeURIComponent(String(params.nickname || ""));

  const [item, setItem] = useState<any>(null);
  const [real, setReal] = useState<any>({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/real-results")
      .then((res) => res.json())
      .then(setReal);

    fetch(`/api/public-prediction?nickname=${encodeURIComponent(nickname)}`)
      .then((res) => {
        if (!res.ok) throw new Error("not-found");
        return res.json();
      })
      .then(setItem)
      .catch(() => setError("Prediccio no trobada o no validada."));
  }, [nickname]);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-black text-red-300">{error}</h1>
          <a href="/" className="mt-6 inline-block rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black">
            Tornar a la classificacio
          </a>
        </section>
      </main>
    );
  }

  if (!item) {
    return <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">Carregant...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <a href="/" className="mb-6 inline-block rounded-2xl border border-slate-700 px-5 py-3 font-bold text-slate-300 hover:bg-slate-900">
          Tornar a la classificacio
        </a>

        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
            Prediccio publica
          </p>
          <h1 className="text-4xl font-black">{item.nickname}</h1>
          <p className="mt-2 text-slate-400">
            Enviada: {item.submittedAt ? new Date(item.submittedAt).toLocaleString("ca-AD") : "-"}
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-2xl font-black text-yellow-300">Classificacions de grup</h2>
            <GroupsView item={item} real={real} />
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-yellow-300">Resultats fase de grups</h2>
            <GroupScoresView item={item} real={real} />
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-yellow-300">Eliminatories</h2>
            <KnockoutView item={item} />
          </section>
        </div>
      </section>
    </main>
  );
}