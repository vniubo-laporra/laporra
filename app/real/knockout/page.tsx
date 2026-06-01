"use client";

import { useEffect, useMemo, useState } from "react";
import { getThirdPlaceBracket } from "@/lib/thirdPlaceMatrix";

type Match = {
  id: string;
  round: string;
  home: string | null;
  away: string | null;
};

function getWinner(match: Match | undefined, scores: any) {
  if (!match || !match.home || !match.away) return null;

  const s = scores[match.id];
  if (!s || s.home === "" || s.away === "" || s.home === undefined || s.away === undefined) return null;

  const h = Number(s.home);
  const a = Number(s.away);

  if (h > a) return match.home;
  if (a > h) return match.away;

  return s.advancer || null;
}

function getLoser(match: Match | undefined, scores: any) {
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

function buildRound32(tables: any): Match[] {
  const thirdGroups = getQualifiedThirdGroups(tables);
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

function buildAllRounds(round32: Match[], scores: any) {
  const byId = (list: Match[], id: string) => list.find((m) => m.id === id);

  const r16: Match[] = [
    { id: "M89", round: "Vuitens", home: getWinner(byId(round32, "M74"), scores), away: getWinner(byId(round32, "M77"), scores) },
    { id: "M90", round: "Vuitens", home: getWinner(byId(round32, "M73"), scores), away: getWinner(byId(round32, "M75"), scores) },
    { id: "M91", round: "Vuitens", home: getWinner(byId(round32, "M76"), scores), away: getWinner(byId(round32, "M78"), scores) },
    { id: "M92", round: "Vuitens", home: getWinner(byId(round32, "M79"), scores), away: getWinner(byId(round32, "M80"), scores) },
    { id: "M93", round: "Vuitens", home: getWinner(byId(round32, "M83"), scores), away: getWinner(byId(round32, "M84"), scores) },
    { id: "M94", round: "Vuitens", home: getWinner(byId(round32, "M81"), scores), away: getWinner(byId(round32, "M82"), scores) },
    { id: "M95", round: "Vuitens", home: getWinner(byId(round32, "M86"), scores), away: getWinner(byId(round32, "M88"), scores) },
    { id: "M96", round: "Vuitens", home: getWinner(byId(round32, "M85"), scores), away: getWinner(byId(round32, "M87"), scores) },
  ];

  const quarters: Match[] = [
    { id: "M97", round: "Quarts", home: getWinner(byId(r16, "M89"), scores), away: getWinner(byId(r16, "M90"), scores) },
    { id: "M98", round: "Quarts", home: getWinner(byId(r16, "M93"), scores), away: getWinner(byId(r16, "M94"), scores) },
    { id: "M99", round: "Quarts", home: getWinner(byId(r16, "M91"), scores), away: getWinner(byId(r16, "M92"), scores) },
    { id: "M100", round: "Quarts", home: getWinner(byId(r16, "M95"), scores), away: getWinner(byId(r16, "M96"), scores) },
  ];

  const semis: Match[] = [
    { id: "M101", round: "Semifinals", home: getWinner(byId(quarters, "M97"), scores), away: getWinner(byId(quarters, "M98"), scores) },
    { id: "M102", round: "Semifinals", home: getWinner(byId(quarters, "M99"), scores), away: getWinner(byId(quarters, "M100"), scores) },
  ];

  const thirdPlace: Match[] = [
    { id: "M103", round: "3r i 4t lloc", home: getLoser(byId(semis, "M101"), scores), away: getLoser(byId(semis, "M102"), scores) },
  ];

  const final: Match[] = [
    { id: "M104", round: "Final", home: getWinner(byId(semis, "M101"), scores), away: getWinner(byId(semis, "M102"), scores) },
  ];

  return { r16, quarters, semis, thirdPlace, final };
}

function MatchCard({ match, scores, updateScore }: any) {
  const s = scores[match.id] || {};
  const disabled = !match.home || !match.away;

  const hasScore =
    s.home !== "" &&
    s.away !== "" &&
    s.home !== undefined &&
    s.away !== undefined;

  const isDraw = hasScore && Number(s.home) === Number(s.away);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">
          {match.id}
        </span>
        {disabled && (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-400">
            Pendent
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-right font-black">{match.home || "Pendent"}</div>

        <div className="flex items-center gap-2">
          <input
            disabled={disabled}
            value={s.home || ""}
            onChange={(e) => updateScore(match.id, "home", e.target.value)}
            className="h-12 w-14 rounded-xl bg-slate-950 text-center text-xl font-black outline-none disabled:opacity-30"
            inputMode="numeric"
          />
          <span className="text-slate-500">-</span>
          <input
            disabled={disabled}
            value={s.away || ""}
            onChange={(e) => updateScore(match.id, "away", e.target.value)}
            className="h-12 w-14 rounded-xl bg-slate-950 text-center text-xl font-black outline-none disabled:opacity-30"
            inputMode="numeric"
          />
        </div>

        <div className="font-black">{match.away || "Pendent"}</div>
      </div>

      {isDraw && (
        <div className="mt-4 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-3">
          <p className="mb-2 text-sm font-black text-yellow-300">Qui passa?</p>

          <div className="flex flex-col gap-2 text-sm">
            {[match.home, match.away].map((team) => (
              <label key={team} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`${match.id}-advancer`}
                  checked={s.advancer === team}
                  onChange={() => updateScore(match.id, "advancer", team)}
                />
                {team}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function allPlayableMatchesCompleted(matches: Match[], scores: any) {
  return matches.every((match) => {
    if (!match.home || !match.away) return false;
    const s = scores[match.id];
    if (!s || s.home === "" || s.away === "" || s.home === undefined || s.away === undefined) return false;
    if (Number(s.home) === Number(s.away) && !s.advancer) return false;
    return true;
  });
}

export default function KnockoutPage() {
  const [nickname, setNickname] = useState("");
  const [tables, setTables] = useState<any>({});
  const [scores, setScores] = useState<any>({});

  useEffect(() => {
    setNickname(localStorage.getItem("laporra_nickname") || "");
    setTables(JSON.parse(localStorage.getItem("laporra_group_tables") || "{}"));
    setScores(JSON.parse(localStorage.getItem("laporra_knockout_scores") || "{}"));
  }, []);

  const round32 = useMemo(() => {
    if (Object.keys(tables).length < 12) return [];
    return buildRound32(tables);
  }, [tables]);

  const rounds = useMemo(() => {
    if (!round32.length) return { r16: [], quarters: [], semis: [], thirdPlace: [], final: [] };
    return buildAllRounds(round32, scores);
  }, [round32, scores]);

  const champion = rounds.final[0] ? getWinner(rounds.final[0], scores) : null;

  const allMatches = [
    ...round32,
    ...rounds.r16,
    ...rounds.quarters,
    ...rounds.semis,
    ...rounds.thirdPlace,
    ...rounds.final,
  ];

  const canFinish = champion && allPlayableMatchesCompleted(allMatches, scores);

  function updateScore(matchId: string, side: string, value: string) {
    const clean = side === "advancer" ? value : value.replace(/[^0-9]/g, "");

    const updated = {
      ...scores,
      [matchId]: {
        ...scores[matchId],
        [side]: clean,
      },
    };

    setScores(updated);
    localStorage.setItem("laporra_knockout_scores", JSON.stringify(updated));

    fetch("/api/knockout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, knockout: updated, updatedAt: new Date().toISOString() }),
    });
  }

  if (Object.keys(tables).length < 12) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <h1 className="text-4xl font-black">Falten grups</h1>
        <p className="mt-4 text-slate-300">Completa els 12 grups abans de generar el quadre.</p>
        <a href="/real/groups/a" className="mt-6 inline-block rounded-2xl bg-yellow-400 px-6 py-3 font-black text-black">
          Tornar als grups
        </a>
      </main>
    );
  }

  const sections = [
    ["Setzens", round32],
    ["Vuitens", rounds.r16],
    ["Quarts", rounds.quarters],
    ["Semifinals", rounds.semis],
    ["3r i 4t lloc", rounds.thirdPlace],
    ["Final", rounds.final],
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.35em] text-yellow-300">
            Mundial 2026
          </p>
          <h1 className="text-4xl font-black">Quadre eliminatori</h1>
          <p className="mt-2 text-slate-300">
            Introdueix nomes el resultat als 90 minuts. Si hi ha empat, indica qui passa.
          </p>
        </div>

        {champion && (
          <div className="mb-8 rounded-3xl border border-yellow-400 bg-yellow-400/10 p-6 text-center">
            <p className="text-sm font-black uppercase tracking-widest text-yellow-300">Campió</p>
            <p className="mt-2 text-4xl font-black text-white">{champion}</p>
          </div>
        )}

        <div className="grid gap-8">
          {sections.map(([title, matches]: any) => (
            <div key={title}>
              <h2 className="mb-4 text-2xl font-black text-yellow-300">{title}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((match: Match) => (
                  <MatchCard key={match.id} match={match} scores={scores} updateScore={updateScore} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <a
            href={canFinish ? "/thanks" : "#"}
            onClick={(e) => {
              if (!canFinish) e.preventDefault();
            }}
            className={`rounded-2xl px-8 py-4 text-center font-black ${
              canFinish
                ? "bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 text-black transition hover:scale-105"
                : "cursor-not-allowed bg-slate-800 text-slate-500"
            }`}
          >
            Finalitzar prediccio
          </a>
        </div>
      </section>
    </main>
  );
}