import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import {
  profileDetailFromDirectoryEntry,
  profileDetailFromPublicProfile,
} from '@/utils/profileDetailView';
import { useHome } from '@/hooks/useSession';

async function fetchOtherCitizenProfile(citizenId: string) {
  const directory = await api.municipalityCitizens();
  const entry = directory.citizens.find((citizen) => citizen.citizenId === citizenId);
  if (entry) {
    return profileDetailFromDirectoryEntry(entry);
  }

  const publicProfile = await api.citizenPublicProfile(citizenId);
  return profileDetailFromPublicProfile(publicProfile);
}

export function useGazzetta() {
  return useQuery({
    queryKey: ['gazzetta'],
    queryFn: () => api.gazzetta(),
    refetchInterval: 30_000,
  });
}

export function useProfileDetail(routeCitizenId?: string) {
  const { data: home, isLoading: homeLoading } = useHome(true);
  const ownCitizenId = home?.citizenId;
  const isOwnProfile = routeCitizenId ? routeCitizenId === ownCitizenId : true;

  return useQuery({
    queryKey: ['profile', 'detail', routeCitizenId ?? 'self'],
    queryFn: () => (isOwnProfile ? api.profileDetail() : fetchOtherCitizenProfile(routeCitizenId!)),
    enabled: routeCitizenId ? !homeLoading : true,
  });
}

export function useNotifications(scope?: 'personal' | 'global') {
  return useQuery({
    queryKey: ['notifications', scope ?? 'all'],
    queryFn: () => api.notifications(scope ? { scope } : undefined),
  });
}

export function useReferenda() {
  return useQuery({
    queryKey: ['referenda'],
    queryFn: () => api.referenda(),
    refetchInterval: 30_000,
  });
}

export function useMunicipality() {
  return useQuery({
    queryKey: ['municipality'],
    queryFn: () => api.municipality(),
  });
}

export function useMunicipalityCitizens() {
  return useQuery({
    queryKey: ['municipality', 'citizens'],
    queryFn: () => api.municipalityCitizens(),
  });
}

export function useRankings() {
  return useQuery({
    queryKey: ['rankings'],
    queryFn: () => api.rankings(),
  });
}

export function useWorkJobs() {
  return useQuery({
    queryKey: ['work', 'jobs'],
    queryFn: () => api.workJobs(),
  });
}

export function useRelazioni() {
  return useQuery({
    queryKey: ['relazioni'],
    queryFn: () => api.relazioniOverview(),
  });
}

export function useMarketplace() {
  return useQuery({
    queryKey: ['marketplace'],
    queryFn: () => api.marketplace(),
  });
}
