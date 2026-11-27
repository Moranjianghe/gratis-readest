/** Product policy switches for this distribution. Keep these in one place so
 * upstream feature code remains easy to merge. */
export const APP_NAME = 'Gratis Readest';
export const APP_BINARY_NAME = 'gratis-readest';
export const APP_PROJECT_URL = 'https://github.com/Moranjianghe/gratis-readest';
export const APP_DATA_SUBDIR = 'GratisReadest';

// Keep release endpoints with the distribution policy so a fork does not
// need to search through updater implementation code to change them.
export const APP_UPDATE_BASE_URL = `${APP_PROJECT_URL}/releases/latest/download`;
export const APP_NIGHTLY_UPDATER_FILE = '';
export const APP_NIGHTLY_UPDATES_ENABLED = false;

// Use a separate local namespace from the upstream Readest installation.
// The app identifier remains unchanged for now; changing it requires a
// platform-specific migration for settings, keychain items, and extensions.
export const APP_TELEMETRY_ENABLED = false;
export const APP_READEST_CLOUD_ENABLED = false;

// Third-party providers such as WebDAV use their own server credentials and
// must not depend on a Readest account or Readest Premium plan.
export const APP_CLOUD_SYNC_REQUIRES_PREMIUM = false;
