"use client";
// Keep context identity separate from fast-refreshing component implementations.
import { createContext } from "react";
import type { AccessRole, BusinessMember } from "../../lib/access-control";
export type AccessContextValue = {
  mode: "demo" | "supabase"; loading: boolean; error: string; member: BusinessMember | null; members: BusinessMember[];
  businesses: { id: string; name: string }[]; allowed: (view: string) => boolean; manage: boolean;
  saveMember: (member: BusinessMember) => Promise<void>; invite: (name: string, email: string, role: AccessRole) => Promise<void>;
  preview: (id: string) => void; switchBusiness: (id: string) => Promise<void>; signOut: () => Promise<void>;
};
export const AccessContext = createContext<AccessContextValue | null>(null);
