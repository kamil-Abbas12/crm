"use client";

import { useEffect, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")
  );

  return match ? decodeURIComponent(match[1]) : null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const nameCookie = getCookie("user_name");

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        setUser(null);
        setLoading(false);
        return;
      }

      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));

   setUser({
  id: String(payload.id || ""),
  name: String(payload.name || ""),
  email: String(payload.email || ""),
  role: (payload.role || "agent") as "admin" | "agent",
});
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
