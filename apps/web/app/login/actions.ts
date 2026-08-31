"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login } from "@/lib/auth/service";
import { SESSION_COOKIE } from "@/lib/auth/session";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await login(email, password);
  if (!result.ok) {
    return { error: result.error };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
