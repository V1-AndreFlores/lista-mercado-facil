import { UserProductPreference } from '../entities/UserProductPreference';

export interface UserProductPreferenceRepository {
  getPreference(productNormalizedName: string, marketId?: string): Promise<UserProductPreference | null>;
  savePreference(preference: UserProductPreference): Promise<void>;
}
