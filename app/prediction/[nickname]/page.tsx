"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GROUPS } from "@/lib/groupsData";
import { getThirdPlaceBracket } from "@/lib/thirdPlaceMatrix";

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

function resultStatus(predicted: any, realScore: any) {
  if (!realScore || realScore.home === undefined || realScore.away === undefined || realScore.home === "" || realScore.away === "") {
    return "pending";
  }

  if (!predicted || predicted.home === undefined || predicted.away === undefined || predicted.home === "" || predicted.away === "") {
    return "wrong";
  }

  const ph = Number(predicted.home);
  const pa = Number(predicted.away);
  const rh = Number(realScore.home);
  const ra = Number(realScore.away);

  if (ph === rh && pa === ra) return "exact";

  const po = ph > pa ? "1" : ph < pa ? "2" : "X";
  const ro = rh > ra ? "1" : rh < ra ? "2" : "X";

  if (po === ro) return "outcome";

  return "wrong";
}

function resultClass(status: string) {
  if (status === "exact") return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
  if (status === "outcome") return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40";
  if (status === "wrong") return "bg-red-500/20 text-red-300 border border-red-500/40";
  return "bg-slate-900 text-slate-400 border border-slate-800";
}

function GroupsView({ item }: any) {
  const groups = item.groupTables || {};

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, table]: any) => (
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
                {table.map((row: any, index: number) => (
                  <tr key={row.team} className="border-t border-slate-800">
                    <td className="py-2 font-bold text-slate-500">{index + 1}</td>
                    <td className="py-2 font-bold">{row.team}</td>
                    <td className="py-2 text-center font-black text-yellow-300">{row.points}</td>
                    <td className="py-2 text-center text-slate-300">{row.goalsFor}</td>
                    <td className="py-2 text-center text-slate-300">{row.goalDiff > 0 ? "+" : ""}{row.goalDiff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
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


function getWinner(match: any, scores: any) {
  if (!match || !match.home || !match.away) return null;

  const s = scores[match.id];
  if (!s || s.home === "" || s.away === "" || s.home === undefined || s.away === undefined) return null;

  const h = Number(s.home);
  const a = Number(s.away);

  if (h > a) return match.home;
  if (a > h) return match.away;

  return s.advancer || null;
}

function getLoser(match: any, scores: any) {
  const winner = getWinner(match, scores);
  if (!match || !winner) return null;
  return winner === match.home ? match.away : match.home;
}

function resolveSlot(slot: string, tables: any) {
  const pos = Number(slot[0]) - 1;
  const group = slot[1];
  return tables[group]?.[pos]?.team || null;
}

function getQualifiedThirdGroups(tables: any) {
  return Object.entries(tables)
    .map(([group, table]: any) => {
      const third = table?.[2];
      if (!third) return null;
      return { group, ...third };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return String(a.group).localeCompare(String(b.group));
    })
    .slice(0, 8)
    .map((x: any) => x.group);
}

function buildBracket(tables: any, scores: any) {
  const thirdGroups = getQualifiedThirdGroups(tables);

  if (thirdGroups.length < 8) return [];

  let matrix: any = null;

  try {
    matrix = getThirdPlaceBracket(thirdGroups).pairings;
  } catch {
    return [];
  }

  const round32 = [
    { id: "M73", round: "Setzens", home: resolveSlot("2A", tables), away: resolveSlot("2B", tables) },
    { id: "M74", round: "Setzens", home: resolveSlot("1E", tables), away: resolveSlot(matrix["1E"], tables) },
    { id: "M75", round: "Setzens", home: resolveSlot("1F", tables), away: resolveSlot("2C", tables) },
    { id: "M76", round: "Setzens", home: resolveSlot("1C", tables), away: resolveSlot("2F", tables) },
    { id: "M77", round: "Setzens", home: resolveSlot("1I", tables), away: resolveSlot(matrix["1I"], tables) },
    { id: "M78", round: "Setzens", home: resolveSlot("2E", tables), away: resolveSlot("2I", tables) },
    { id: "M79", round: "Setzens", home: resolveSlot("1A", tables), away: resolveSlot(matrix["1A"], tables) },
    { id: "M80", round: "Setzens", home: resolveSlot("1L", tables), away: resolveSlot(matrix["1L"], tables) },
    { id: "M81", round: "Setzens", home: resolveSlot("1D", tables), away: resolveSlot(matrix["1D"], tables) },
    { id: "M82", round: "Setzens", home: resolveSlot("1G", tables), away: resolveSlot(matrix["1G"], tables) },
    { id: "M83", round: "Setzens", home: resolveSlot("2K", tables), away: resolveSlot("2L", tables) },
    { id: "M84", round: "Setzens", home: resolveSlot("1H", tables), away: resolveSlot("2J", tables) },
    { id: "M85", round: "Setzens", home: resolveSlot("1B", tables), away: resolveSlot(matrix["1B"], tables) },
    { id: "M86", round: "Setzens", home: resolveSlot("1J", tables), away: resolveSlot("2H", tables) },
    { id: "M87", round: "Setzens", home: resolveSlot("1K", tables), away: resolveSlot(matrix["1K"], tables) },
    { id: "M88", round: "Setzens", home: resolveSlot("2D", tables), away: resolveSlot("2G", tables) },
  ];

  const byId = (list: any[], id: string) => list.find((m) => m.id === id);

  const r16 = [
    { id: "M89", round: "Vuitens", home: getWinner(byId(round32, "M74"), scores), away: getWinner(byId(round32, "M77"), scores) },
    { id: "M90", round: "Vuitens", home: getWinner(byId(round32, "M73"), scores), away: getWinner(byId(round32, "M75"), scores) },
    { id: "M91", round: "Vuitens", home: getWinner(byId(round32, "M76"), scores), away: getWinner(byId(round32, "M78"), scores) },
    { id: "M92", round: "Vuitens", home: getWinner(byId(round32, "M79"), scores), away: getWinner(byId(round32, "M80"), scores) },
    { id: "M93", round: "Vuitens", home: getWinner(byId(round32, "M83"), scores), away: getWinner(byId(round32, "M84"), scores) },
    { id: "M94", round: "Vuitens", home: getWinner(byId(round32, "M81"), scores), away: getWinner(byId(round32, "M82"), scores) },
    { id: "M95", round: "Vuitens", home: getWinner(byId(round32, "M86"), scores), away: getWinner(byId(round32, "M88"), scores) },
    { id: "M96", round: "Vuitens", home: getWinner(byId(round32, "M85"), scores), away: getWinner(byId(round32, "M87"), scores) },
  ];

  const quarters = [
    { id: "M97", round: "Quarts", home: getWinner(byId(r16, "M89"), scores), away: getWinner(byId(r16, "M90"), scores) },
    { id: "M98", round: "Quarts", home: getWinner(byId(r16, "M93"), scores), away: getWinner(byId(r16, "M94"), scores) },
    { id: "M99", round: "Quarts", home: getWinner(byId(r16, "M91"), scores), away: getWinner(byId(r16, "M92"), scores) },
    { id: "M100", round: "Quarts", home: getWinner(byId(r16, "M95"), scores), away: getWinner(byId(r16, "M96"), scores) },
  ];

  const semis = [
    { id: "M101", round: "Semifinals", home: getWinner(byId(quarters, "M97"), scores), away: getWinner(byId(quarters, "M98"), scores) },
    { id: "M102", round: "Semifinals", home: getWinner(byId(quarters, "M99"), scores), away: getWinner(byId(quarters, "M100"), scores) },
  ];

  const thirdPlace = [
    { id: "M103", round: "3r i 4t lloc", home: getLoser(byId(semis, "M101"), scores), away: getLoser(byId(semis, "M102"), scores) },
  ];

  const final = [
    { id: "M104", round: "Final", home: getWinner(byId(semis, "M101"), scores), away: getWinner(byId(semis, "M102"), scores) },
  ];

  return [...round32, ...r16, ...quarters, ...semis, ...thirdPlace, ...final];
}
function KnockoutView({ item }: any) {
  const knockout = item.knockout || {};
  const tables = item.groupTables || {};
  const bracket = buildBracket(tables, knockout);

  const rounds = ["Setzens", "Vuitens", "Quarts", "Semifinals", "3r i 4t lloc", "Final"];

  if (!bracket.length) {
    return <p className="text-slate-400">No es pot reconstruir el quadre eliminatori.</p>;
  }

  return (
    <div className="space-y-6">
      {rounds.map((round) => (
        <div key={round} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="mb-3 text-lg font-black text-yellow-300">{round}</h3>

          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 text-left">Partit</th>
                <th className="pb-3 text-left">Equip 1</th>
                <th className="pb-3 text-center">Resultat</th>
                <th className="pb-3 text-left">Equip 2</th>
                <th className="pb-3 text-left">Passa</th>
              </tr>
            </thead>

            <tbody>
              {bracket
                .filter((m: any) => m.round === round)
                .map((match: any) => {
                  const score = knockout[match.id] || {};
                  const winner = getWinner(match, knockout);

                  return (
                    <tr key={match.id} className="border-t border-slate-800">
                      <td className="py-3 font-bold text-slate-500">{match.id}</td>
                      <td className="py-3 font-bold">{match.home || "Pendent"}</td>
                      <td className="py-3 text-center font-black">
                        {score.home ?? "-"} - {score.away ?? "-"}
                      </td>
                      <td className="py-3 font-bold">{match.away || "Pendent"}</td>
                      <td className="py-3 font-bold text-emerald-300">{winner || "-"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ))}
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
          <a href="/" className="mt-6 inline-block rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black">Tornar a la classificacio</a>
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
          <p className="mb-2 text-sm font-black uppercase tracking-[0.35em] text-yellow-300">Prediccio publica</p>
          <h1 className="text-4xl font-black">{item.nickname}</h1>
          <p className="mt-2 text-slate-400">
            Enviada: {item.submittedAt ? new Date(item.submittedAt).toLocaleString("ca-AD") : "-"}
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-2xl font-black text-yellow-300">Classificacions de grup</h2>
            <GroupsView item={item} />
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