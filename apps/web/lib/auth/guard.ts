import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./current-user";
import { authorize, type AuthUser, type Role } from "./rbac";

async function enforceRoles(roles: Role[]): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!roles.includes(user.role)) {
    redirect("/forbidden");
  }
  return user;
}

export async function requireRolePage(required: Role = "admin"): Promise<AuthUser> {
  return enforceRoles([required]);
}

export async function requireRolesPage(roles: Role[]): Promise<AuthUser> {
  return enforceRoles(roles);
}

export async function requireRoleApi(required: Role = "admin"): Promise<AuthUser | NextResponse> {
  const user = await getCurrentUser();
  const decision = authorize(user, required);

  if (!decision.ok) {
    if (decision.reason === "unauthenticated") {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  return decision.user;
}

export async function requireRoleAction(required: Role = "admin"): Promise<AuthUser> {
  return enforceRoles([required]);
}

export async function requireRolesAction(roles: Role[]): Promise<AuthUser> {
  return enforceRoles(roles);
}
