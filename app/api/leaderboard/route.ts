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

      const total =
        punts1x2 +
        puntsGolsExactesEquip +
        puntsTotalsEquipGrup +
        puntsGolsTotalsEquipGrup +
        puntsClassificatPrimerSegon +
        puntsTercersClassificats +
        puntsGolsSetzens;

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
      };
    })
    .sort((a: any, b: any) => b.total - a.total);

  return NextResponse.json(rows);
}