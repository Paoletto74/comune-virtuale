import { useMe } from '@/hooks/useSession';
import { isAdminFromRoles } from '@/utils/adminHelpers';

export function useIsAdmin(): boolean {
  const { data } = useMe();
  return isAdminFromRoles(data?.roles);
}
