import { resolveBlobUrl } from '@/utils/blob';

const PROFILE_PHOTO_PATH = 'about-me/about-me-picture-3.jpg';

/**
 * Service for profile-related assets stored in Vercel Blob.
 * Resolves known pathname URLs the same way trip covers use resolveBlobUrl.
 */
export class ProfileService {
  /**
   * Resolve the public URL for the About Me profile photo.
   */
  fetchProfilePhotoUrl(): string {
    return resolveBlobUrl(PROFILE_PHOTO_PATH);
  }
}

const PROFILE_SERVICE_KEY = '__profileService';

type GlobalWithProfileService = typeof globalThis & {
  [PROFILE_SERVICE_KEY]?: ProfileService;
};

const globalWithProfileService = globalThis as GlobalWithProfileService;

/**
 * Singleton instance of ProfileService.
 * Ensures we only create one ProfileService per Node/Next worker.
 * During dev hot reloads this guard prevents multiple instances.
 */
export const profileService =
  globalWithProfileService[PROFILE_SERVICE_KEY] ??
  (globalWithProfileService[PROFILE_SERVICE_KEY] = new ProfileService());

declare global {
  var __profileService: ProfileService | undefined;
}
