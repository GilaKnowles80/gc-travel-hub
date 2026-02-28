import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useMarkup() {
  const { data: settings } = useQuery({
    queryKey: ['markup-settings'],
    queryFn: async () => {
      const results = await base44.entities.PackageMarkupSettings.filter({ is_active: true });
      return results[0] || null;
    },
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });

  const applyMarkup = (price, type = 'flight') => {
    if (!price || !settings) return price;
    let pct = 0;
    if (type === 'flight') pct = settings.flight_markup_percentage || 0;
    else if (type === 'hotel') pct = settings.hotel_markup_percentage || 0;
    else if (type === 'tour') pct = settings.tour_markup_percentage || 0;
    else if (type === 'bus' || type === 'ferry' || type === 'train' || type === 'car' || type === 'cruise') {
      // Use flight markup as a general transport markup
      pct = settings.flight_markup_percentage || 0;
    }
    return price * (1 + pct / 100);
  };

  const markupPct = settings?.flight_markup_percentage || 0;

  return { applyMarkup, settings, markupPct };
}