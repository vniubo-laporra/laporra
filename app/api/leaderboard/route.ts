import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

      const total =
        punts1x2 +
        puntsGolsExactesEquip +
        puntsTotalsEquipGrup +
        puntsGolsTotalsEquipGrup;

      return {
        nickname: item.nickname,
        total,
        punts1x2,
        puntsGolsExactesEquip,
        puntsTotalsEquipGrup,
        puntsGolsTotalsEquipGrup,
      };
    })
    .sort((a: any, b: any) => b.total - a.total);

  return NextResponse.json(rows);
}