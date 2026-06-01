import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "users.json");

function readUsers() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]");
    }

    const raw = fs.readFileSync(filePath, "utf8").trim();

    if (!raw) {
      fs.writeFileSync(filePath, "[]");
      return [];
    }

    return JSON.parse(raw);
  } catch {
    fs.writeFileSync(filePath, "[]");
    return [];
  }
}

export async function GET() {
  const users = readUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const users = readUsers();

  const existingUser = users.find(
    (user: any) =>
      user.nickname?.toLowerCase() === body.nickname?.toLowerCase()
  );

  if (!existingUser) {
    users.push({
      nickname: body.nickname,
      createdAt: body.createdAt,
      results: {},
    });

    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  }

  return NextResponse.json({ ok: true });
}
