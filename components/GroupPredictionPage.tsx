"use client";

import { useEffect, useMemo, useState } from "react";
import { GROUPS, GROUP_LETTERS } from "@/lib/groupsData";

function buildMatches(group: string) {
  const teams = GROUPS[group];

  const matches: any[] = [
    { id: `${group}1`, home: teams[0], away: teams[1] },
    { id: `${group}2`, home: teams[2], away: teams[3] },
    { id: `${group}3`, home: teams[0], away: teams[2] },
    { id: `${group}4`, home: teams[1], away: teams[3] },
    { id: `${group}5`, home: teams[0], away: teams[3] },
    { id: `${group}6`, home: teams[1], away: teams[2] },
  ];

  const visualOrder: any = {
    B: ["B5", "B6", "B1", "B2", "B3", "B4"],
    E: ["E1", "E2", "E5", "E6", "E3", "E4"],
    F: ["F1", "F2", "F5", "F6", "F3", "F4"],
    K: ["K5", "K6", "K1", "K2", "K3", "K4"],
  };

  const order = visualOrder[group];

  if (!order) return matches;

  return order
    .map((id: string) => matches.find((match) => match.id === id))
    .filter(Boolean);
}
function allMatchesCompleted(matches: any[], scores: any) {
  return matches.every(
    (m) =>
      scores[m.id]?.home !== undefined &&
      scores[m.id]?.home !== "" &&
      scores[m.id]?.away !== undefined &&
      scores[m.id]?.away !== ""
  );
}

function calculateBaseStats(group: string, matches: any[], scores: any) {
  const table: any = {};

  GROUPS[group].forEach((team: string) => {
    table[team] = {
      team,
      played: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
    };
  });

  matches.forEach((match) => {
    const hs = scores[match.id]?.home;
    const as = scores[match.id]?.away;

    if (hs === undefined || as === undefined || hs === "" || as === "") return;

    const h = Number(hs);
    const a = Number(as);

    table[match.home].played++;
    table[match.away].played++;

    table[match.home].goalsFor += h;
    table[match.home].goalsAgainst += a;

    table[match.away].goalsFor += a;
    table[match.away].goalsAgainst += h;

    if (h > a) {
      table[match.home].points += 3;
    } else if (a > h) {
      table[match.away].points += 3;
    } else {
      table[match.home].points += 1;
      table[match.away].points += 1;
    }
  });

  return Object.values(table).map((t: any) => ({
    ...t,
    goalDiff: t.goalsFor - t.goalsAgainst,
  }));
}

function headToHeadStats(team: string, tiedTeams: string[], matches: any[], scores: any) {
  let points = 0;
  let gf = 0;
  let ga = 0;

  matches.forEach((match) => {
    if (!tiedTeams.includes(match.home) || !tiedTeams.includes(match.away)) return;

    const hs = scores[match.id]?.home;
    const as = scores[match.id]?.away;

    if (hs === undefined || as === undefined || hs === "" || as === "") return;

    const h = Number(hs);
    const a = Number(as);

    if (match.home === team) {
      gf += h;
      ga += a;
      if (h > a) points += 3;
      else if (h === a) points += 1;
    }

    if (match.away === team) {
      gf += a;
      ga += h;
      if (a > h) points += 3;
      else if (h === a) points += 1;
    }
  });

  return { points, goalDiff: gf - ga, goalsFor: gf };
}

function calculateTable(group: string, matches: any[], scores: any) {
  const base = calculateBaseStats(group, matches, scores);

  const sorted = [...base].sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;

    const tiedTeams = base
      .filter((t: any) => t.points === a.points)
      .map((t: any) => t.team);

    const ah = headToHeadStats(a.team, tiedTeams, matches, scores);
    const bh = headToHeadStats(b.team, tiedTeams, matches, scores);

    if (bh.points !== ah.points) return bh.points - ah.points;
    if (bh.goalDiff !== ah.goalDiff) return bh.goalDiff - ah.goalDiff;
    if (bh.goalsFor !== ah.goalsFor) return bh.goalsFor - ah.goalsFor;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    return 0;
  });

  const unresolvedTies: string[][] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a: any = sorted[i];
    const b: any = sorted[i + 1];

    if (a.points !== b.points) continue;

    const tiedTeams = base
      .filter((t: any) => t.points === a.points)
      .map((t: any) => t.team);

    const ah = headToHeadStats(a.team, tiedTeams, matches, scores);
    const bh = headToHeadStats(b.team, tiedTeams, matches, scores);

    const stillTied =
      ah.points === bh.points &&
      ah.goalDiff === bh.goalDiff &&
      ah.goalsFor === bh.goalsFor &&
      a.goalDiff === b.goalDiff &&
      a.goalsFor === b.goalsFor;

    if (stillTied) {
      const tie = [a.team, b.team].sort();
      if (!unresolvedTies.some((g) => JSON.stringify(g) === JSON.stringify(tie))) {
        unresolvedTies.push(tie);
      }
    }
  }

  return { table: sorted, unresolvedTies };
}

function ThirdPlacesRanking({ currentGroup, currentTable }: any) {
  const [savedTables, setSavedTables] = useState<any>({});

  useEffect(() => {
    setSavedTables(JSON.parse(localStorage.getItem("laporra_group_tables") || "{}"));
  }, [currentGroup, currentTable]);

  const allTables = {
    ...savedTables,
    [currentGroup]: currentTable,
  };

  const thirds = Object.entries(allTables)
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
      return 0;
    });

  return (
    <div className="mt-8 rounded-3xl border border-yellow-500/40 bg-slate-950 p-4">
      <h3 className="mb-2 text-xl font-black text-yellow-300">
        Classificacio dels tercers
      </h3>

      <p className="mb-4 text-sm text-slate-300">
        Es classifiquen els 8 millors tercers. El tall esta marcat al 8e lloc.
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-xs">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Grup</th>
              <th className="p-2 text-left">Equip</th>
              <th className="p-2 text-center">PTS</th>
              <th className="p-2 text-center">DG</th>
              <th className="p-2 text-center">GF</th>
            </tr>
          </thead>

          <tbody>
            {thirds.map((row: any, index: number) => (
              <tr
                key={row.group}
                className={`border-t border-slate-800 ${
                  index < 8 ? "bg-emerald-500/10" : "bg-red-500/10"
                } ${index === 7 ? "border-b-4 border-b-yellow-400" : ""}`}
              >
                <td className="p-2 font-black">{index + 1}</td>
                <td className="p-2 font-bold text-yellow-300">{row.group}</td>
                <td className="p-2 font-bold">{row.team}</td>
                <td className="p-2 text-center font-black text-yellow-300">{row.points}</td>
                <td className="p-2 text-center">{row.goalDiff > 0 ? "+" : ""}{row.goalDiff}</td>
                <td className="p-2 text-center">{row.goalsFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-bold text-emerald-300">
          Dins dels 8 millors tercers
        </span>
        <span className="rounded-full bg-red-500/20 px-3 py-1 font-bold text-red-300">
          Fora del tall
        </span>
        <span className="rounded-full bg-yellow-500/20 px-3 py-1 font-bold text-yellow-300">
          Tall: 8e classificat
        </span>
      </div>
    </div>
  );
}

export default function GroupPredictionPage({ group }: { group: string }) {
  const [nickname, setNickname] = useState("");
  const [scores, setScores] = useState<any>({});
  const [saved, setSaved] = useState(false);

  const matches = useMemo(() => buildMatches(group), [group]);
  const { table, unresolvedTies } = calculateTable(group, matches, scores);

  const completed = allMatchesCompleted(matches, scores);
  const canContinue = completed && unresolvedTies.length === 0;

  const currentIndex = GROUP_LETTERS.indexOf(group);
  const previousGroup = GROUP_LETTERS[currentIndex - 1];
  const nextGroup = GROUP_LETTERS[currentIndex + 1];

  useEffect(() => {
    const storedName = localStorage.getItem("laporra_nickname");

    if (!storedName) {
      window.location.href = "/identify";
      return;
    }

    setNickname(storedName);

    const storedScores = JSON.parse(localStorage.getItem("laporra_group_scores") || "{}");
    setScores(storedScores[group] || {});
  }, [group]);

  function updateScore(matchId: string, side: "home" | "away", value: string) {
    const onlyNumbers = value.replace(/[^0-9]/g, "");

    const updated = {
      ...scores,
      [matchId]: {
        ...scores[matchId],
        [side]: onlyNumbers,
      },
    };

    const calculated = calculateTable(group, matches, updated);

    setScores(updated);
    setSaved(false);

    const oldScores = JSON.parse(localStorage.getItem("laporra_group_scores") || "{}");
    localStorage.setItem(
      "laporra_group_scores",
      JSON.stringify({
        ...oldScores,
        [group]: updated,
      })
    );

    const oldTables = JSON.parse(localStorage.getItem("laporra_group_tables") || "{}");
    localStorage.setItem(
      "laporra_group_tables",
      JSON.stringify({
        ...oldTables,
        [group]: calculated.table,
      })
    );

    fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname,
        group,
        predictions: updated,
        table: calculated.table,
        unresolvedTies: calculated.unresolvedTies,
        updatedAt: new Date().toISOString(),
      }),
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
            Mundial 2026
          </p>

          <h1 className="text-4xl font-black">
            Grup {group}
          </h1>

          <p className="mt-2 text-slate-300">
            Introdueix els resultats exactes. La classificacio es calcula en temps real.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {GROUP_LETTERS.map((letter) => (
            <a
              key={letter}
              href={`/real/groups/${letter.toLowerCase()}`}
              className={`rounded-xl px-4 py-2 text-sm font-black ${
                letter === group
                  ? "bg-yellow-400 text-black"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {letter}
            </a>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            {["Jornada 1", "Jornada 2", "Jornada 3"].map((jornada) => (
              <div key={jornada} className="mb-8">
                <h2 className="mb-4 text-2xl font-black text-yellow-300">
                  {jornada}
                </h2>

                <div className="space-y-4">
                  {matches
                    .filter((m: any) => m.jornada === jornada)
                    .map((match: any) => (
                      <div
                        key={match.id}
                        className="grid grid-cols-1 items-center gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl md:grid-cols-[1fr_auto_1fr]"
                      >
                        <div className="text-center text-xl font-black md:text-right">
                          {match.home}
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          <input
                            value={scores[match.id]?.home || ""}
                            onChange={(e) => updateScore(match.id, "home", e.target.value)}
                            className="h-14 w-16 rounded-xl border border-slate-700 bg-slate-950 text-center text-2xl font-black outline-none focus:border-yellow-400"
                            inputMode="numeric"
                          />

                          <span className="text-2xl font-black text-slate-500">
                            -
                          </span>

                          <input
                            value={scores[match.id]?.away || ""}
                            onChange={(e) => updateScore(match.id, "away", e.target.value)}
                            className="h-14 w-16 rounded-xl border border-slate-700 bg-slate-950 text-center text-2xl font-black outline-none focus:border-yellow-400"
                            inputMode="numeric"
                          />
                        </div>

                        <div className="text-center text-xl font-black md:text-left">
                          {match.away}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {previousGroup ? (
                <a
                  href={`/real/groups/${previousGroup.toLowerCase()}`}
                  className="rounded-2xl border border-slate-700 px-6 py-3 text-center font-bold text-slate-300 hover:bg-slate-900"
                >
                  Anterior: Grup {previousGroup}
                </a>
              ) : (
                <a
                  href="/"
                  className="rounded-2xl border border-slate-700 px-6 py-3 text-center font-bold text-slate-300 hover:bg-slate-900"
                >
                  Tornar a l'inici
                </a>
              )}

              {nextGroup ? (
                <a
                  href={canContinue ? `/real/groups/${nextGroup.toLowerCase()}` : "#"}
                  onClick={(e) => {
                    if (!canContinue) e.preventDefault();
                  }}
                  className={`rounded-2xl px-6 py-3 text-center font-black ${
                    canContinue
                      ? "bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 text-black transition hover:scale-105"
                      : "cursor-not-allowed bg-slate-800 text-slate-500"
                  }`}
                >
                  Continuar al Grup {nextGroup}
                </a>
              ) : (
                <a
                  href="/real/knockout"
                  onClick={(e) => { if (!canContinue) e.preventDefault(); }}
                  className={`rounded-2xl px-6 py-3 text-center font-black ${
                    canContinue
                      ? "bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 text-black transition hover:scale-105"
                      : "cursor-not-allowed bg-slate-800 text-slate-500"
                  }`}
                >
                  Finalitzar fase de grups
                </a>
              )}
            </div>

            {saved && (
              <p className="mt-4 font-bold text-emerald-400">
                Guardat automaticament
              </p>
            )}
          </div>

          <aside className="h-fit rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl lg:sticky lg:top-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Nickname
                </p>
                <p className="text-xl font-black text-yellow-300">
                  {nickname}
                </p>
              </div>

              <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-black">
                Grup {group}
              </span>
            </div>

            <h2 className="mb-4 text-2xl font-black">
              Classificacio
            </h2>

            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="w-full text-xs">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Equip</th>
                    <th className="p-3 text-center">PTS</th>
                    <th className="p-3 text-center">PJ</th>
                    <th className="p-3 text-center">GF</th>
                    <th className="p-3 text-center">DG</th>
                  </tr>
                </thead>

                <tbody>
                  {table.map((row: any, index: number) => (
                    <tr
                      key={row.team}
                      className={`border-t border-slate-800 ${
                        index < 2 ? "bg-emerald-500/10" : index === 2 ? "bg-yellow-500/10" : ""
                      }`}
                    >
                      <td className="p-3 font-black text-slate-400">{index + 1}</td>

                      <td className="p-3 font-bold">
                        <span
                          className={`mr-2 inline-block h-3 w-3 rounded-full ${
                            index < 2
                              ? "bg-emerald-400"
                              : index === 2
                              ? "bg-yellow-400"
                              : "bg-slate-500"
                          }`}
                        />
                        {row.team}
                      </td>

                      <td className="p-3 text-center text-lg font-black text-yellow-300">{row.points}</td>
                      <td className="p-3 text-center text-slate-300">{row.played}</td>
                      <td className="p-3 text-center text-slate-300">{row.goalsFor}</td>
                      <td className="p-3 text-center font-bold">{row.goalDiff > 0 ? "+" : ""}{row.goalDiff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {unresolvedTies.length > 0 && completed && (
              <div className="mt-5 rounded-2xl border border-red-500/50 bg-red-950/40 p-4">
                <p className="font-black text-red-300">
                  Empat sense resoldre
                </p>

                <p className="mt-2 text-sm text-red-100">
                  Hi ha equips empatats despres dels 5 criteris. Modifica algun resultat per desfer l'empat i poder continuar.
                </p>

                <ul className="mt-3 list-disc pl-5 text-sm text-red-100">
                  {unresolvedTies.map((tie, i) => (
                    <li key={i}>{tie.join(" / ")}</li>
                  ))}
                </ul>
              </div>
            )}

            {!completed && (
              <p className="mt-4 text-sm text-slate-400">
                Completa tots els resultats per poder continuar.
              </p>
            )}

            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Criteris: punts entre empatats, diferencia de gols entre empatats, gols entre empatats, diferencia general i gols totals.
            </p>

            <ThirdPlacesRanking currentGroup={group} currentTable={table} />
          </aside>
        </div>
      </section>
    </main>
  );
}