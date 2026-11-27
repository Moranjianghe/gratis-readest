// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/** Gratis third-party providers use their own credentials and do not require a Readest account or Premium. */

const push = vi.fn();
const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/context/EnvContext', () => {
  const envConfig = {};
  const appService = { isDesktopApp: true, isMacOSApp: true };
  return { useEnv: () => ({ envConfig, appService }) };
});
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: auth.user }) }));
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => (s: string, o?: Record<string, unknown>) =>
    s.replace(/\{\{(\w+)\}\}/g, (_m, k) => String(o?.[k] ?? '')),
}));
vi.mock('@/hooks/useQuotaStats', () => ({
  useQuotaStats: () => ({ userProfilePlan: 'free', customizationPurchased: false }),
}));
vi.mock('@/store/settingsStore', () => {
  const state = {
    settings: {},
    requestedSubPage: null,
    setRequestedSubPage: vi.fn(),
  };
  return {
    useSettingsStore: Object.assign(() => state, { getState: () => state }),
  };
});
vi.mock('@/services/sync/dataFlow/connectors', () => ({ getFlowConnectors: () => [] }));
vi.mock('@/services/environment', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/environment')>()),
  isTauriAppPlatform: () => true,
  isWebAppPlatform: () => false,
}));
vi.mock('@/app/opds/components/CatalogManager', () => ({ CatalogManager: () => null }));
vi.mock('@/components/settings/integrations/WebDAVForm', () => ({ default: () => null }));
vi.mock('@/components/settings/integrations/GoogleDriveForm', () => ({ default: () => null }));
vi.mock('@/components/settings/integrations/S3Form', () => ({ default: () => null }));
vi.mock('@/components/settings/integrations/OneDriveForm', () => ({ default: () => null }));
vi.mock('@/components/settings/integrations/ICloudForm', () => ({ default: () => null }));

import IntegrationsPanel from '@/components/settings/IntegrationsPanel';

const premiumRows = ['Google Drive', 'WebDAV', 'S3 Storage', 'OneDrive', 'iCloud'];

afterEach(() => {
  cleanup();
  push.mockClear();
  auth.user = null;
});

describe('IntegrationsPanel third-party cloud-sync rows', () => {
  it.each(premiumRows)('opens %s without requiring a Readest account', (title) => {
    render(<IntegrationsPanel />);
    fireEvent.click(screen.getByRole('button', { name: title }));
    expect(push).not.toHaveBeenCalled();
  });

  it.each(premiumRows)('opens %s for a free account without a Premium redirect', (title) => {
    auth.user = { id: 'u1' };
    render(<IntegrationsPanel />);
    fireEvent.click(screen.getByRole('button', { name: title }));
    expect(push).not.toHaveBeenCalled();
  });
});
