import { useQuery } from '@tanstack/react-query';
import { fetchDirectoryPeople } from './googleDirectory';

export const useDirectoryQuery = (accessToken?: string) =>
  useQuery({
    queryKey: ['directory', accessToken],
    enabled: Boolean(accessToken),
    queryFn: () => fetchDirectoryPeople(accessToken as string),
    staleTime: 1000 * 60 * 10
  });
