import type { Role } from "@/lib/auth/rbac";

export interface TestUserSeed {
  email: string;
  password: string;
  role: Role;
  mustChangePassword: boolean;
  isActive: boolean;
}

export const TEST_USERS: TestUserSeed[] = [
  {
    email: "admin@example.com",
    password: "AdminPass123!",
    role: "admin",
    mustChangePassword: false,
    isActive: true,
  },
  {
    email: "supervisor@example.com",
    password: "SupervisorPass123!",
    role: "supervisor",
    mustChangePassword: false,
    isActive: true,
  },
  {
    email: "agent@example.com",
    password: "AgentPass123!",
    role: "agent",
    mustChangePassword: false,
    isActive: true,
  },
  {
    email: "newadmin@example.com",
    password: "InitialPass123!",
    role: "admin",
    mustChangePassword: true,
    isActive: true,
  },
  {
    email: "disabled@example.com",
    password: "DisabledPass123!",
    role: "agent",
    mustChangePassword: false,
    isActive: false,
  },
  {
    email: "ratelimit@example.com",
    password: "RateLimitPass123!",
    role: "agent",
    mustChangePassword: false,
    isActive: true,
  },
];
