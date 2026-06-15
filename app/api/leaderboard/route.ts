import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getThirdPlaceBracket } from "@/lib/thirdPlaceMatrix";

const GROUPS: any = {
  A: ["Mexico", "Sud-africa", "Corea del Sud", "Txequia"],
  B: ["Canada", "Qatar", "Suissa", "Bosnia i Hercegovina"],
  C: ["Brasil", "Marroc", "Haiti", "Escocia"],
  D: ["Estats Units", "Paraguai", "Australia", "Turquia"],
  E: ["Alemanya", "Curacao", "Equador", "Costa d'Ivori"],
  F: ["Paisos Baixos", "Japo", "Tunisia", "Suecia"],
  G: ["Belgica", "Egipte", "Iran", "Nova Zelanda"],
  H: ["Espanya", "Cap Verd", "Arabia Saudita", "Uruguai"],
  I: ["Franca", "Senegal", "Iraq", "Noruega"],
  J: ["Argentina", "Algeria", "Austria", "Jordania"],
  K: ["Portugal", "Uzbekistan", "Colombia", "RD Congo"],
  L: ["Anglaterra", "Croacia", "Ghana", "Panama"],
};

function buildMatches(group: string) {
  const t = GROUPS[group];

  return [
    { id: `${group}1`, home: t[0], away: t[1] },
    { id: `${group}2`, home: t[2], away: t[3] },
    { id: `${group}3`, home: t[0], away: t[2] },
    { id: `${group}4`, home: t[1], away: t[3] },
    { id: `${group}5`, home: t[0], away: t[3] },
    { id: `${group}6`, home: t[1], away: t[2] },
  ];
}

function isScoreComplete(score: any) {
  return score && score.home !== undefined && score.away !== undefined && score.home !== "" && score.away !== "";
}

function groupIsComplete(results: any, group: string) {
  return buildMatches(group).every((match) =>
    isScoreComplete(results.groups?.[group]?.[match.id])
  );
}

function calculateTableFromScores(results: any, group: string) {
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

  buildMatches(group).forEach((match) => {
    const score = results.groups?.[group]?.[match.id];
    if (!isScoreComplete(score)) return;

    const h = Number(score.home);
    const a = Number(score.away);

    table[match.home].played += 1;
    table[match.away].played += 1;

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

  return Object.values(table).map((row: any) => ({
    ...row,
    goalDiff: row.goalsFor - row.goalsAgainst,
  }));
}

function outcome(score: any) {
  if (!isScoreComplete(score)) return null;

  const h = Number(score.home);
  const a = Number(score.away);

  if (h > a) return "1";
  if (h < a) return "2";
  return "X";
}

function score1X2(prediction: any, real: any) {
  let points = 0;

  Object.keys(GROUPS).forEach((group) => {
    buildMatches(group).forEach((match) => {
      const realOutcome = outcome(real.groups?.[group]?.[match.id]);
      const predictedOutcome = outcome(prediction.groups?.[group]?.[match.id]);

      if (realOutcome && predictedOutcome && realOutcome === predictedOutcome) {
        points += 3;
      }
    });
  });

  return points;
}

function scoreExactGoalsPerTeamPerMatch(prediction: any, real: any) {
  let points = 0;

  Object.keys(GROUPS).forEach((group) => {
    buildMatches(group).forEach((match) => {
      const realScore = real.groups?.[group]?.[match.id];
      const predictedScore = prediction.groups?.[group]?.[match.id];

      if (!isScoreComplete(realScore) || !isScoreComplete(predictedScore)) return;

      if (Number(realScore.home) === Number(predictedScore.home)) points += 2;
      if (Number(realScore.away) === Number(predictedScore.away)) points += 2;
    });
  });

  return points;
}

function scoreTeamGroupPoints(prediction: any, real: any) {
  let points = 0;

  Object.keys(GROUPS).forEach((group) => {
    if (!groupIsComplete(real, group)) return;

    const realTable: any[] = calculateTableFromScores(real, group);
    const predictedTable: any[] = calculateTableFromScores(prediction, group);

    realTable.forEach((realTeam: any) => {
      const predictedTeam = predictedTable.find((row: any) => row.team === realTeam.team);

      if (predictedTeam && Number(predictedTeam.points) === Number(realTeam.points)) {
        points += 4;
      }
    });
  });

  return points;
}

function scoreTeamGroupGoals(prediction: any, real: any) {
  let points = 0;

  Object.keys(GROUPS).forEach((group) => {
    if (!groupIsComplete(real, group)) return;

    const realTable: any[] = calculateTableFromScores(real, group);
    const predictedTable: any[] = calculateTableFromScores(prediction, group);

    realTable.forEach((realTeam: any) => {
      const predictedTeam = predictedTable.find((row: any) => row.team === realTeam.team);

      if (predictedTeam && Number(predictedTeam.goalsFor) === Number(realTeam.goalsFor)) {
        points += 4;
      }
    });
  });

  return points;
}


function scoreQualifiedFirstSecond(prediction: any, real: any) {
  let points = 0;

  Object.keys(GROUPS).forEach((group) => {
    if (!groupIsComplete(real, group)) return;

    const sortTable = (table: any[]) =>
      [...table].sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.team.localeCompare(b.team);
      });

    const realTable: any[] = sortTable(calculateTableFromScores(real, group));
    const predictedTable: any[] = sortTable(calculateTableFromScores(prediction, group));

    if (predictedTable[0]?.team && predictedTable[0]?.team === realTable[0]?.team) {
      points += 6;
    }

    if (predictedTable[1]?.team && predictedTable[1]?.team === realTable[1]?.team) {
      points += 6;
    }
  });

  return points;
}

function allGroupsComplete(real: any) {
  return Object.keys(GROUPS).every((group) => groupIsComplete(real, group));
}

function sortedGroupTable(source: any, group: string) {
  return calculateTableFromScores(source, group).sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
}

function getQualifiedThirdDetails(source: any) {
  const thirds = Object.keys(GROUPS)
    .map((group) => {
      const table = sortedGroupTable(source, group);
      const third = table[2];

      if (!third) return null;

      return {
        group,
        team: third.team,
        points: third.points,
        goalDiff: third.goalDiff,
        goalsFor: third.goalsFor,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return String(a.group).localeCompare(String(b.group));
    })
    .slice(0, 8);

  const groups = thirds.map((x: any) => x.group);

  let matrix: any = null;

  try {
    matrix = getThirdPlaceBracket(groups).pairings;
  } catch {
    return [];
  }

  return thirds.map((third: any) => {
    const thirdSlot = `3${third.group}`;

    const firstSlot = Object.keys(matrix).find(
      (key) => matrix[key] === thirdSlot
    );

    return {
      ...third,
      thirdSlot,
      firstSlot,
      bracketSlot: firstSlot ? `${firstSlot}-${thirdSlot}` : null,
    };
  });
}

function scoreThirdsQualifiedAndSlot(prediction: any, real: any) {
  if (!allGroupsComplete(real)) return 0;

  let points = 0;

  const predictedThirds = getQualifiedThirdDetails(prediction);
  const realThirds = getQualifiedThirdDetails(real);

  predictedThirds.forEach((predicted: any) => {
    const realMatch = realThirds.find((item: any) => item.team === predicted.team);

    if (!realMatch) return;

    points += 3;

    if (predicted.bracketSlot && predicted.bracketSlot === realMatch.bracketSlot) {
      points += 3;
    }
  });

  return points;
}

function scoreRound32ExactGoals(prediction: any, real: any) {
  let points = 0;

  const matches = [
    "M73","M74","M75","M76",
    "M77","M78","M79","M80",
    "M81","M82","M83","M84",
    "M85","M86","M87","M88"
  ];

  function hasValue(value: any) {
    return value !== undefined && value !== null && value !== "";
  }

  matches.forEach((matchId) => {
    const predicted = prediction?.knockout?.[matchId];
    const realMatch = real?.knockout?.[matchId];

    if (!predicted || !realMatch) return;

    if (
      hasValue(predicted.home) &&
      hasValue(realMatch.home) &&
      Number(predicted.home) === Number(realMatch.home)
    ) {
      points += 4;
    }

    if (
      hasValue(predicted.away) &&
      hasValue(realMatch.away) &&
      Number(predicted.away) === Number(realMatch.away)
    ) {
      points += 4;
    }
  });

  return points;
}


function calculateGroupTableFromScores(source: any, group: string) {
  const teams = GROUPS[group];
  const table: any = {};

  teams.forEach((team: string) => {
    table[team] = {
      team,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
    };
  });

  const matches = [
    { id: `${group}1`, home: teams[0], away: teams[1] },
    { id: `${group}2`, home: teams[2], away: teams[3] },
    { id: `${group}3`, home: teams[0], away: teams[2] },
    { id: `${group}4`, home: teams[1], away: teams[3] },
    { id: `${group}5`, home: teams[0], away: teams[3] },
    { id: `${group}6`, home: teams[1], away: teams[2] },
  ];

  matches.forEach((match) => {
    const score = source?.groups?.[group]?.[match.id];

    if (
      !score ||
      score.home === undefined ||
      score.away === undefined ||
      score.home === "" ||
      score.away === ""
    ) {
      return;
    }

    const h = Number(score.home);
    const a = Number(score.away);

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


function getWinner(match: any, scores: any) {
  if (!match || !match.home || !match.away) return null;

  const s = scores?.[match.id];

  if (!s) return null;

  const h = Number(s.home);
  const a = Number(s.away);

  if (h > a) return match.home;
  if (a > h) return match.away;

  return s.advancer || null;
}

function getLoser(match: any, scores: any) {
  const winner = getWinner(match, scores);

  if (!winner || !match) return null;

  return winner === match.home
    ? match.away
    : match.home;
}

function resolveSlot(slot: string, tables: any) {
  const pos = Number(slot[0]) - 1;
  const group = slot[1];

  return tables[group]?.[pos]?.team || null;
}

function getQualifiedThirdGroupsFromTables(tables: any) {
  return Object.entries(tables)
    .map(([group, table]: any) => {
      const third = table?.[2];

      if (!third) return null;

      return {
        group,
        points: third.points,
        goalDiff: third.goalDiff,
        goalsFor: third.goalsFor,
      };
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

function buildPredictedBracket(tables: any, scores: any) {
  const thirdGroups = getQualifiedThirdGroupsFromTables(tables);

  let matrix: any = {};

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

  const byId = (list: any[], id: string) =>
    list.find((m) => m.id === id);

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

  return [...round32, ...r16];
}

function scoreQualifiedRound16(prediction: any, real: any) {

  const round32Matches = [
    "M73","M74","M75","M76",
    "M77","M78","M79","M80",
    "M81","M82","M83","M84",
    "M85","M86","M87","M88"
  ];

  const hasAnyRealRound32Result = round32Matches.some((matchId) =>
    isScoreComplete(real?.knockout?.[matchId])
  );

  if (!hasAnyRealRound32Result) {
    return 0;
  }
  const predictedTables: any = {};
  const realTables: any = {};

  Object.keys(GROUPS).forEach((group) => {
    predictedTables[group] = calculateGroupTableFromScores(prediction, group);
    realTables[group] = calculateGroupTableFromScores(real, group);
  });

  const predictedBracket = buildPredictedBracket(predictedTables, prediction?.knockout || {});
  const realBracket = buildPredictedBracket(realTables, real?.knockout || {});

  const predictedRound16 = predictedBracket.filter((m: any) => m.round === "Vuitens");
  const realRound16 = realBracket.filter((m: any) => m.round === "Vuitens");

  if (!realRound16.length) return 0;

  const realTeams = realRound16.flatMap((m: any) => [m.home, m.away]).filter(Boolean);

  let points = 0;

  predictedRound16.forEach((match: any) => {
    ["home", "away"].forEach((side) => {
      const team = match[side];
      if (!team) return;

      const qualifies = realTeams.includes(team);
      if (!qualifies) return;

      points += 6;

      const realSameMatch = realRound16.find((m: any) => m.id === match.id);

      if (realSameMatch && (side === "home" ? realSameMatch.home : realSameMatch.away) === team) {
        points += 6;
      }
    });
  });

  return points;
}
export async function GET() {
  const { data: submissions, error: submissionsError } = await supabaseAdmin
    .from("submissions")
    .select("*")
    .eq("validated", true);

  if (submissionsError) {
    return NextResponse.json({ error: submissionsError.message }, { status: 500 });
  }

  const { data: realRow, error: realError } = await supabaseAdmin
    .from("real_results")
    .select("*")
    .eq("id", 1)
    .single();

  if (realError) {
    return NextResponse.json([]);
  }

  const real = {
    groups: realRow?.groups || {},
    groupTables: realRow?.group_tables || {},
    knockout: realRow?.knockout || {},
  };

  const rows = (submissions || [])
    .map((item: any) => {
      const prediction = {
        groups: item.groups || {},
        groupTables: item.group_tables || {},
        knockout: item.knockout || {},
      };

      const punts1x2 = score1X2(prediction, real);
      const puntsGolsExactesEquip = scoreExactGoalsPerTeamPerMatch(prediction, real);
      const puntsTotalsEquipGrup = scoreTeamGroupPoints(prediction, real);
      const puntsGolsTotalsEquipGrup = scoreTeamGroupGoals(prediction, real);
      const puntsClassificatPrimerSegon = scoreQualifiedFirstSecond(prediction, real);
      const puntsTercersClassificats = scoreThirdsQualifiedAndSlot(prediction, real);
      const puntsGolsSetzens = scoreRound32ExactGoals(prediction, real);
      const puntsClassificatVuitens = scoreQualifiedRound16(prediction, real);

      const total =
        punts1x2 +
        puntsGolsExactesEquip +
        puntsTotalsEquipGrup +
        puntsGolsTotalsEquipGrup +
        puntsClassificatPrimerSegon +
        puntsTercersClassificats +
        puntsGolsSetzens +
        puntsClassificatVuitens;

      return {
        nickname: item.nickname,
        total,
        punts1x2,
        puntsGolsExactesEquip,
        puntsTotalsEquipGrup,
        puntsGolsTotalsEquipGrup,
        puntsClassificatPrimerSegon,
        puntsTercersClassificats,
        puntsGolsSetzens,
        puntsClassificatVuitens,
      };
    })
    .sort((a: any, b: any) => b.total - a.total);

  return NextResponse.json(rows);
}
