import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Fetches the PayMongo PUBLIC key + mode (live/test) for client-side PayMongo.js usage.
// The public key is safe to expose client-side; the secret key stays server-side only.
export function usePayMongoConfig() {
  return useQuery({
    queryKey: ['paymongoConfig'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPayMongoConfig', {});
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

export default usePayMongoConfig;