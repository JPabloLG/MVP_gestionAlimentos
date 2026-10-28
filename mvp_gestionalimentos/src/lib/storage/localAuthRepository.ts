import { AuthRepository } from "./authRepository";
import { User, Session } from "@/types";

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

export class LocalAuthRepository implements AuthRepository {
  private readUsers(): StoredUser[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as StoredUser[];
    } catch {
      return [];
    }
  }

  private writeUsers(users: StoredUser[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
    this.writeUsers(users);
    // initialize stats
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `${STATS_KEY_PREFIX}${user.id}`,
        JSON.stringify({ rescued: 0, wasted: 0 })
      );
    }
    const { passwordHash: _ph, salt: _s, ...publicUser } = user;
    return publicUser as User;
  }

  async login(email: string, password: string): Promise<Session> {
    const users = this.readUsers();
    const emailNorm = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === emailNorm);
    if (!user) {
      throw new Error("Credenciales inválidas");
    }
    const { hash } = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      throw new Error("Credenciales inválidas");
    }
    const session: Session = { userId: user.id };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return session;
  }

  async getSession(): Promise<Session | null> {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    const users = this.readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;
    const { passwordHash: _ph, salt: _s, ...publicUser } = user;
    return publicUser as User;
  }

  async logout(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
  }
}
