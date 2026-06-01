import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  const body = await request.json();

  const nickname = body.nickname;
  const validated = !!body.validated;

  if (!nickname) {
    return NextResponse.json({ ok: false, error: "Missing nickname" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("submissions")
    .update({
      validated,
      validated_at: validated ? new Date().toISOString() : null,
    })
    .eq("nickname", nickname);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, nickname, validated });
}