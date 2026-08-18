import "server-only";

import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { ADMIN_EMAIL } from "@/src/config/brand";

export type AdminUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

type AuthEnv = {
  ADMIN_PASSWORD?: string;
};

type SessionPayload = {
  email: string;
  expiresAt: number;
};

export const ADMIN_SESSION_COOKIE = "killae_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function adminPassword(): string | null {
  const value = (env as unknown as AuthEnv).ADMIN_PASSWORD?.trim();
  return value && value.length >= 8 ? value : null;
}

export function isAdminAuthConfigured(): boolean {
  return adminPassword() !== null;
}

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<boolean> {
  const configuredPassword = adminPassword();
  if (!configuredPassword) return false;
  if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return false;

  const [providedDigest, configuredDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(password)),
    crypto.subtle.digest("SHA-256", encoder.encode(configuredPassword)),
  ]);

  const provided = new Uint8Array(providedDigest);
  const configured = new Uint8Array(configuredDigest);
  let difference = provided.length ^ configured.length;
  for (let index = 0; index < Math.max(provided.length, configured.length); index += 1) {
    difference |= (provided[index] ?? 0) ^ (configured[index] ?? 0);
  }
  return difference === 0;
}

export async function createAdminSessionCookie(secure: boolean): Promise<string> {
  const secret = adminPassword();
  if (!secret) throw new Error("ADMIN_PASSWORD no est\u00e1 configurada.");

  const payload: SessionPayload = {
    email: ADMIN_EMAIL,
    expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE * 1000,
  };
  const encodedPayload = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload, secret);
  const secureAttribute = secure ? "; Secure" : "";

  return `${ADMIN_SESSION_COOKIE}=${encodedPayload}.${signature}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_MAX_AGE}${secureAttribute}`;
}

export function clearAdminSessionCookie(secure: boolean): string {
  const secureAttribute = secure ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureAttribute}`;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const secret = adminPassword();
  if (!secret) return null;

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session) return null;

  const [encodedPayload, signature, extra] = session.split(".");
  if (!encodedPayload || !signature || extra) return null;
  if (!(await verify(encodedPayload, signature, secret))) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload)),
    ) as SessionPayload;
    if (
      payload.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
      !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      userId: `admin:${ADMIN_EMAIL.toLowerCase()}`,
      displayName: "Administraci\u00f3n KILLA\u00c9",
      email: ADMIN_EMAIL,
      fullName: "Administraci\u00f3n KILLA\u00c9",
    };
  } catch {
    return null;
  }
}

export function safeAdminReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  try {
    const url = new URL(value, "https://killae.local");
    if (url.origin !== "https://killae.local") return "/admin";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return encodeBase64Url(new Uint8Array(signature));
}

async function verify(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(signature),
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}
