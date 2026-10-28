import { User, Session } from "@/types";

export interface AuthRepository {
  register(name: string, email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<Session>;
  getSession(): Promise<Session | null>;
  getUserById(userId: string): Promise<User | null>;
  logout(): Promise<void>;
}
