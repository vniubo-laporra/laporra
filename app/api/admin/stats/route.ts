import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select("nickname, groups, knockout, validated")
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
    counts: {
      "1": 0,
      "X": 0,
      "2": 0,
      empty: 0,
    },
  };

  const champions: Record<string, number> = {};

  submissions.forEach((sub: any) => {
    const score = sub?.groups?.A?.A1;
    const pick = outcome(score);

    if (pick === "1" || pick === "X" || pick === "2") {
      inaugural.counts[pick] += 1;
    } else {
      inaugural.counts.empty += 1;
    }

    const champion = sub?.knockout?.M104?.advancer;
    if (champion) {
      champions[champion] = (champions[champion] || 0) + 1;
    }
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
    champions: Object.entries(champions)
      .map(([team, count]) => ({
        team,
        count,
        percentage: toPercent(count),
      }))
      .sort((a, b) => b.count - a.count),
  });
}