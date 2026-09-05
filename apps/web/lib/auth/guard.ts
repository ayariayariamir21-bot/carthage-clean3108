import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./current-user";
import { authorize, type AuthUser, type Role } from "./rbac";

type AuthUserWithPasswordFlag = AuthUser & { mustChangePassword: boolean };

async function enforceRoles(
  roles: Role[],
  allowPasswordChange = true,
): Promise<AuthUserWithPasswordFlag> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!roles.includes(user.role)) {
    redirect("/forbidden");
  }
  if (allowPasswordChange && user.mustChangePassword) {
    redirect("/auth/change-password");
  }
  return user as AuthUserWithPasswordFlag;
}

export async function requireRolePage(required: Role = "admin"): Promise<AuthUserWithPasswordFlag> {
  return enforceRoles([required]);
}

export async function requireRolesPage(roles: Role[]): Promise<AuthUserWithPasswordFlag> {
  return enforceRoles(roles);
}

export async function requireRoleApi(
  required: Role = "admin",
): Promise<AuthUserWithPasswordFlag | NextResponse> {
  const user = await getCurrentUser();
  const decision = authorize(user, required);

  if (!decision.ok) {
    if (decision.reason === "unauthenticated") {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  if (decision.user.mustChangePassword) {
    return NextResponse.json(
      { error: "Changement de mot de passe requis.", redirect: "/auth/change-password" },
      { status: 403 },
    );
  }

  return decision.user as AuthUserWithPasswordFlag;
}

export async function requireRoleAction(
  required: Role = "admin",
): Promise<AuthUserWithPasswordFlag> {
  return enforceRoles([required], false);
}

export async function requireRolesAction(roles: Role[]): Promise<AuthUserWithPasswordFlag> {
  return enforceRoles(roles, false);
}
