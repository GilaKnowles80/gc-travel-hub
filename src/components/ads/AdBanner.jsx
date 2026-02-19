import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import moment from 'moment';

export default function AdBanner({ placement = 'sidebar', pageName }) {
  const [dismissed, setDismissed] = React.useState([]);

  const { data: ads = [] } = useQuery({
    queryKey: ['advertisements', placement, pageName],
    queryFn: () => base44.entities.Advertisement.filter({ 
      is_active: true,
      placement 
    }, '-priority'),
  });

  const trackImpressionMutation = useMutation({
    mutationFn: (adId) => base44.entities.Advertisement.update(adId, {
      impression_count: (ads.find(a => a.id === adId)?.impression_count || 0) + 1
    }),
  });

  const trackClickMutation = useMutation({
    mutationFn: (adId) => base44.entities.Advertisement.update(adId, {
      click_count: (ads.find(a => a.id === adId)?.click_count || 0) + 1
    }),
  });

  // Filter ads by date range and target pages
  const activeAds = ads.filter(ad => {
    const now = moment();
    const isInDateRange = (!ad.start_date || moment(ad.start_date).isBefore(now)) &&
                          (!ad.end_date || moment(ad.end_date).isAfter(now));
    const isTargetPage = !ad.target_pages?.length || ad.target_pages.includes(pageName) || ad.target_pages.includes('all');
    const notDismissed = !dismissed.includes(ad.id);
    
    return isInDateRange && isTargetPage && notDismissed;
  });

  // Track impressions
  useEffect(() => {
    activeAds.forEach(ad => {
      trackImpressionMutation.mutate(ad.id);
    });
  }, [activeAds.map(a => a.id).join(',')]);

  if (activeAds.length === 0) return null;

  const ad = activeAds[0]; // Show highest priority ad

  const handleClick = () => {
    trackClickMutation.mutate(ad.id);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setDismissed([...dismissed, ad.id]);
  };

  // Internal Banner
  if (ad.ad_type === 'internal_banner') {
    return (
      <div className="relative group">
        <a
          href={ad.banner_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
        >
          {ad.banner_image_url && (
            <img 
              src={ad.banner_image_url} 
              alt={ad.title}
              className="w-full h-auto"
            />
          )}
          {ad.banner_text && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 text-center font-bold">
              {ad.banner_text}
            </div>
          )}
        </a>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // External Script (Google AdSense, etc.)
  if (ad.ad_type === 'external_script' || ad.ad_type === 'google_adsense') {
    return (
      <div 
        className="relative rounded-2xl overflow-hidden bg-slate-50 p-4 min-h-[100px] flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: ad.external_script }}
      />
    );
  }

  return null;
}