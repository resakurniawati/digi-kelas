"use client";

export function getUser(): string | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const username = localStorage.getItem("username");
    if (!username) return undefined;
    return username;
  } catch {
    localStorage.removeItem("username");
    return undefined;
  }
}

export function setUsername(username: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem("username", username);
  window.dispatchEvent(new Event("digikelas:user"));
}

export function clearUsername() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("username");
  localStorage.removeItem("session_id");
  window.dispatchEvent(new Event("digikelas:user"));
}
