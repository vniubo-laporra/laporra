import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("real_results")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({
      groups: {},
      groupTables: {},
      knockout: {},
    });
  }

  return NextResponse.json({
    groups: data?.groups || {},
    groupTables: data?.group_tables || {},
    knockout: data?.knockout || {},
    updatedAt: data?.updated_at || null,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const row = {
    id: 1,
    groups: body.groups || {},
    group_tables: body.groupTables || {},
    knockout: body.knockout || {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("real_results")
    .upsert(row, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}