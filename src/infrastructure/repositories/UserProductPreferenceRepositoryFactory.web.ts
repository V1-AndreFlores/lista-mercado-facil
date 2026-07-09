import { UserProductPreferenceRepository } from "../../domain/repositories/UserProductPreferenceRepository";
import { WebUserProductPreferenceRepository } from "./WebUserProductPreferenceRepository";

export async function createUserProductPreferenceRepository(): Promise<UserProductPreferenceRepository> {
  return new WebUserProductPreferenceRepository();
}
