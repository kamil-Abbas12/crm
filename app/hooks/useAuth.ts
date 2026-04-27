"use client";

import { useMemo } from "react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function useAuth() {
  const user = useMemo(() => {
    if (typeof document === "undefined") return null;

    const token = getCookie("token");
    if (!token) return null;

    const roleCookie = getCookie("user_role");
    const nameCookie = getCookie("user_name");

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
      const payload = JSON.parse(atob(padded));

      return {
        id: payload.id as string,
        name: nameCookie || payload.name || "",
        email: payload.email as string,
        role: (roleCookie || payload.role || "agent") as "admin" | "agent",
      };
    } catch {
      return null;
    }
  }, []);

  return user;
}