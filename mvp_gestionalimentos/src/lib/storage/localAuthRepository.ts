/**
 * `localStorage` implementation of the auth repository (RF-01, RF-02, RNF-03).
 *
 * Passwords are never stored: only a salted PBKDF2 derivative is kept. This is
 * a mitigation, not production security: anyone with access to the browser
 * profile can read or edit `localStorage`, and there is no server to enforce
 * anything. Real authentication is out of scope for the MVP.
 */
import { AuthRepository } from "./authRepository";
import { User, Session } from "@/types";
import { readJson, readJsonList, removeKey, writeJson } from "./safeStorage";
import { storedSessionSchema, storedUserSchema } from "./schemas";

const USERS_KEY = "gestionalo:users";
const SESSION_KEY = "gestionalo:session";
const STATS_KEY_PREFIX = "gestionalo:stats:";

interface StoredUser extends User {
  passwordHash: string; // hex
  salt: string; // hex
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return { hash: toHex(derivedBits), salt: toHex(salt.buffer as ArrayBuffer) };
}

/** Strips the credential fields so they never leave the repository. */
function toPublicUser({ id, name, email, createdAt }: StoredUser): User {
  return { id, name, email, createdAt };
}

export class LocalAuthRepository implements AuthRepository {
  private readUsers(): StoredUser[] {
    return readJsonList(USERS_KEY, storedUserSchema);
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const users = this.readUsers();
    const emailNorm = email.trim().toLowerCase();
    if (users.find((u) => u.email.toLowerCase() === emailNorm)) {
      throw new Error("El correo ya está registrado");
    }
    const { hash, salt } = await hashPassword(password);
    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: emailNorm,
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
    };
    users.push(user);
    writeJson(USERS_KEY, users);
    writeJson(`${STATS_KEY_PREFIX}${user.id}`, { rescued: 0, wasted: 0 });
    return toPublicUser(user);
  }

  async login(email: string, password: string): Promise<Session> {
    const users = this.readUsers();
    const emailNorm = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === emailNorm);
    // Same message for "no such account" and "wrong password": do not reveal which emails exist.
    if (!user) {
      throw new Error("Credenciales inválidas");
    }
    const { hash } = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      throw new Error("Credenciales inválidas");
    }
    const session: Session = { userId: user.id };
    writeJson(SESSION_KEY, session);
    return session;
  }

  async getSession(): Promise<Session | null> {
    return readJson<Session | null>(SESSION_KEY, storedSessionSchema, null);
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = this.readUsers().find((u) => u.id === userId);
    return user ? toPublicUser(user) : null;
  }

  /** Only the session is removed: foods and stats must survive logout (RNF-05). */
  async logout(): Promise<void> {
    removeKey(SESSION_KEY);
  }
}
