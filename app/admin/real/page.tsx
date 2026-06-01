"use client";

import AdminLogoutButton from "@/components/AdminLogoutButton";

import { useEffect, useMemo, useState } from "react";
import { GROUPS, GROUP_LETTERS } from "@/lib/groupsData";
import { getThirdPlaceBracket } from "@/lib/thirdPlaceMatrix";

function buildMatches(group: string) {
  const t = GROUPS[group];

  return [
    { id: `${group}1`, group, jornada: "Jornada 1", home: t[0], away: t[1] },
    { id: `${group}2`, group, jornada: "Jornada 1", home: t[2], away: t[3] },
    { id: `${group}3`, group, jornada: "Jornada 2", home: t[0], away: t[2] },
    { id: `${group}4`, group, jornada: "Jornada 2", home: t[1], away: t[3] },
    { id: `${group}5`, group, jornada: "Jornada 3", home: t[0], away: t[3] },
    { id: `${group}6`, group, jornada: "Jornada 3", home: t[1], away: t[2] },
  ];
}

function calculateTable(group: string, scores: any) {
  const table: any = {};
  const matches = buildMatches(group);

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
    const s = scores[match.id];
    if (!s || s.home === "" || s.away === "" || s.home === undefined || s.away === undefined) return;

    const h = Number(s.home);
    const a = Number(s.away);

    table[match.home].played++;
    table[match.away].played++;

    table[match.home].goalsFor += h;
    table[match.home].goalsAgainst += a;

    table[match.away].goalsFor += a;
    table[match.away].goalsAgainst += h;

    if (h > a) table[match.home].points += 3;
    else if (a > h) table[match.away].points += 3;
    else {
      table[match.home].points += 1;
      table[match.away].points += 1;
    }
  });

  return Object.values(table)
    .map((row: any) => ({
      ...row,
      goalDiff: row.goalsFor - row.goalsAgainst,
    }))
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.localeCompare(b.team);
    });
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

function buildRound32(tables: any) {
  const thirdGroups = getQualifiedThirdGroups(tables);
  if (thirdGroups.length < 8) return [];

  const matrix = getThirdPlaceBracket(thirdGroups).pairings;

  return [
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
}

function buildKnockout(round32: any[], knockoutScores: any) {
  const byId = (list: any[], id: string) => list.find((m) => m.id === id);

  const r16 = [
    { id: "M89", round: "Vuitens", home: getWinner(byId(round32, "M74"), knockoutScores), away: getWinner(byId(round32, "M77"), knockoutScores) },
    { id: "M90", round: "Vuitens", home: getWinner(byId(round32, "M73"), knockoutScores), away: getWinner(byId(round32, "M75"), knockoutScores) },
    { id: "M91", round: "Vuitens", home: getWinner(byId(round32, "M76"), knockoutScores), away: getWinner(byId(round32, "M78"), knockoutScores) },
    { id: "M92", round: "Vuitens", home: getWinner(byId(round32, "M79"), knockoutScores), away: getWinner(byId(round32, "M80"), knockoutScores) },
    { id: "M93", round: "Vuitens", home: getWinner(byId(round32, "M83"), knockoutScores), away: getWinner(byId(round32, "M84"), knockoutScores) },
    { id: "M94", round: "Vuitens", home: getWinner(byId(round32, "M81"), knockoutScores), away: getWinner(byId(round32, "M82"), knockoutScores) },
    { id: "M95", round: "Vuitens", home: getWinner(byId(round32, "M86"), knockoutScores), away: getWinner(byId(round32, "M88"), knockoutScores) },
    { id: "M96", round: "Vuitens", home: getWinner(byId(round32, "M85"), knockoutScores), away: getWinner(byId(round32, "M87"), knockoutScores) },
  ];

  const quarters = [
    { id: "M97", round: "Quarts", home: getWinner(byId(r16, "M89"), knockoutScores), away: getWinner(byId(r16, "M90"), knockoutScores) },
    { id: "M98", round: "Quarts", home: getWinner(byId(r16, "M93"), knockoutScores), away: getWinner(byId(r16, "M94"), knockoutScores) },
    { id: "M99", round: "Quarts", home: getWinner(byId(r16, "M91"), knockoutScores), away: getWinner(byId(r16, "M92"), knockoutScores) },
    { id: "M100", round: "Quarts", home: getWinner(byId(r16, "M95"), knockoutScores), away: getWinner(byId(r16, "M96"), knockoutScores) },
  ];

  const semis = [
    { id: "M101", round: "Semifinals", home: getWinner(byId(quarters, "M97"), knockoutScores), away: getWinner(byId(quarters, "M98"), knockoutScores) },
    { id: "M102", round: "Semifinals", home: getWinner(byId(quarters, "M99"), knockoutScores), away: getWinner(byId(quarters, "M100"), knockoutScores) },
  ];

  const thirdPlace = [
    { id: "M103", round: "3r i 4t lloc", home: getLoser(byId(semis, "M101"), knockoutScores), away: getLoser(byId(semis, "M102"), knockoutScores) },
  ];

  const final = [
    { id: "M104", round: "Final", home: getWinner(byId(semis, "M101"), knockoutScores), away: getWinner(byId(semis, "M102"), knockoutScores) },
  ];

  return { r16, quarters, semis, thirdPlace, final };
}

function ThirdPlacesRanking({ tables }: any) {
  const thirds = Object.entries(tables)
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
    });

  return (
    <div className="mb-10 rounded-3xl border border-yellow-500/40 bg-slate-900 p-5">
      <h2 className="mb-2 text-2xl font-black text-yellow-300">
        Classificacio dels tercers
      </h2>

      <p className="mb-5 text-sm text-slate-300">
        Es classifiquen els 8 millors tercers. El tall esta marcat al 8e lloc.
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Grup</th>
              <th className="p-3 text-left">Equip</th>
              <th className="p-3 text-center">PTS</th>
              <th className="p-3 text-center">PJ</th>
              <th className="p-3 text-center">GF</th>
              <th className="p-3 text-center">DG</th>
              <th className="p-3 text-center">Estat</th>
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
                <td className="p-3 font-black text-slate-400">{index + 1}</td>
                <td className="p-3 font-black text-yellow-300">{row.group}</td>
                <td className="p-3 font-bold">{row.team}</td>
                <td className="p-3 text-center font-black text-yellow-300">{row.points}</td>
                <td className="p-3 text-center text-slate-300">{row.played}</td>
                <td className="p-3 text-center text-slate-300">{row.goalsFor}</td>
                <td className="p-3 text-center font-bold">
                  {row.goalDiff > 0 ? "+" : ""}
                  {row.goalDiff}
                </td>
                <td className="p-3 text-center">
                  {index < 8 ? (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300">
                      Classificat
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-black text-red-300">
                      Fora
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {thirds.length === 0 && (
              <tr>
                <td colSpan={8} className="p-5 text-center text-slate-400">
                  Encara no hi ha tercers calculats.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreInputs({ match, scores, updateScore }: any) {
  const s = scores[match.id] || {};
  const disabled = !match.home || !match.away;
  const isDraw =
    s.home !== "" &&
    s.away !== "" &&
    s.home !== undefined &&
    s.away !== undefined &&
    Number(s.home) === Number(s.away);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="mb-2 text-xs font-black text-slate-500">{match.id}</div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-right font-black">{match.home || "Pendent"}</div>

        <div className="flex items-center gap-2">
          <input
            disabled={disabled}
            value={s.home || ""}
            onChange={(e) => updateScore(match.id, "home", e.target.value)}
            className="h-11 w-12 rounded-xl bg-slate-900 text-center font-black outline-none disabled:opacity-30"
            inputMode="numeric"
          />
          <span className="text-slate-500">-</span>
          <input
            disabled={disabled}
            value={s.away || ""}
            onChange={(e) => updateScore(match.id, "away", e.target.value)}
            className="h-11 w-12 rounded-xl bg-slate-900 text-center font-black outline-none disabled:opacity-30"
            inputMode="numeric"
          />
        </div>

        <div className="font-black">{match.away || "Pendent"}</div>
      </div>

      {isDraw && (
        <div className="mt-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3">
          <p className="mb-2 text-sm font-black text-yellow-300">Qui passa?</p>
          {[match.home, match.away].map((team) => (
            <label key={team} className="mr-4 cursor-pointer text-sm">
              <input
                type="radio"
                name={`${match.id}-advancer`}
                checked={s.advancer === team}
                onChange={() => updateScore(match.id, "advancer", team)}
                className="mr-2"
              />
              {team}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminRealResultsPage() {
  const [groups, setGroups] = useState<any>({});
  const [knockout, setKnockout] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/real-results")
      .then((res) => res.json())
      .then((data) => {
        setGroups(data.groups || {});
        setKnockout(data.knockout || {});
      });
  }, []);

  const tables = useMemo(() => {
    const result: any = {};
    GROUP_LETTERS.forEach((group) => {
      result[group] = calculateTable(group, groups[group] || {});
    });
    return result;
  }, [groups]);

  const round32 = useMemo(() => {
    const allComplete = GROUP_LETTERS.every((group) => {
      const matches = buildMatches(group);
      return matches.every((m) => {
        const s = groups[group]?.[m.id];
        return s && s.home !== "" && s.away !== "" && s.home !== undefined && s.away !== undefined;
      });
    });

    if (!allComplete) return [];
    return buildRound32(tables);
  }, [tables, groups]);

  const nextRounds = useMemo(() => {
    if (!round32.length) return { r16: [], quarters: [], semis: [], thirdPlace: [], final: [] };
    return buildKnockout(round32, knockout);
  }, [round32, knockout]);

  function saveData(nextGroups: any, nextKnockout: any) {
    setSaved(false);

    fetch("/api/real-results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groups: nextGroups,
        groupTables: tables,
        knockout: nextKnockout,
        updatedAt: new Date().toISOString(),
      }),
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    });
  }

  function updateGroupScore(group: string, matchId: string, side: string, value: string) {
    const clean = value.replace(/[^0-9]/g, "");

    const nextGroups = {
      ...groups,
      [group]: {
        ...(groups[group] || {}),
        [matchId]: {
          ...(groups[group]?.[matchId] || {}),
          [side]: clean,
        },
      },
    };

    setGroups(nextGroups);
    saveData(nextGroups, knockout);
  }

  function updateKnockoutScore(matchId: string, side: string, value: string) {
    const clean = side === "advancer" ? value : value.replace(/[^0-9]/g, "");

    const nextKnockout = {
      ...knockout,
      [matchId]: {
        ...(knockout[matchId] || {}),
        [side]: clean,
      },
    };

    setKnockout(nextKnockout);
    saveData(groups, nextKnockout);
  }

  const sections = [
    ["Setzens", round32],
    ["Vuitens", nextRounds.r16],
    ["Quarts", nextRounds.quarters],
    ["Semifinals", nextRounds.semis],
    ["3r i 4t lloc", nextRounds.thirdPlace],
    ["Final", nextRounds.final],
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex justify-end">
          <AdminLogoutButton />
        </div>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-black">Resultats reals</h1>
            <p className="mt-2 text-slate-300">
              Zona admin per introduir els resultats reals del Mundial.
            </p>
          </div>

          {saved && (
            <p className="font-black text-emerald-400">
              Guardat
            </p>
          )}
        </div>

        <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-5 text-2xl font-black text-yellow-300">Fase de grups</h2>

          <div className="grid gap-6 xl:grid-cols-2">
            {GROUP_LETTERS.map((group) => (
              <div key={group} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <h3 className="mb-4 text-xl font-black text-yellow-300">Grup {group}</h3>

                <div className="space-y-3">
                  {buildMatches(group).map((match) => {
                    const s = groups[group]?.[match.id] || {};

                    return (
                      <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                        <div className="text-right font-bold">{match.home}</div>

                        <div className="flex items-center gap-2">
                          <input
                            value={s.home || ""}
                            onChange={(e) => updateGroupScore(group, match.id, "home", e.target.value)}
                            className="h-10 w-11 rounded-lg bg-slate-900 text-center font-black outline-none"
                            inputMode="numeric"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            value={s.away || ""}
                            onChange={(e) => updateGroupScore(group, match.id, "away", e.target.value)}
                            className="h-10 w-11 rounded-lg bg-slate-900 text-center font-black outline-none"
                            inputMode="numeric"
                          />
                        </div>

                        <div className="font-bold">{match.away}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                  <p className="mb-3 text-sm font-black text-slate-300">Resultats exactes</p>

                  <div className="space-y-2 text-sm">
                    {buildMatches(group).map((match) => {
                      const s = groups[group]?.[match.id] || {};

                      return (
                        <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-slate-800 pb-2 last:border-b-0">
                          <div className="text-right font-bold text-slate-300">{match.home}</div>
                          <div className="font-black text-yellow-300">
                            {s.home || "-"} - {s.away || "-"}
                          </div>
                          <div className="font-bold text-slate-300">{match.away}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <table className="mt-4 w-full text-xs">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="text-left">#</th>
                      <th className="text-left">Equip</th>
                      <th>PTS</th>
                      <th>PJ</th>
                      <th>GF</th>
                      <th>DG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables[group].map((row: any, index: number) => (
                      <tr key={row.team} className="border-t border-slate-800">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2 font-bold">{row.team}</td>
                        <td className="text-center font-black text-yellow-300">{row.points}</td>
                        <td className="text-center">{row.played}</td>
                        <td className="text-center">{row.goalsFor}</td>
                        <td className="text-center">
                          {row.goalDiff > 0 ? "+" : ""}
                          {row.goalDiff}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        <ThirdPlacesRanking tables={tables} />

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-5 text-2xl font-black text-yellow-300">Quadre eliminatori real</h2>

          {!round32.length && (
            <p className="text-slate-400">
              Completa tots els resultats de grups per generar el quadre oficial.
            </p>
          )}

          <div className="space-y-8">
            {sections.map(([title, matches]: any) => (
              <div key={title}>
                <h3 className="mb-4 text-xl font-black text-yellow-300">{title}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {matches.map((match: any) => (
                    <ScoreInputs
                      key={match.id}
                      match={match}
                      scores={knockout}
                      updateScore={updateKnockoutScore}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}