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
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.nickname) {
    return NextResponse.json({ error: "Missing nickname" }, { status: 400 });
  }

  const update: any = {
    groups: body.groups || {},
    group_tables: body.group_tables || body.groupTables || {},
    knockout: body.knockout || {},
  };

  const { error } = await supabaseAdmin
    .from("submissions")
    .update(update)
    .eq("nickname", body.nickname);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}