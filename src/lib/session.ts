import { v4 as uuid } from "uuid";

export function getSessionToken(key: string) {
  if (typeof window === "undefined") return "";
  const k = `hotshot_${key}`;
  let token = localStorage.getItem(k);
  if (!token) {
    token = uuid();
    localStorage.setItem(k, token);
  }
  return token;
}
