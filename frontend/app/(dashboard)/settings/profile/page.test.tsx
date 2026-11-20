import ProfileSettingsRedirect from './page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const { redirect } = jest.requireMock('next/navigation') as { redirect: jest.Mock };

describe('/settings/profile (legacy duplicate route)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('permanently redirects to the canonical /profile editor', () => {
    ProfileSettingsRedirect();
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/profile');
  });

  it('renders no editable profile UI of its own', () => {
    const result = ProfileSettingsRedirect();
    // It is a pure redirect component — nothing to render.
    expect(result).toBeUndefined();
  });
});
