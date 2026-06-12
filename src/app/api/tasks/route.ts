import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const tasks = await sql`SELECT * FROM tasks ORDER BY id`;
  return NextResponse.json(tasks);
}

export async function PATCH(request: Request) {
  const { id, status } = await request.json();
  await sql`UPDATE tasks SET status = ${status} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}