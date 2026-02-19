import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export default function AdBanner({ placement = 'banner_top', currentPage = 'all' }) {
  const [dismissedAds, setDismissedAds] = React.useState(() => {
    const stored = localStorage.getItem('dismissedAds');
    return stored ? JSON.parse(stored) : [];
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ads = [] } = useQuery({
    queryKey: ['ads', placement, currentPage],
    queryFn: async () => {
      const allAds = await base44.entities.Advertisement.filter({ 
        is_active: true,
        placement 
      }, '-priority');
      
      // Filter by target pages and date range
      const now = moment();
      return allAds.filter(ad => {
        const startValid = !ad.start_date || moment(ad.start_date).isBefore(now);
        const endValid = !ad.end_date || moment(ad.end_date).isAfter(now);
        const pageValid = ad.target_pages.includes('all') || ad.target_pages.includes(currentPage);
        const notDismissed = !dismissedAds.includes(ad.id);
        
        return startValid && endValid && pageValid && notDismissed;
      });
    },
    refetchInterval: 60000
  });

  const trackImpressionMutation = useMutation({
    mutationFn: (adId) => base44.entities.Advertisement.update(adId, {
      impressions: (ads.find(a => a.id === adId)?.impressions || 0) + 1
    })
  });

  const trackClickMutation = useMutation({
    mutationFn: (adId) => base44.entities.Advertisement.update(adId, {
      clicks: (ads.find(a => a.id === adId)?.clicks || 0) + 1
    })
  });

  const activeAd = ads[0];

  useEffect(() => {
    if (activeAd && !dismissedAds.includes(activeAd.id)) {
      trackImpressionMutation.mutate(activeAd.id);
    }
  }, [activeAd?.id]);

  const handleClick = (ad) => {
    trackClickMutation.mutate(ad.id);
    if (ad.link_url) {
      if (ad.link_url.startsWith('http')) {
        window.open(ad.link_url, '_blank');
      } else {
        navigate(ad.link_url);
      }
    }
  };

  const handleDismiss = (adId) => {
    const newDismissed = [...dismissedAds, adId];
    setDismissedAds(newDismissed);
    localStorage.setItem('dismissedAds', JSON.stringify(newDismissed));
  };

  if (!activeAd) return null;

  // External ad code
  if (activeAd.ad_type === 'external_ad' && activeAd.external_code) {
    return (
      <div className="relative">
        <div dangerouslySetInnerHTML={{ __html: activeAd.external_code }} />
      </div>
    );
  }

  // Internal promotion banner
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: placement === 'banner_top' ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: placement === 'banner_top' ? -20 : 20 }}
        className="relative overflow-hidden"
      >
        {activeAd.image_url ? (
          // Image-based ad
          <div 
            className="relative cursor-pointer group"
            onClick={() => handleClick(activeAd)}
          >
            <img 
              src={activeAd.image_url} 
              alt={activeAd.title}
              className="w-full h-auto max-h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            
            {activeAd.link_text && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white hover:bg-amber-50 text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg transform group-hover:scale-105 transition-all">
                  {activeAd.link_text}
                  <ExternalLink className="w-4 h-4 inline ml-2" />
                </button>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(activeAd.id);
              }}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Text-based ad
          <div 
            style={{ 
              backgroundColor: activeAd.background_color,
              color: activeAd.text_color 
            }}
            className="px-4 py-3 cursor-pointer group hover:opacity-90 transition-opacity"
            onClick={() => handleClick(activeAd)}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-bold text-sm md:text-base">{activeAd.title}</p>
                {activeAd.description && (
                  <p className="text-xs md:text-sm opacity-90">{activeAd.description}</p>
                )}
              </div>
              
              {activeAd.link_text && (
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap hover:bg-slate-100 transition-colors">
                  {activeAd.link_text}
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(activeAd.id);
                }}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}