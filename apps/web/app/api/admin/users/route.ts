import { NextResponse } from "next/server";
import { requireRoleApi } from "@/lib/auth/guard";
import { dbAgentRepository } from "@/lib/auth/agents";

export async function GET() {
  const result = await requireRoleApi("admin");
  if (result instanceof NextResponse) {
    return result;
  }

  const agents = await dbAgentRepository.listAgents();
  return NextResponse.json({ users: agents });
}
