import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();

  const row = {
    nickname: body.nickname,
    submitted_at: new Date().toISOString(),
    groups: body.groups || {},
    group_tables: body.groupTables || {},
    knockout: body.knockout || {},
  };

  const { error } = await supabaseAdmin
    .from("submissions")
    .upsert(row, { onConflict: "nickname" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const nickname = body.nickname;

  if (!nickname) {
    return NextResponse.json({ ok: false, error: "Missing nickname" }, { status: 400 });
  }

  const { data: existing, error: readError } = await supabaseAdmin
    .from("submissions")
    .select("*")
    .eq("nickname", nickname)
    .single();

  if (readError || !existing) {
    return NextResponse.json({ ok: false, error: "Submission not found" }, { status: 404 });
  }

  const trashRow = {
    nickname: existing.nickname,
    submitted_at: existing.submitted_at,
    deleted_at: new Date().toISOString(),
    validated: existing.validated || false,
    validated_at: existing.validated_at || null,
    groups: existing.groups || {},
    group_tables: existing.group_tables || {},
    knockout: existing.knockout || {},
  };

  const { error: insertTrashError } = await supabaseAdmin
    .from("deleted_submissions")
    .insert(trashRow);

  if (insertTrashError) {
    return NextResponse.json({ ok: false, error: insertTrashError.message }, { status: 500 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("submissions")
    .delete()
    .eq("nickname", nickname);

  if (deleteError) {
    return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}