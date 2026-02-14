import React, { useState, useCallback, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartTourLoader({ destination, startDate, endDate, children }) {
  const observerTarget = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['smart-tours', destination, startDate, endDate],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await base44.functions.invoke('searchToursAMADEUS', {
        destination,
        startDate,
        endDate,
        page: pageParam,
        limit: 20
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: !!destination && !!startDate && !!endDate
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tours = data?.pages.flatMap(page => page.data) || [];

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour, index) => (
          <motion.div
            key={`${tour.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {children(tour)}
          </motion.div>
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="flex justify-center py-6">
        {isFetchingNextPage && (
          <Loader2 className="w-6 h-6 animate-spin text-green-500" />
        )}
      </div>
    </div>
  );
}