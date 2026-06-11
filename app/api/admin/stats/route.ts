import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GROUPS } from "@/lib/groupsData";
import { getThirdPlaceBracket } from "@/lib/thirdPlaceMatrix";

function isCompleteScore(score: any) {
  return score && score.home !== undefined && score.away !== undefined && score.home !== "" && score.away !== "";
}

function outcome(score: any) {
  if (!isCompleteScore(score)) return null;
  const h = Number(score.home);
  const a = Number(score.away);
  if (h > a) return "1";
  if (h < a) return "2";
  return "X";
}

function sameTeam(a: any, b: string) {
  return String(a || "").toLowerCase().trim() === b.toLowerCase();
}

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

function calculateTable(source: any, group: string) {
  const table: any = {};
  const teams = GROUPS[group];

  if (!teams) return [];

  teams.forEach((team: string) => {
    table[team] = {
      team,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
    };
  });

  for (let i = 1; i <= 6; i++) {
    const matchId = `${group}${i}`;
    const match = getMatchInfo(group, matchId);
    const score = source?.groups?.[group]?.[matchId];

    if (!match || !isCompleteScore(score)) continue;

    const h = Number(score.home);
    const a = Number(score.away);

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
  }

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

function buildTables(sub: any) {
  const tables: any = {};

  Object.keys(GROUPS).forEach((group) => {
    const saved = sub?.group_tables?.[group] || sub?.groupTables?.[group];

    if (Array.isArray(saved) && saved.length >= 4) {
      tables[group] = saved;
    } else {
      tables[group] = calculateTable(sub, group);
    }
  });

  return tables;
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

  const s = scores?.[match.id];
  if (!isCompleteScore(s)) return null;

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

function buildBracket(sub: any) {
  const tables = buildTables(sub);
  const scores = sub?.knockout || {};
  const thirdGroups = getQualifiedThirdGroups(tables);

  let matrix: any = {};
  try {
    matrix = getThirdPlaceBracket(thirdGroups).pairings;
  } catch {
    matrix = {};
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

function findSpainRound(sub: any) {
  const bracket = buildBracket(sub);
  const scores = sub?.knockout || {};
  const spain = "Spain";

  const roundOrder = [
    { name: "Setzens", ids: ["M73","M74","M75","M76","M77","M78","M79","M80","M81","M82","M83","M84","M85","M86","M87","M88"] },
    { name: "Vuitens", ids: ["M89","M90","M91","M92","M93","M94","M95","M96"] },
    { name: "Quarts", ids: ["M97","M98","M99","M100"] },
    { name: "Semifinals", ids: ["M101","M102"] },
    { name: "Final", ids: ["M104"] },
  ];

  for (const round of roundOrder) {
    const match = bracket.find((m: any) =>
      round.ids.includes(m.id) &&
      (sameTeam(m.home, spain) || sameTeam(m.away, spain))
    );

    if (!match) continue;

    const winner = getWinner(match, scores);

    if (match.id === "M104") {
      if (winner && sameTeam(winner, spain)) return "Campiona";
      return "Subcampiona";
    }

    if (!winner || !sameTeam(winner, spain)) {
      return round.name;
    }
  }

  return "Grups";
}

function detectChampion(sub: any) {
  const bracket = buildBracket(sub);
  const final = bracket.find((m: any) => m.id === "M104");
  return getWinner(final, sub?.knockout || {});
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select("nickname, groups, group_tables, knockout, validated")
    .eq("validated", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const submissions = data || [];
  const total = submissions.length;

  const inaugural = {
    matchId: "A1",
    home: "Mexico",
    away: "South Africa",
    counts: { "1": 0, "X": 0, "2": 0, empty: 0 },
  };

  const champions: Record<string, number> = {};
  const awayWinUsers: string[] = [];

  const spainStats: any = {
    Grups: 0,
    Setzens: 0,
    Vuitens: 0,
    Quarts: 0,
    Semifinals: 0,
    Subcampiona: 0,
    Campiona: 0,
  };

  submissions.forEach((sub: any) => {
    const score = sub?.groups?.A?.A1;
    const pick = outcome(score);

    if (pick === "1" || pick === "X" || pick === "2") inaugural.counts[pick] += 1;
    else inaugural.counts.empty += 1;

    if (pick === "2") awayWinUsers.push(sub.nickname);

    const champion = detectChampion(sub);
    if (champion) champions[champion] = (champions[champion] || 0) + 1;

    const spainRound = findSpainRound(sub);
    spainStats[spainRound] += 1;
  });

  const toPercent = (value: number) =>
    total > 0 ? Math.round((value / total) * 1000) / 10 : 0;

  return NextResponse.json({
    total,
    inaugural: {
      ...inaugural,
      percentages: {
        "1": toPercent(inaugural.counts["1"]),
        "X": toPercent(inaugural.counts["X"]),
        "2": toPercent(inaugural.counts["2"]),
        empty: toPercent(inaugural.counts.empty),
      },
    },
    awayWinUsers,
    spainStats,
    champions: Object.entries(champions)
      .map(([team, count]) => ({
        team,
        count,
        percentage: toPercent(count),
      }))
      .sort((a, b) => b.count - a.count),
  });
}