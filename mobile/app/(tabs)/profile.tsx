import { Screen } from '../../src/components/primitives/Screen';
import { ProfileHub } from '../../src/components/profile/ProfileHub';
import { RequireAuth } from '../../src/components/RequireAuth';

export default function ProfileScreen() {
  return (
    <RequireAuth returnTo="/(tabs)/profile">
      <Screen scroll>
        <ProfileHub />
      </Screen>
    </RequireAuth>
  );
}
