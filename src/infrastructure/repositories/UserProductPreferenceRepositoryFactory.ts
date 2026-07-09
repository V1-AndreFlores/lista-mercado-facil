import { UserProductPreferenceRepository } from "../../domain/repositories/UserProductPreferenceRepository";
import { initializeDatabase } from "../database/database";
import { SQLiteUserProductPreferenceRepository } from "./SQLiteUserProductPreferenceRepository";

export async function createUserProductPreferenceRepository(): Promise<UserProductPreferenceRepository> {
  await initializeDatabase();
  return new SQLiteUserProductPreferenceRepository();
}
