import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get("nickname");

  if (!nickname) {
    return NextResponse.json({ error: "Missing nickname" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select("*")
    .eq("nickname", nickname)
    .eq("validated", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }

  return NextResponse.json({
    nickname: data.nickname,
    submittedAt: data.submitted_at,
    groups: data.groups || {},
    groupTables: data.group_tables || {},
    knockout: data.knockout || {},
  });
}