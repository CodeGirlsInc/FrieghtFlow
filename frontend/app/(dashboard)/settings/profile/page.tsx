import { redirect } from 'next/navigation';

/**
 * Canonical profile editing lives at a single route: `/profile`
 * (see `app/(dashboard)/profile/page.tsx`).
 *
 * This route previously duplicated the name + Stellar-wallet forms and also
 * repeated the password form that `/settings` already provides, giving two
 * competing "edit your profile" pages. It now permanently redirects to the
 * canonical page so there is one unambiguous place to edit profile data.
 * See issue FE-130.
 */
export default function ProfileSettingsRedirect() {
  redirect('/profile');
}
